const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  try {
    const orders = await prisma.order.findMany({
      select: {
        id: true,
        status: true,
        amountPaid: true,
        paymentId: true,
        razorpayOrderId: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });
    console.log('=== Recent Orders ===');
    orders.forEach(o => {
      console.log(`ID: ${o.id.slice(0,8)}... | Status: ${o.status} | amountPaid: ${o.amountPaid} | paymentId: ${o.paymentId} | razorpayOrderId: ${o.razorpayOrderId}`);
    });

    // Check what statuses exist
    const statusCounts = await prisma.order.groupBy({
      by: ['status'],
      _count: true,
    });
    console.log('\n=== Status Distribution ===');
    statusCounts.forEach(s => console.log(`${s.status}: ${s._count}`));

    // Check total revenue raw
    const revenue = await prisma.order.aggregate({
      _sum: { amountPaid: true },
    });
    console.log('\n=== Total amountPaid (all orders) ===', revenue._sum.amountPaid);

    // Check paid orders specifically
    const paidOrders = await prisma.order.findMany({
      where: { amountPaid: { not: null, gt: 0 } },
      select: { id: true, status: true, amountPaid: true },
    });
    console.log('\n=== Orders with amountPaid > 0 ===');
    paidOrders.forEach(o => console.log(`ID: ${o.id.slice(0,8)}... | Status: ${o.status} | amountPaid: ${o.amountPaid}`));
  } catch (e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}
main();
