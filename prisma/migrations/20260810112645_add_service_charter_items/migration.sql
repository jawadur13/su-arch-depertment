-- AlterTable
ALTER TABLE "service_charter" ADD COLUMN     "serviceItems" JSONB NOT NULL DEFAULT '[]';
