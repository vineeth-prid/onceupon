import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  async getStats() {
    // Revenue: count all orders where payment was actually received
    // (amountPaid > 0), regardless of status — payments can happen at PREVIEW_READY
    // before the status transitions to PAID
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

    // Calculate 30-day deltas for real trend data
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
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getAllUsers() {
    return this.prisma.user.findMany({
      include: {
        orders: {
          select: { id: true, amountPaid: true, status: true, createdAt: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

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
}
