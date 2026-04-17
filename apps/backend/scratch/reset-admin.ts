import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

async function reset() {
  const p = new PrismaClient();
  const hash = await bcrypt.hash('admin123', 10);
  const user = await p.user.upsert({
    where: { email: 'karthikpalani.itsmyid@gmail.com' },
    update: { passwordHash: hash, role: 'ADMIN' },
    create: {
      email: 'karthikpalani.itsmyid@gmail.com',
      passwordHash: hash,
      role: 'ADMIN',
      firstName: 'Karthik',
      lastName: 'Palani',
    }
  });
  console.log('Admin ready:', user.email);
  await p.$disconnect();
}

reset().catch(console.error);
