import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { DatabaseModule } from '../database/database.module';
import { EmailModule } from '../email/email.module';
import { ORCHESTRATOR_QUEUE } from '../queue/queue.constants';

@Module({
  imports: [
    DatabaseModule,
    EmailModule,
    BullModule.registerQueue({ name: ORCHESTRATOR_QUEUE }),
  ],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
