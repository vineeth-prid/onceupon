import { PrismaClient } from '@prisma/client';
async function check() {
  const p = new PrismaClient();
  const u = await p.user.findUnique({ where: { email: 'karthikpalani.itsmyid@gmail.com' } });
  console.log(JSON.stringify(u, null, 2));
  await p.$disconnect();
}
check();
