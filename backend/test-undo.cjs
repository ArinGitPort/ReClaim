const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function test() {
  const report = await prisma.lostReport.findFirst({ where: { status: 'MATCHED' } });
  if (!report) {
    console.log("no report");
    return;
  }
  console.log("found report", report.id);
  
  try {
    const res = await prisma.$transaction(async (tx) => {
      if (report.matchedItemId) {
        await tx.foundItem.update({
          where: { id: report.matchedItemId },
          data: { status: "AVAILABLE" },
        });

        await tx.claim.deleteMany({
          where: {
            foundItemId: report.matchedItemId,
            claimantUserId: report.reporterUserId,
            status: "APPROVED",
          },
        });
      }

      return tx.lostReport.update({
        where: { id: report.id },
        data: {
          status: "ACTIVE_SEARCH",
          matchedItemId: null,
        },
      });
    });
    console.log("Success", res);
  } catch(e) {
    console.error("error", e);
  }
}
test();
