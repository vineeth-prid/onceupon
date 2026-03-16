import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateOrderInput, OrderStatus, STATUS_TRANSITIONS } from '@bookmagic/shared';

@Injectable()
export class OrdersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateOrderInput) {
    return this.prisma.order.create({
      data: {
        childName: dto.childName,
        childAge: dto.childAge,
        childGender: dto.childGender,
        theme: dto.theme,
        photoUrl: dto.photoUrl,
        status: 'CREATED',
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
