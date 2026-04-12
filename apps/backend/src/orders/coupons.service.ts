import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { RazorpayService } from './razorpay.service';

@Injectable()
export class CouponsService {
  private readonly logger = new Logger(CouponsService.name);

  constructor(
    private prisma: PrismaService,
    private razorpayService: RazorpayService,
  ) {}

  async createCoupon(data: {
    code: string;
    name: string;
    type: 'flat' | 'percentage';
    value: number;
    maxDiscount?: number;
    minAmount?: number;
    validTill?: Date;
    usageLimit?: number;
    syncWithRazorpay?: boolean;
  }) {
    let razorpayId: string | undefined;

    if (data.syncWithRazorpay) {
      try {
        const rpCoupon = await this.razorpayService.createCoupon({
          name: data.name,
          type: data.type,
          value: data.value,
          valid_till: data.validTill ? Math.floor(data.validTill.getTime() / 1000) : undefined,
        });
        razorpayId = rpCoupon.id;
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        this.logger.error(`Failed to sync coupon with Razorpay: ${message}`);
      }
    }

    return this.prisma.coupon.create({
      data: {
        code: data.code.toUpperCase(),
        name: data.name,
        type: data.type,
        value: data.value,
        maxDiscount: data.maxDiscount,
        minAmount: data.minAmount,
        validTill: data.validTill,
        usageLimit: data.usageLimit,
        razorpayId,
      },
    });
  }

  async validateCoupon(code: string, orderAmount: number) {
    const coupon = await this.prisma.coupon.findUnique({
      where: { code: code.toUpperCase() },
    });

    if (!coupon || !coupon.active) {
      throw new NotFoundException('Coupon not found or inactive');
    }

    if (coupon.validTill && new Date() > coupon.validTill) {
      throw new BadRequestException('Coupon has expired');
    }

    if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
      throw new BadRequestException('Coupon usage limit reached');
    }

    if (coupon.minAmount && orderAmount < coupon.minAmount) {
      throw new BadRequestException(`Minimum order amount of ${coupon.minAmount / 100} required`);
    }

    let discount = 0;
    if (coupon.type === 'percentage') {
      discount = Math.round((orderAmount * coupon.value) / 100);
      if (coupon.maxDiscount && discount > coupon.maxDiscount) {
        discount = coupon.maxDiscount;
      }
    } else {
      discount = coupon.value;
    }

    return {
      coupon,
      discountAmount: discount,
    };
  }

  async getAllCoupons() {
    return this.prisma.coupon.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async getByCode(code: string) {
    const coupon = await this.prisma.coupon.findUnique({
      where: { code: code.toUpperCase() },
    });
    if (!coupon) throw new NotFoundException('Coupon not found');
    return coupon;
  }

  async deleteCoupon(id: string) {
    return this.prisma.coupon.delete({ where: { id } });
  }
}
