-- DropForeignKey
ALTER TABLE "AIAnalysis" DROP CONSTRAINT "AIAnalysis_caseId_fkey";

-- DropForeignKey
ALTER TABLE "AIAnalysis" DROP CONSTRAINT "AIAnalysis_consultationId_fkey";

-- DropForeignKey
ALTER TABLE "AIAnalysis" DROP CONSTRAINT "AIAnalysis_userId_fkey";

-- AlterTable
ALTER TABLE "AIAnalysis" ALTER COLUMN "userId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "AIAnalysis" ADD CONSTRAINT "AIAnalysis_consultationId_fkey" FOREIGN KEY ("consultationId") REFERENCES "Consultation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AIAnalysis" ADD CONSTRAINT "AIAnalysis_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "Case"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AIAnalysis" ADD CONSTRAINT "AIAnalysis_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
