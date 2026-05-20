-- AlterEnum
ALTER TYPE "NotificationType" ADD VALUE IF NOT EXISTS 'REPORT_MESSAGE';

-- CreateTable
CREATE TABLE IF NOT EXISTS "ReportMessage" (
    "id" UUID NOT NULL,
    "reportId" UUID NOT NULL,
    "sender" "UserRole" NOT NULL,
    "message" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ReportMessage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "ReportMessage_reportId_idx" ON "ReportMessage"("reportId");

-- AddForeignKey
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'ReportMessage_reportId_fkey'
    ) THEN
        ALTER TABLE "ReportMessage" ADD CONSTRAINT "ReportMessage_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "LostReport"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;
END $$;
