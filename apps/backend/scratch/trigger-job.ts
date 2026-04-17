import { Queue } from 'bullmq';
import { ORCHESTRATOR_QUEUE, JobName } from '../apps/backend/src/queue/queue.constants';

async function main() {
  const connection = {
    host: 'localhost',
    port: 6379,
  };

  const queue = new Queue(ORCHESTRATOR_QUEUE, { connection });
  
  const orderId = 'c06be179-0180-4989-b8b9-1a8efede364c';
  
  await queue.add(JobName.COMPLETE_ORDER, { orderId });
  
  console.log(`Job added to queue for order ${orderId}`);
  
  await queue.close();
}

main().catch(console.error);
