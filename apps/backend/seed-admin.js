/**
 * Admin seed script (plain JS, no TypeScript compilation needed)
 * Usage: node seed-admin.js
 *
 * Reads ADMIN_EMAIL and ADMIN_PASSWORD from environment variables.
 * Only creates the admin if it doesn't exist — never overwrites the password.
 * To reset the password, use the admin reset-password API endpoint.
 */
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL || 'saravananmk45@gmail.com';
  const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@2026';

  console.log('🔍 Checking admin user...');

  const existing = await prisma.user.findUnique({ where: { email: adminEmail } });

  if (existing) {
    if (existing.role !== 'ADMIN') {
      await prisma.user.update({
        where: { email: adminEmail },
        data: { role: 'ADMIN' },
      });
      console.log(`✅ Existing user promoted to ADMIN: ${adminEmail}`);
    } else {
      console.log(`✅ Admin already exists (password unchanged): ${adminEmail}`);
    }
    return;
  }

  const passwordHash = await bcrypt.hash(adminPassword, 12);

  const user = await prisma.user.upsert({
    where: { email: adminEmail },
    update: { role: 'ADMIN' },
    create: {
      firstName: 'Admin',
      lastName: 'User',
      email: adminEmail,
      passwordHash,
      authProvider: 'EMAIL',
      isVerified: true,
      role: 'ADMIN',
    },
  });

  console.log(`✅ Admin created: ${user.email}`);
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e.message);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
