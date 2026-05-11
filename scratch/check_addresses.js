const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  try {
    const addresses = await prisma.address.findMany();
    console.log(`Found ${addresses.length} addresses.`);
    if (addresses.length > 0) {
        console.log('Sample address:', JSON.stringify(addresses[0], null, 2));
    }
  } catch (e) {
    console.error('Database error:', e);
  } finally {
    await prisma.$disconnect();
  }
}
main();
