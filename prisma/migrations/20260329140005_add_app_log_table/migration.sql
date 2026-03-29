-- CreateTable
CREATE TABLE "AppLog" (
    "id" TEXT NOT NULL,
    "level" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "context" TEXT,
    "userId" TEXT,
    "path" TEXT,
    "userAgent" TEXT,
    "duration" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AppLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AppLog_level_createdAt_idx" ON "AppLog"("level", "createdAt");

-- CreateIndex
CREATE INDEX "AppLog_category_createdAt_idx" ON "AppLog"("category", "createdAt");

-- CreateIndex
CREATE INDEX "AppLog_userId_createdAt_idx" ON "AppLog"("userId", "createdAt");
