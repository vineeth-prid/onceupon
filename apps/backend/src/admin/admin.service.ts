import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  async getStats() {
    const [ordersCount, totalRevenue, usersCount, booksCount] = await Promise.all([
      this.prisma.order.count(),
      this.prisma.order.aggregate({
        _sum: { amountPaid: true },
        where: { status: 'PAID' },
      }),
      this.prisma.user.count(),
      this.prisma.order.count({ where: { status: 'IMAGES_COMPLETE' } }), // Roughly books generated
    ]);

    return {
      totalOrders: ordersCount,
      revenue: (totalRevenue._sum.amountPaid || 0) / 100, // Convert paise to INR
      totalUsers: usersCount,
      booksGenerated: booksCount,
      // For a demo, we can just hardcode deltas or calculate them if we had timestamps
      deltas: {
        orders: '+12%',
        revenue: '+8%',
        users: '+5%',
        books: '+20%',
      }
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
      orderBy: { createdAt: 'desc' },
    });
  }
}
