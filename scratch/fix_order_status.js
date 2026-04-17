const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixOrder() {
  const orderId = '5e2b66eb-78d0-4ff9-854b-5fe148ad3bac';
  console.log(`Fixing order ${orderId}...`);
  
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  console.log(`Current status: ${order.status}`);

  // Force transition to IMAGES_COMPLETE
  await prisma.order.update({
    where: { id: orderId },
    data: { status: 'IMAGES_COMPLETE' }
  });
  
  console.log('Status updated to IMAGES_COMPLETE.');
  process.exit(0);
}

fixOrder().catch(console.error);
