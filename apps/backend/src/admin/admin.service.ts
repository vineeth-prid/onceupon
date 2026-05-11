import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { ORCHESTRATOR_QUEUE, JobName } from '../queue/queue.constants';
import { EmailService } from '../email/email.service';

@Injectable()
export class AdminService {
  private readonly logger = new Logger(AdminService.name);

  constructor(
    private readonly prisma: PrismaService,
    @InjectQueue(ORCHESTRATOR_QUEUE) private readonly queue: Queue,
    private readonly emailService: EmailService,
  ) {}

  async getStats() {
    // Revenue: count all orders where payment was actually received
    // (amountPaid > 0), regardless of status
    const paidFilter = { amountPaid: { not: null, gt: 0 } } as any;

    // Statuses that indicate book generation has completed (at least images done)
    const bookCompletedStatuses = [
      'IMAGES_COMPLETE', 'PDF_GENERATING', 'PREVIEW_READY',
      'PAYMENT_PENDING', 'PAID', 'PRINTING', 'SHIPPED', 'DELIVERED',
    ];

    const [ordersCount, totalRevenue, usersCount, booksCount] = await Promise.all([
      this.prisma.order.count(),
      this.prisma.order.aggregate({
        _sum: { amountPaid: true },
        where: paidFilter,
      }),
      this.prisma.user.count(),
      this.prisma.order.count({
        where: { status: { in: bookCompletedStatuses as any } },
      }),
    ]);

    // Calculate 30-day deltas for real trend data (from main branch — functionally better)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const sixtyDaysAgo = new Date();
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

    const [recentOrders, previousOrders, recentRevenue, previousRevenue] = await Promise.all([
      this.prisma.order.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
      this.prisma.order.count({ where: { createdAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo } } }),
      this.prisma.order.aggregate({
        _sum: { amountPaid: true },
        where: { ...paidFilter, createdAt: { gte: thirtyDaysAgo } },
      }),
      this.prisma.order.aggregate({
        _sum: { amountPaid: true },
        where: { ...paidFilter, createdAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo } },
      }),
    ]);

    const calcDelta = (current: number, previous: number) => {
      if (previous === 0) return current > 0 ? '+100%' : '+0%';
      const pct = ((current - previous) / previous) * 100;
      return `${pct >= 0 ? '+' : ''}${pct.toFixed(0)}%`;
    };

    return {
      totalOrders: ordersCount,
      revenue: (totalRevenue._sum.amountPaid || 0) / 100,
      totalUsers: usersCount,
      booksGenerated: booksCount,
      deltas: {
        orders: calcDelta(recentOrders, previousOrders),
        revenue: calcDelta(
          recentRevenue._sum.amountPaid || 0,
          previousRevenue._sum.amountPaid || 0,
        ),
        users: '+0%',
        books: '+0%',
      },
    };
  }

  async getAllOrders() {
    return this.prisma.order.findMany({
      include: {
        user: { select: { firstName: true, lastName: true, email: true } },
        pages: { select: { id: true, pageNumber: true, imageUrl: true, status: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getAllUsers() {
    // Enhanced from main branch — includes order data per user
    return this.prisma.user.findMany({
      include: {
        orders: {
          select: { id: true, amountPaid: true, status: true, createdAt: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // ── New from main: individual user management ──

  async getUserById(id: string) {
    return this.prisma.user.findUniqueOrThrow({
      where: { id },
      include: {
        orders: {
          include: {
            pages: { select: { id: true, pageNumber: true, imageUrl: true, status: true } },
          },
          orderBy: { createdAt: 'desc' },
        },
        addresses: true,
      },
    });
  }

  async updateUserRole(id: string, role: string) {
    return this.prisma.user.update({
      where: { id },
      data: { role: role as any },
    });
  }

  async deleteUser(id: string) {
    // Delete user's orders first (cascade should handle pages), then user
    await this.prisma.order.deleteMany({ where: { userId: id } });
    return this.prisma.user.delete({ where: { id } });
  }

  // ── Preserved from our branch: Quick Action methods ──

  /**
   * Process Pending Orders: finds orders stuck in early pipeline stages
   * and re-queues them for processing.
   */
  async processPendingOrders(): Promise<{ processed: number; orderIds: string[] }> {
    const pendingOrders = await this.prisma.order.findMany({
      where: {
        status: {
          in: ['CREATED', 'STORY_GENERATING', 'IMAGES_GENERATING'],
        },
      },
      select: { id: true, status: true },
      orderBy: { createdAt: 'asc' },
    });

    const orderIds: string[] = [];

    for (const order of pendingOrders) {
      try {
        await this.queue.add(
          JobName.PROCESS_ORDER,
          { orderId: order.id },
          { jobId: `admin_process_${order.id}_${Date.now()}` },
        );
        orderIds.push(order.id);
        this.logger.log(`Re-queued pending order ${order.id} (status: ${order.status})`);
      } catch (error) {
        this.logger.error(`Failed to re-queue order ${order.id}: ${(error as Error).message}`);
      }
    }

    return { processed: orderIds.length, orderIds };
  }

  /**
   * Retry Failed Generations: finds orders with FAILED status
   * and re-queues them. Also resets any FAILED pages.
   */
  async retryFailedGenerations(): Promise<{ retried: number; orderIds: string[] }> {
    const failedOrders = await this.prisma.order.findMany({
      where: { status: 'FAILED' },
      select: { id: true, paymentId: true },
      orderBy: { createdAt: 'desc' },
    });

    const orderIds: string[] = [];

    for (const order of failedOrders) {
      try {
        await this.prisma.page.updateMany({
          where: { orderId: order.id, status: 'FAILED' },
          data: { status: 'PENDING' },
        });

        const jobName = order.paymentId ? JobName.COMPLETE_ORDER : JobName.PROCESS_ORDER;

        await this.prisma.order.update({
          where: { id: order.id },
          data: { status: order.paymentId ? 'PAID' : 'CREATED' },
        });

        await this.queue.add(
          jobName,
          { orderId: order.id },
          { jobId: `admin_retry_${order.id}_${Date.now()}` },
        );

        orderIds.push(order.id);
        this.logger.log(`Retried failed order ${order.id} via ${jobName}`);
      } catch (error) {
        this.logger.error(`Failed to retry order ${order.id}: ${(error as Error).message}`);
      }
    }

    return { retried: orderIds.length, orderIds };
  }

  /**
   * Send Bulk Notification: sends book-ready emails to all users
   * with completed orders who have an email.
   */
  async sendBulkNotification(): Promise<{ sent: number; failed: number }> {
    const completedOrders = await this.prisma.order.findMany({
      where: {
        status: { in: ['ORDER_CONFIRMED', 'DELIVERED', 'SHIPPED', 'PRINTING'] },
      },
      include: {
        user: { select: { email: true, firstName: true } },
      },
    });

    let sent = 0;
    let failed = 0;

    for (const order of completedOrders) {
      const email = order.user?.email || order.email;
      if (!email) continue;

      const storyTitle = (order.storyJson as any)?.title || `${order.childName}'s Adventure`;

      try {
        await this.emailService.sendBookReadyEmail({
          to: email,
          childName: order.childName,
          storyTitle,
          orderId: order.id,
        });
        sent++;
        this.logger.log(`Bulk notification sent to ${email} for order ${order.id}`);
      } catch (error) {
        failed++;
        this.logger.error(`Bulk notification failed for ${email}: ${(error as Error).message}`);
      }
    }

    return { sent, failed };
  }

  /**
   * Export Monthly Report: aggregates stats for the current month.
   */
  async getMonthlyReport(): Promise<{
    month: string;
    totalOrders: number;
    paidOrders: number;
    failedOrders: number;
    totalRevenue: number;
    newUsers: number;
    booksGenerated: number;
    orders: any[];
  }> {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    const monthFilter = {
      createdAt: { gte: startOfMonth, lte: endOfMonth },
    };

    const [totalOrders, paidOrders, failedOrders, revenueResult, newUsers, booksGenerated, orders] =
      await Promise.all([
        this.prisma.order.count({ where: monthFilter }),
        this.prisma.order.count({
          where: { ...monthFilter, status: { in: ['PAID', 'ORDER_CONFIRMED', 'PRINTING', 'SHIPPED', 'DELIVERED'] } },
        }),
        this.prisma.order.count({
          where: { ...monthFilter, status: 'FAILED' },
        }),
        this.prisma.order.aggregate({
          where: {
            ...monthFilter,
            amountPaid: { not: null },
            status: { in: ['PAID', 'ORDER_CONFIRMED', 'PRINTING', 'SHIPPED', 'DELIVERED'] },
          },
          _sum: { amountPaid: true },
        }),
        this.prisma.user.count({ where: { createdAt: { gte: startOfMonth, lte: endOfMonth } } }),
        this.prisma.order.count({
          where: {
            ...monthFilter,
            status: { in: ['PREVIEW_READY', 'PAID', 'ORDER_CONFIRMED', 'PRINTING', 'SHIPPED', 'DELIVERED'] },
          },
        }),
        this.prisma.order.findMany({
          where: monthFilter,
          include: {
            user: { select: { firstName: true, lastName: true, email: true } },
          },
          orderBy: { createdAt: 'desc' },
        }),
      ]);

    const monthName = now.toLocaleString('en-IN', { month: 'long', year: 'numeric' });

    return {
      month: monthName,
      totalOrders,
      paidOrders,
      failedOrders,
      totalRevenue: (revenueResult._sum.amountPaid || 0) / 100,
      newUsers,
      booksGenerated,
      orders,
    };
  }

  async getMessages() {
    return this.prisma.contactMessage.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async markMessageAsRead(id: string) {
    return this.prisma.contactMessage.update({
      where: { id },
      data: { isRead: true },
    });
  }
}
