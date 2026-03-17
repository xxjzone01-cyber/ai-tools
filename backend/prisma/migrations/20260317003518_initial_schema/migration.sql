-- DropForeignKey
ALTER TABLE "time_records" DROP CONSTRAINT "time_records_taskId_fkey";

-- DropIndex
DROP INDEX "predictions_userId_idx";

-- DropIndex
DROP INDEX "tasks_categoryId_idx";

-- DropIndex
DROP INDEX "tasks_userId_idx";

-- DropIndex
DROP INDEX "time_records_categoryId_idx";

-- DropIndex
DROP INDEX "time_records_taskId_idx";

-- DropIndex
DROP INDEX "time_records_userId_idx";

-- AddForeignKey
ALTER TABLE "time_records" ADD CONSTRAINT "time_records_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "tasks"("id") ON DELETE SET NULL ON UPDATE CASCADE;
