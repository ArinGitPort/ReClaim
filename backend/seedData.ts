import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const pass = await bcrypt.hash('password123', 10);
  
  await prisma.user.upsert({
    where: { email: 'admin@school.edu' },
    update: {},
    create: {
      name: 'Test Admin',
      email: 'admin@school.edu',
      passwordHash: pass,
      role: 'ADMIN'
    }
  });

  await prisma.user.upsert({
    where: { email: 'student@school.edu' },
    update: {},
    create: {
      name: 'Test Student',
      email: 'student@school.edu',
      studentId: 'S1234567',
      passwordHash: pass,
      role: 'STUDENT'
    }
  });

  console.log('Seeded test users (admin and student)!');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });