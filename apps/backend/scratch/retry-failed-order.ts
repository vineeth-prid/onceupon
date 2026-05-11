import { Queue } from 'bullmq';

async function main() {
  const connection = {
    host: 'localhost',
    port: 6379,
  };

  const queue = new Queue('orchestrator', { connection });
  
  const orderId = '4de576e1-682b-4625-b51f-c6c1cc8cb60d';
  
  await queue.add('process-order', { orderId });
  
  console.log(`Retry job added to queue for order ${orderId}`);
  
  await queue.close();
}

main().catch(console.error);
