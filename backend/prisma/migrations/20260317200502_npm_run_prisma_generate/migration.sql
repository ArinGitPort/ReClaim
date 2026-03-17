-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('STUDENT', 'STAFF', 'ADMIN');

-- CreateEnum
CREATE TYPE "ItemStatus" AS ENUM ('AVAILABLE', 'CLAIM_PENDING', 'RETURNED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "ClaimStatus" AS ENUM ('PENDING_VERIFICATION', 'INQUIRY_REQUIRED', 'APPROVED', 'DENIED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "ReportStatus" AS ENUM ('SUBMITTED', 'UNDER_REVIEW', 'ACTIVE_SEARCH', 'MATCHED', 'RESOLVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "AuditAction" AS ENUM ('ITEM_CREATED', 'ITEM_UPDATED', 'CLAIM_SUBMITTED', 'CLAIM_REVIEWED', 'CLAIM_APPROVED', 'CLAIM_DENIED', 'REPORT_SUBMITTED', 'REPORT_UPDATED', 'REPORT_LINKED', 'HANDOVER_COMPLETED', 'AUTH_LOGIN');

-- CreateTable
CREATE TABLE "User" (
    "id" UUID NOT NULL,
    "studentId" TEXT,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "UserRole" NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FoundItem" (
    "id" UUID NOT NULL,
    "code" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "color" TEXT NOT NULL,
    "foundLocation" TEXT NOT NULL,
    "foundAtUtc" TIMESTAMPTZ(6) NOT NULL,
    "publicDescription" TEXT,
    "privateDiscoveryNote" TEXT,
    "privateData" JSONB,
    "status" "ItemStatus" NOT NULL DEFAULT 'AVAILABLE',
    "storageLocation" TEXT,
    "createdById" UUID NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "FoundItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Claim" (
    "id" UUID NOT NULL,
    "claimCode" TEXT NOT NULL,
    "foundItemId" UUID NOT NULL,
    "claimantUserId" UUID NOT NULL,
    "submittedProof" JSONB NOT NULL,
    "status" "ClaimStatus" NOT NULL DEFAULT 'PENDING_VERIFICATION',
    "reviewerNote" TEXT,
    "decisionAtUtc" TIMESTAMPTZ(6),
    "verifiedByAdminId" UUID,
    "pickupToken" TEXT,
    "pickupTokenExpires" TIMESTAMPTZ(6),
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "Claim_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LostReport" (
    "id" UUID NOT NULL,
    "reportCode" TEXT NOT NULL,
    "reporterUserId" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "color" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "reportedLostAtUtc" TIMESTAMPTZ(6) NOT NULL,
    "timeWindow" TEXT,
    "proofData" JSONB NOT NULL,
    "status" "ReportStatus" NOT NULL DEFAULT 'SUBMITTED',
    "matchedItemId" UUID,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "LostReport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AIEvidenceLog" (
    "id" UUID NOT NULL,
    "foundItemId" UUID,
    "sourceCameraId" TEXT NOT NULL,
    "snapshotPath" TEXT NOT NULL,
    "snapshotHash" TEXT,
    "isEncrypted" BOOLEAN NOT NULL DEFAULT true,
    "detectionMeta" JSONB NOT NULL,
    "detectedAtUtc" TIMESTAMPTZ(6) NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AIEvidenceLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HandoverLog" (
    "id" UUID NOT NULL,
    "foundItemId" UUID NOT NULL,
    "claimId" UUID,
    "releasedToUserId" UUID NOT NULL,
    "pickupTokenPresented" TEXT NOT NULL,
    "idVerified" BOOLEAN NOT NULL DEFAULT false,
    "releasedAtUtc" TIMESTAMPTZ(6) NOT NULL,
    "note" TEXT,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "HandoverLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" UUID NOT NULL,
    "actorUserId" UUID NOT NULL,
    "action" "AuditAction" NOT NULL,
    "targetType" TEXT NOT NULL,
    "targetId" TEXT NOT NULL,
    "description" TEXT,
    "payload" JSONB,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_studentId_key" ON "User"("studentId");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "FoundItem_code_key" ON "FoundItem"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Claim_claimCode_key" ON "Claim"("claimCode");

-- CreateIndex
CREATE INDEX "Claim_foundItemId_idx" ON "Claim"("foundItemId");

-- CreateIndex
CREATE INDEX "Claim_claimantUserId_idx" ON "Claim"("claimantUserId");

-- CreateIndex
CREATE INDEX "Claim_status_idx" ON "Claim"("status");

-- CreateIndex
CREATE UNIQUE INDEX "LostReport_reportCode_key" ON "LostReport"("reportCode");

-- CreateIndex
CREATE INDEX "LostReport_reporterUserId_idx" ON "LostReport"("reporterUserId");

-- CreateIndex
CREATE INDEX "LostReport_status_idx" ON "LostReport"("status");

-- CreateIndex
CREATE INDEX "AIEvidenceLog_foundItemId_idx" ON "AIEvidenceLog"("foundItemId");

-- CreateIndex
CREATE INDEX "HandoverLog_foundItemId_idx" ON "HandoverLog"("foundItemId");

-- CreateIndex
CREATE INDEX "HandoverLog_releasedToUserId_idx" ON "HandoverLog"("releasedToUserId");

-- CreateIndex
CREATE INDEX "AuditLog_actorUserId_idx" ON "AuditLog"("actorUserId");

-- CreateIndex
CREATE INDEX "AuditLog_action_idx" ON "AuditLog"("action");

-- CreateIndex
CREATE INDEX "AuditLog_targetType_targetId_idx" ON "AuditLog"("targetType", "targetId");

-- AddForeignKey
ALTER TABLE "FoundItem" ADD CONSTRAINT "FoundItem_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Claim" ADD CONSTRAINT "Claim_foundItemId_fkey" FOREIGN KEY ("foundItemId") REFERENCES "FoundItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Claim" ADD CONSTRAINT "Claim_claimantUserId_fkey" FOREIGN KEY ("claimantUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Claim" ADD CONSTRAINT "Claim_verifiedByAdminId_fkey" FOREIGN KEY ("verifiedByAdminId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LostReport" ADD CONSTRAINT "LostReport_reporterUserId_fkey" FOREIGN KEY ("reporterUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LostReport" ADD CONSTRAINT "LostReport_matchedItemId_fkey" FOREIGN KEY ("matchedItemId") REFERENCES "FoundItem"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AIEvidenceLog" ADD CONSTRAINT "AIEvidenceLog_foundItemId_fkey" FOREIGN KEY ("foundItemId") REFERENCES "FoundItem"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HandoverLog" ADD CONSTRAINT "HandoverLog_foundItemId_fkey" FOREIGN KEY ("foundItemId") REFERENCES "FoundItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HandoverLog" ADD CONSTRAINT "HandoverLog_claimId_fkey" FOREIGN KEY ("claimId") REFERENCES "Claim"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HandoverLog" ADD CONSTRAINT "HandoverLog_releasedToUserId_fkey" FOREIGN KEY ("releasedToUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_actorUserId_fkey" FOREIGN KEY ("actorUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
