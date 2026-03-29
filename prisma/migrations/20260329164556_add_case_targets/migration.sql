-- CreateTable
CREATE TABLE "CaseTarget" (
    "id" TEXT NOT NULL,
    "snsType" TEXT NOT NULL,
    "url" TEXT,
    "postContent" TEXT,
    "defendant" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "caseId" TEXT NOT NULL,

    CONSTRAINT "CaseTarget_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "CaseTarget" ADD CONSTRAINT "CaseTarget_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "Case"("id") ON DELETE CASCADE ON UPDATE CASCADE;
