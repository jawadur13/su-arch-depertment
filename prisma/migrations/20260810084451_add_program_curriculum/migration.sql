-- CreateTable
CREATE TABLE "program_curriculum" (
    "id" TEXT NOT NULL,
    "programId" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "heroOverline" TEXT,
    "heroTitle" TEXT NOT NULL,
    "heroImageUrl" TEXT,
    "heroImagePublicId" TEXT,
    "introOverline" TEXT,
    "introBody" TEXT,
    "overviewStats" JSONB NOT NULL,
    "specializations" TEXT[],
    "careerProspects" TEXT,
    "semesters" JSONB NOT NULL,
    "syllabusPdfUrl" TEXT,
    "syllabusPdfPublicId" TEXT,
    "syllabusPdfFileName" TEXT,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "program_curriculum_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "program_curriculum_programId_key" ON "program_curriculum"("programId");

-- CreateIndex
CREATE UNIQUE INDEX "program_curriculum_slug_key" ON "program_curriculum"("slug");

-- CreateIndex
CREATE INDEX "program_curriculum_displayOrder_idx" ON "program_curriculum"("displayOrder");

-- AddForeignKey
ALTER TABLE "program_curriculum" ADD CONSTRAINT "program_curriculum_programId_fkey" FOREIGN KEY ("programId") REFERENCES "program"("id") ON DELETE CASCADE ON UPDATE CASCADE;
