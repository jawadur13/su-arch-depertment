/*
  Warnings:

  - You are about to drop the column `level` on the `department_layout` table. All the data in the column will be lost.
  - You are about to drop the column `level` on the `service_charter` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "department_layout_level_idx";

-- DropIndex
DROP INDEX "service_charter_level_idx";

-- AlterTable
ALTER TABLE "department_layout" DROP COLUMN "level";

-- AlterTable
ALTER TABLE "service_charter" DROP COLUMN "level";
