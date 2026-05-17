-- AlterEnum
ALTER TYPE "ClaimStatus" ADD VALUE 'EXPIRED';

-- AlterTable
ALTER TABLE "Claim" ADD COLUMN "reservationExpiresAt" TIMESTAMPTZ(6);

-- CreateIndex
CREATE INDEX "Claim_foundItemId_status_reservationExpiresAt_idx" ON "Claim"("foundItemId", "status", "reservationExpiresAt");
