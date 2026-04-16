import { Controller, Get, Put, Body, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AdminGuard } from '../auth/admin.guard';
import { PricingService, PricingConfig } from './pricing.service';

@Controller('pricing')
export class PricingController {
  constructor(private readonly pricingService: PricingService) {}

  @Get()
  getPricing(): PricingConfig {
    return this.pricingService.getPricing();
  }

  @Put()
  @UseGuards(AuthGuard('jwt'), AdminGuard)
  savePricing(@Body() body: PricingConfig): PricingConfig {
    return this.pricingService.savePricing({
      ebookPrice: Number(body.ebookPrice),
      physicalPrice: Number(body.physicalPrice),
      shippingPrice: Number(body.shippingPrice),
    });
  }
}
