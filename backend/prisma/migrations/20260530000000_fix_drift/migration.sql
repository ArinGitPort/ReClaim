-- CreateEnum
CREATE TYPE "public"."CameraStreamStatus" AS ENUM ('CONNECTING', 'ONLINE', 'OFFLINE', 'SOURCE_IN_USE', 'ERROR');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "public"."AuditAction" ADD VALUE 'SNAPSHOT_DISMISSED';
ALTER TYPE "public"."AuditAction" ADD VALUE 'SNAPSHOT_RESTORED';

-- DropIndex
DROP INDEX "public"."Claim_foundItemId_status_reservationExpiresAt_idx";

-- DropIndex
DROP INDEX "public"."User_role_idx";

-- DropIndex
DROP INDEX "public"."User_status_idx";

-- AlterTable
ALTER TABLE "public"."AIEvidenceLog" ADD COLUMN     "dismissedAt" TIMESTAMPTZ(6);

-- CreateTable
CREATE TABLE "public"."Camera" (
    "id" UUID NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "sourceUrl" TEXT NOT NULL,
    "isOnline" BOOLEAN NOT NULL DEFAULT false,
    "aiEnabled" BOOLEAN NOT NULL DEFAULT false,
    "lastPingAtUtc" TIMESTAMPTZ(6),
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,
    "zoneConfig" JSONB,
    "lastError" TEXT,
    "lastFrameAtUtc" TIMESTAMPTZ(6),
    "streamStatus" "public"."CameraStreamStatus" NOT NULL DEFAULT 'OFFLINE',
    "streamEnabled" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Camera_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Camera_aiEnabled_idx" ON "public"."Camera"("aiEnabled" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Camera_code_key" ON "public"."Camera"("code" ASC);

-- CreateIndex
CREATE INDEX "Camera_isOnline_idx" ON "public"."Camera"("isOnline" ASC);

