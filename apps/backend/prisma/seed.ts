import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL || 'saravananmk45@gmail.com';
  const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@2026';

  // Check if admin already exists
  const existing = await prisma.user.findUnique({ where: { email: adminEmail } });

  if (existing) {
    // If exists but not ADMIN, promote to admin
    if (existing.role !== 'ADMIN') {
      await prisma.user.update({
        where: { email: adminEmail },
        data: { role: 'ADMIN' },
      });
      console.log(`✅ Existing user promoted to ADMIN: ${adminEmail}`);
    } else {
      console.log(`ℹ️  Admin user already exists (password unchanged): ${adminEmail}`);
    }
    return;
  }

  // Create admin user with hashed password (only on first run)
  const passwordHash = await bcrypt.hash(adminPassword, 12);

  await prisma.user.create({
    data: {
      firstName: 'Admin',
      lastName: 'User',
      email: adminEmail,
      passwordHash,
      authProvider: 'EMAIL',
      isVerified: true,
      role: 'ADMIN',
    },
  });

  console.log(`✅ Admin user created successfully: ${adminEmail}`);
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
