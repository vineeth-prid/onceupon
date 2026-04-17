const { Queue } = require('bullmq');
const Redis = require('ioredis');

async function requeue() {
  const connection = new Redis({
    host: 'localhost',
    port: 6379,
    maxRetriesPerRequest: null,
  });

  const queue = new Queue('orchestrator', { connection });
  const orderId = '5e2b66eb-78d0-4ff9-854b-5fe148ad3bac';

  console.log(`Re-queueing COMPLETE_ORDER for ${orderId}`);
  await queue.add('COMPLETE_ORDER', { orderId });
  
  process.exit(0);
}

requeue().catch(console.error);
