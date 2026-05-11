const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const orderId = '4de576e1-682b-4625-b51f-c6c1cc8cb60d';
  
  await prisma.order.update({
    where: { id: orderId },
    data: { status: 'CREATED' }
  });
  
  console.log(`Order ${orderId} reset to CREATED`);
  
  await prisma.$disconnect();
}

main().catch(console.error);
