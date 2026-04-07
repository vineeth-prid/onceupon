import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { PdfModule } from '../pdf/pdf.module';
import { AuthModule } from '../auth/auth.module';
import { ORCHESTRATOR_QUEUE } from '../queue/queue.constants';

@Module({
  imports: [BullModule.registerQueue({ name: ORCHESTRATOR_QUEUE }), PdfModule, AuthModule],
  controllers: [OrdersController],
  providers: [OrdersService],
  exports: [OrdersService],
})
export class OrdersModule {}
