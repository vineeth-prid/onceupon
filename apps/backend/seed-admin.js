/**
 * Admin seed script (plain JS, no TypeScript compilation needed)
 * Usage: node seed-admin.js
 */
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const adminEmail = 'saravananmk45@gmail.com';
  const adminPassword = '12345678';

  console.log('🔍 Checking for existing admin user...');

  const existing = await prisma.user.findUnique({ where: { email: adminEmail } });

  if (existing) {
    if (existing.role !== 'ADMIN') {
      await prisma.user.update({
        where: { email: adminEmail },
        data: { role: 'ADMIN' },
      });
      console.log(`✅ Existing user promoted to ADMIN: ${adminEmail}`);
    } else {
      console.log(`ℹ️  Admin user already exists with role ADMIN: ${adminEmail}`);
    }
    return;
  }

  const passwordHash = await bcrypt.hash(adminPassword, 12);

  await prisma.user.create({
    data: {
      firstName: 'Saravanan',
      lastName: 'MK',
      email: adminEmail,
      passwordHash,
      authProvider: 'EMAIL',
      isVerified: true,
      role: 'ADMIN',
    },
  });

  console.log(`✅ Admin user created: ${adminEmail}`);
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e.message);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
