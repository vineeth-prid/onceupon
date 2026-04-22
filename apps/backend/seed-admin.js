/**
 * Admin seed script (plain JS, no TypeScript compilation needed)
 * Usage: node seed-admin.js
 */
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const adminEmail = 'saravananmk45@gmail.com';
  const adminPassword = 'Admin@2026';

  console.log('🔍 Upserting admin user...');

  const passwordHash = await bcrypt.hash(adminPassword, 12);

  const user = await prisma.user.upsert({
    where: { email: adminEmail },
    update: { passwordHash, role: 'ADMIN' },
    create: {
      firstName: 'Saravanan',
      lastName: 'MK',
      email: adminEmail,
      passwordHash,
      authProvider: 'EMAIL',
      isVerified: true,
      role: 'ADMIN',
    },
  });

  console.log(`✅ Admin ready: ${user.email} (password reset)`);
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e.message);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
