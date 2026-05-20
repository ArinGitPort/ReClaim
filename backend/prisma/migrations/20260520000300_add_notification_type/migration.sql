-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('SYSTEM', 'CLAIM_MESSAGE');

-- AlterTable
ALTER TABLE "Notification" ADD COLUMN "type" "NotificationType" NOT NULL DEFAULT 'SYSTEM';

-- CreateIndex
CREATE INDEX "Notification_userId_type_readAt_idx" ON "Notification"("userId", "type", "readAt");
