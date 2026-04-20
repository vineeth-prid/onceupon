import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateOrderInput, OrderStatus, STATUS_TRANSITIONS } from '@bookmagic/shared';

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
        email: dto.email,
        status: 'CREATED',
        ...(userId ? { userId } : {}),
      },
    });
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
      },
    });
    if (!order) {
      throw new NotFoundException(`Order ${id} not found`);
    }
    return order;
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
