-- DropForeignKey (change to SetNull on User deletion)
ALTER TABLE "Case" DROP CONSTRAINT IF EXISTS "Case_clientUserId_fkey";
ALTER TABLE "CaseMessage" DROP CONSTRAINT IF EXISTS "CaseMessage_userId_fkey";
ALTER TABLE "CaseDocument" DROP CONSTRAINT IF EXISTS "CaseDocument_userId_fkey";
ALTER TABLE "CaseTask" DROP CONSTRAINT IF EXISTS "CaseTask_assigneeId_fkey";

-- AddForeignKey (re-add with onDelete: SetNull)
ALTER TABLE "Case" ADD CONSTRAINT "Case_clientUserId_fkey" FOREIGN KEY ("clientUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "CaseMessage" ADD CONSTRAINT "CaseMessage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "CaseDocument" ADD CONSTRAINT "CaseDocument_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "CaseTask" ADD CONSTRAINT "CaseTask_assigneeId_fkey" FOREIGN KEY ("assigneeId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- CreateIndex
CREATE INDEX "AIAnalysis_caseId_idx" ON "AIAnalysis"("caseId");

-- CreateIndex
CREATE INDEX "AIAnalysis_consultationId_idx" ON "AIAnalysis"("consultationId");

-- CreateIndex
CREATE INDEX "CaseDocument_caseId_idx" ON "CaseDocument"("caseId");

-- CreateIndex
CREATE INDEX "CaseMessage_caseId_createdAt_idx" ON "CaseMessage"("caseId", "createdAt");

-- CreateIndex
CREATE INDEX "CaseTarget_caseId_idx" ON "CaseTarget"("caseId");

-- CreateIndex
CREATE UNIQUE INDEX "CaseTask_caseId_templateKey_caseStatus_key" ON "CaseTask"("caseId", "templateKey", "caseStatus");

-- CreateIndex
CREATE INDEX "CaseTimeline_caseId_date_idx" ON "CaseTimeline"("caseId", "date");

-- CreateIndex
CREATE INDEX "ConsultationFile_consultationId_idx" ON "ConsultationFile"("consultationId");

-- CreateIndex
CREATE INDEX "Notification_userId_isRead_idx" ON "Notification"("userId", "isRead");
