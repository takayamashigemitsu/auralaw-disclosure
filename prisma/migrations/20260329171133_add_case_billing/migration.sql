-- CreateTable
CREATE TABLE "CaseBilling" (
    "id" TEXT NOT NULL,
    "feeId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ESTIMATED',
    "note" TEXT,
    "isVisibleToClient" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "caseId" TEXT NOT NULL,

    CONSTRAINT "CaseBilling_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CaseBilling_caseId_idx" ON "CaseBilling"("caseId");

-- AddForeignKey
ALTER TABLE "CaseBilling" ADD CONSTRAINT "CaseBilling_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "Case"("id") ON DELETE CASCADE ON UPDATE CASCADE;
