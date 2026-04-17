import { Queue } from 'bullmq';

async function main() {
  const connection = {
    host: 'localhost',
    port: 6379,
  };

  const queueName = 'orchestrator';
  const queue = new Queue(queueName, { connection });
  
  const orderId = 'c06be179-0180-4989-b8b9-1a8efede364c';
  
  await queue.add('complete-order', { orderId });
  
  console.log(`Job added to queue "${queueName}" for order ${orderId}`);
  
  await queue.close();
}

main().catch(console.error);
