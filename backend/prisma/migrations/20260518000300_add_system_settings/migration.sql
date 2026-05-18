-- AlterEnum
ALTER TYPE "AuditAction" ADD VALUE 'SYSTEM_SETTINGS_UPDATED';

-- CreateTable
CREATE TABLE "SystemSetting" (
    "key" TEXT NOT NULL,
    "value" JSONB NOT NULL,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,
    "updatedById" UUID,

    CONSTRAINT "SystemSetting_pkey" PRIMARY KEY ("key")
);
