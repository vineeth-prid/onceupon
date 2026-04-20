import { Queue } from 'bullmq';

async function main() {
  const connection = {
    host: 'localhost',
    port: 6379,
  };

  const queueName = 'orchestrator';
  const queue = new Queue(queueName, { connection });
  
  const jobs = await queue.getJobs(['waiting', 'active', 'delayed', 'failed', 'completed']);
  console.log(`Total jobs in queue "${queueName}": ${jobs.length}`);
  for (const job of jobs) {
    console.log(`Job ${job.id}: name=${job.name}, status=${await job.getState()}, data=${JSON.stringify(job.data)}`);
  }
  
  await queue.close();
}

main().catch(console.error);
