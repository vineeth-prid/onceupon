import { Queue } from 'bullmq';
import { ORCHESTRATOR_QUEUE } from '../apps/backend/src/queue/queue.constants';

async function main() {
  const connection = {
    host: 'localhost',
    port: 6379,
  };

  const queue = new Queue(ORCHESTRATOR_QUEUE, { connection });
  
  const jobs = await queue.getJobs(['waiting', 'active', 'delayed', 'failed', 'completed']);
  console.log(`Total jobs in queue: ${jobs.length}`);
  for (const job of jobs) {
    console.log(`Job ${job.id}: name=${job.name}, status=${await job.getState()}, data=${JSON.stringify(job.data)}`);
  }
  
  await queue.close();
}

main().catch(console.error);
