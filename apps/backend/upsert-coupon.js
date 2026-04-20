const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  try {
    const coupon = await prisma.coupon.upsert({
      where: { code: 'FIRSTTRY1' },
      update: { active: true, value: 30 },
      create: {
        code: 'FIRSTTRY1',
        name: 'First Try',
        type: 'percentage',
        value: 30,
        active: true
      }
    });
    console.log('UPSET_COUPON:' + JSON.stringify(coupon));
  } catch (e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}
main();
