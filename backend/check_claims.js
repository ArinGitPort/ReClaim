import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const claims = await prisma.claim.findMany({
    include: {
      foundItem: true
    }
  });

  console.log("All Claims:");
  claims.forEach(c => {
    console.log(`Claim ID: ${c.id}`);
    console.log(`Claim Code: ${c.claimCode}`);
    console.log(`Item: ${c.foundItem.title} (${c.foundItem.id})`);
    console.log(`Status: ${c.status}`);
    console.log(`Updated At: ${c.updatedAt} (${c.updatedAt.getTime()})`);
    console.log(`Current Time: ${new Date()}`);
    console.log(`Time Diff (ms): ${Date.now() - c.updatedAt.getTime()}`);
    console.log("-----------------------------------------");
  });
}

main().catch(console.error).finally(() => prisma.$disconnect());
