-- CreateTable
CREATE TABLE "ClaimMessage" (
    "id" UUID NOT NULL,
    "claimId" UUID NOT NULL,
    "sender" "UserRole" NOT NULL,
    "message" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ClaimMessage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ClaimMessage_claimId_idx" ON "ClaimMessage"("claimId");

-- AddForeignKey
ALTER TABLE "ClaimMessage" ADD CONSTRAINT "ClaimMessage_claimId_fkey" FOREIGN KEY ("claimId") REFERENCES "Claim"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
