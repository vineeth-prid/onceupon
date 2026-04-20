import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { OrdersController } from './orders.controller';
import { CouponsController } from './coupons.controller';
import { PricingController } from './pricing.controller';
import { OrdersService } from './orders.service';
import { CouponsService } from './coupons.service';
import { PricingService } from './pricing.service';
import { RazorpayService } from './razorpay.service';
import { PdfModule } from '../pdf/pdf.module';
import { AuthModule } from '../auth/auth.module';
import { ORCHESTRATOR_QUEUE } from '../queue/queue.constants';

@Module({
  imports: [BullModule.registerQueue({ name: ORCHESTRATOR_QUEUE }), PdfModule, AuthModule],
  controllers: [OrdersController, CouponsController, PricingController],
  providers: [OrdersService, CouponsService, PricingService, RazorpayService],
  exports: [OrdersService, CouponsService],
})
export class OrdersModule {}

