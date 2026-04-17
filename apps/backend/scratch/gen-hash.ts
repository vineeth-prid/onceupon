import * as bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

async function generate() {
  const hash = await bcrypt.hash('admin123', 12);
  console.log('Hash for admin123:', hash);
  const prisma = new PrismaClient();
  await prisma.user.upsert({
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
  console.log('Database updated successfully');
  await prisma.$disconnect();
}

generate().catch(console.error);
