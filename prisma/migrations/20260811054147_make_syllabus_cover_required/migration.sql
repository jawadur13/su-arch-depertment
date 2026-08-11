/*
  Warnings:

  - Made the column `coverUrl` on table `syllabus` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "syllabus" ALTER COLUMN "coverUrl" SET NOT NULL;
