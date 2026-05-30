const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  await prisma.$executeRawUnsafe(`DELETE FROM "AuditLog" WHERE action::text IN ('ITEM_CREATED', 'ITEM_UPDATED')`);
  console.log('Deleted');
}

main().finally(() => prisma.$disconnect());
