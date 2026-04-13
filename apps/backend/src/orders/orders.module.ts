import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { OrdersController } from './orders.controller';
import { CouponsController } from './coupons.controller';
import { OrdersService } from './orders.service';
import { CouponsService } from './coupons.service';
import { RazorpayService } from './razorpay.service';
import { PdfModule } from '../pdf/pdf.module';
import { AuthModule } from '../auth/auth.module';
import { ORCHESTRATOR_QUEUE } from '../queue/queue.constants';

@Module({
  imports: [BullModule.registerQueue({ name: ORCHESTRATOR_QUEUE }), PdfModule, AuthModule],
  controllers: [OrdersController, CouponsController],
  providers: [OrdersService, CouponsService, RazorpayService],
  exports: [OrdersService, CouponsService],
})
export class OrdersModule {}
