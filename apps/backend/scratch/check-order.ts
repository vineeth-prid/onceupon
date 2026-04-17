import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const order = await prisma.order.findUnique({
    where: { id: 'c06be179-0180-4989-b8b9-1a8efede364c' },
    select: { id: true, status: true, email: true }
  });
  console.log(JSON.stringify(order, null, 2));
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
