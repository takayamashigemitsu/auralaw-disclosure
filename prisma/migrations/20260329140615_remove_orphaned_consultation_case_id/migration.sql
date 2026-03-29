/*
  Warnings:

  - You are about to drop the column `caseId` on the `Consultation` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "Consultation_caseId_key";

-- AlterTable
ALTER TABLE "Consultation" DROP COLUMN "caseId";
