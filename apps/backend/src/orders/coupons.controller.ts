import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CouponsService } from './coupons.service';

@Controller('coupons')
export class CouponsController {
  constructor(private readonly couponsService: CouponsService) {}

  @Post()
  // Note: Add proper Admin Guard in production
  async create(@Body() data: any) {
    return this.couponsService.createCoupon({
      code: data.code,
      name: data.name || data.code,
      type: data.type || 'percentage',
      value: data.value,
      maxDiscount: data.maxDiscount,
      minAmount: data.minAmount,
      validTill: data.validTill ? new Date(data.validTill) : undefined,
      usageLimit: data.usageLimit,
      syncWithRazorpay: data.syncWithRazorpay,
    });
  }

  @Get()
  async findAll() {
    return this.couponsService.getAllCoupons();
  }

  @Get(':code')
  async findByCode(@Param('code') code: string) {
    return this.couponsService.getByCode(code);
  }

  @Post('validate')
  async validate(@Body() data: { code: string; amount: number }) {
    console.log(`Validating coupon: ${data.code} for amount: ${data.amount}`);
    return this.couponsService.validateCoupon(data.code, data.amount);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.couponsService.deleteCoupon(id);
  }
}
