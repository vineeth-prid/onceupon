import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const orderId = 'c06be179-0180-4989-b8b9-1a8efede364c';
  
  // Set status to PAID to allow retry
  const updated = await prisma.order.update({
    where: { id: orderId },
    data: { status: 'PAID' }
  });
  
  console.log(`Order ${orderId} updated to PAID`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
