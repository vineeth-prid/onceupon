import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ConfigService } from '@nestjs/config';
import { OrchestratorProcessor } from './orchestrator.processor';
import { OrdersModule } from '../orders/orders.module';
import { StoryModule } from '../story/story.module';
import { ImageModule } from '../image/image.module';
import { EmailModule } from '../email/email.module';
import { ORCHESTRATOR_QUEUE } from './queue.constants';

@Module({
  imports: [
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        connection: {
          host: config.get('REDIS_HOST', '127.0.0.1'),
          port: config.get('REDIS_PORT', 6379),
          skipVersionCheck: true,
        },
      }),
    }),
    BullModule.registerQueue({ name: ORCHESTRATOR_QUEUE }),
    OrdersModule,
    StoryModule,
    ImageModule,
    EmailModule,
  ],
  providers: [OrchestratorProcessor],
})
export class QueueModule {}
