import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const password = await bcrypt.hash('admin', 10);
  
  const admin = await prisma.user.upsert({
    where: { email: 'admin123@gmail.com' },
    update: {
      passwordHash: password,
      fullName: 'Administrator',
      role: 'ADMIN',
    },
    create: {
      email: 'admin123@gmail.com',
      fullName: 'Administrator',
      passwordHash: password,
      role: 'ADMIN',
    },
  });

  console.log('Admin seeded:', admin);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
