const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  try {
    const coupons = await prisma.coupon.findMany();
    coupons.forEach(c => {
      console.log(`CODE: [${c.code}], LENGTH: ${c.code.length}, ID: ${c.id}`);
    });
  } catch (e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}
main();
