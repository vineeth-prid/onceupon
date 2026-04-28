import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateOrderInput, CreateFamilyOrderInput, OrderStatus, STATUS_TRANSITIONS } from '@bookmagic/shared';

@Injectable()
export class OrdersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateOrderInput & { email?: string }, userId?: string) {
    return this.prisma.order.create({
      data: {
        childName: dto.childName,
        childAge: dto.childAge,
        childGender: dto.childGender,
        theme: dto.theme,
        illustrationStyle: dto.illustrationStyle || 'disney-character',
        customStoryPrompt: dto.customStoryPrompt,
        photoUrl: dto.photoUrl,
        email: (dto as any).email,
        status: 'CREATED',
        ...(userId ? { userId } : {}),
      },
    });
  }

  async createFamilyOrder(dto: CreateFamilyOrderInput & { email?: string }, userId?: string) {
    // Find the main child member to populate backward-compatible fields
    const mainChild = dto.familyMembers.find((m) => m.role === 'MAIN_CHILD');
    if (!mainChild) {
      throw new BadRequestException('Family must include a MAIN_CHILD member');
    }

    return this.prisma.$transaction(async (tx: any) => {
      const order = await tx.order.create({
        data: {
          childName: mainChild.name,
          childAge: mainChild.age || dto.childAge,
          childGender: (mainChild.gender as any) || dto.childGender,
          theme: dto.theme,
          illustrationStyle: dto.illustrationStyle || 'disney-character',
          customStoryPrompt: dto.customStoryPrompt,
          photoUrl: mainChild.croppedPhotoUrl,
          familyMode: true,
          groupPhotoUrl: dto.groupPhotoUrl,
          email: dto.email,
          status: 'CREATED',
          ...(userId ? { userId } : {}),
        },
      });

      // Create FamilyMember records
      for (const member of dto.familyMembers) {
        await tx.familyMember.create({
          data: {
            orderId: order.id,
            role: member.role as any,
            name: member.name,
            age: member.age,
            gender: member.gender,
            croppedPhotoUrl: member.croppedPhotoUrl,
            sortOrder: member.sortOrder,
          },
        });
      }

      return tx.order.findUnique({
        where: { id: order.id },
        include: { familyMembers: { orderBy: { sortOrder: 'asc' } } },
      });
    });
  }

  async findAllAdmin() {
    return this.prisma.order.findMany({
      include: {
        user: true,
        pages: { orderBy: { pageNumber: 'asc' } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getAdminDashboardStats() {
    const totalOrders = await this.prisma.order.count();
    
    // Books generated (status beyond PDF_GENERATING or has a preview ready)
    const totalBooks = await this.prisma.order.count({
      where: {
        status: {
          in: ['PREVIEW_READY', 'PAYMENT_PENDING', 'PAID', 'ORDER_CONFIRMED', 'PRINTING', 'SHIPPED', 'DELIVERED']
        }
      }
    });

    const totalUsers = await this.prisma.user.count();

    // MTD Revenue
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    
    const revenueMtdResult = await this.prisma.order.aggregate({
      where: {
        createdAt: { gte: startOfMonth },
        status: { in: ['PAID', 'PRINTING', 'SHIPPED', 'DELIVERED'] },
        amountPaid: { not: null }
      },
      _sum: {
        amountPaid: true
      }
    });
    
    const revenueMtd = revenueMtdResult._sum.amountPaid || 0;

    // Paid orders count for conversion rate
    const paidOrdersCount = await this.prisma.order.count({
      where: {
        status: { in: ['PAID', 'PREVIEW_READY', 'ORDER_CONFIRMED', 'PRINTING', 'SHIPPED', 'DELIVERED'] }
      }
    });

    // Conversion rate = (paid orders / total users) * 100, safe fallback to 0
    const conversionRate = totalUsers > 0
      ? parseFloat(((paidOrdersCount / totalUsers) * 100).toFixed(1))
      : 0;

    // avgRating: no rating model yet, return safe fallback of 4.9
    const avgRating = 4.9;

    const recentOrders = await this.prisma.order.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        user: true,
      },
    });

    return {
      totalOrders,
      totalBooks,
      totalUsers,
      revenueMtd,
      avgRating,
      conversionRate,
      paidOrdersCount,
      recentOrders,
    };
  }

  async findAll() {
    return this.prisma.order.findMany({
      include: {
        pages: { orderBy: { pageNumber: 'asc' } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findByUserId(userId: string) {
    return this.prisma.order.findMany({
      where: { userId },
      include: {
        pages: { orderBy: { pageNumber: 'asc' } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: string) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        pages: { orderBy: { pageNumber: 'asc' } },
        familyMembers: { orderBy: { sortOrder: 'asc' } },
      },
    });
    if (!order) {
      throw new NotFoundException(`Order ${id} not found`);
    }
    return order;
  }

  async findByPaymentId(paymentId: string) {
    return this.prisma.order.findUnique({
      where: { paymentId },
    });
  }

  async updateStatus(id: string, newStatus: OrderStatus) {
    const order = await this.prisma.order.findUnique({ where: { id } });
    if (!order) {
      throw new NotFoundException(`Order ${id} not found`);
    }

    if (order.status === newStatus) {
      return order;
    }

    const allowed = STATUS_TRANSITIONS[order.status] || [];
    if (!allowed.includes(newStatus)) {
      throw new BadRequestException(
        `Cannot transition from ${order.status} to ${newStatus}`,
      );
    }

    return this.prisma.order.update({
      where: { id },
      data: { status: newStatus },
    });
  }

  async updateOrder(id: string, data: Record<string, unknown>) {
    return this.prisma.order.update({
      where: { id },
      data,
    });
  }

  async findAllAdminUsers() {
    return this.prisma.user.findMany({
      include: {
        orders: {
          select: {
            amountPaid: true,
            status: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findAllAdminBooks() {
    return this.prisma.order.findMany({
      where: {
        status: {
          in: ['PREVIEW_READY', 'PAID', 'ORDER_CONFIRMED', 'PRINTING', 'SHIPPED', 'DELIVERED']
        }
      },
      include: {
        user: true
      },
      orderBy: { updatedAt: 'desc' }
    });
  }

  async findAllAdminPayments() {
    return this.prisma.order.findMany({
      where: {
        paymentId: { not: null }
      },
      include: {
        user: true
      },
      orderBy: { updatedAt: 'desc' }
    });
  }

  getProgress(order: { status: string; pages: { status: string }[] }) {
    const completedPages = order.pages.filter((p) => p.status === 'COMPLETE').length;
    const totalPages = order.pages.length || 16;
    return {
      status: order.status,
      completedPages,
      totalPages,
    };
  }
}
