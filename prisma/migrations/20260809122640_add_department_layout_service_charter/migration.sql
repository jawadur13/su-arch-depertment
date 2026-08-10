-- CreateTable
CREATE TABLE "department_layout" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "shortTitle" TEXT NOT NULL,
    "department" TEXT NOT NULL,
    "level" TEXT NOT NULL,
    "coverUrl" TEXT NOT NULL,
    "coverPublicId" TEXT,
    "pdfUrl" TEXT,
    "pdfPublicId" TEXT,
    "pdfFileName" TEXT,
    "displayOrder" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "department_layout_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "service_charter" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "shortTitle" TEXT NOT NULL,
    "department" TEXT NOT NULL,
    "level" TEXT NOT NULL,
    "coverUrl" TEXT NOT NULL,
    "coverPublicId" TEXT,
    "pdfUrl" TEXT,
    "pdfPublicId" TEXT,
    "pdfFileName" TEXT,
    "displayOrder" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "service_charter_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "department_layout_slug_key" ON "department_layout"("slug");

-- CreateIndex
CREATE INDEX "department_layout_displayOrder_idx" ON "department_layout"("displayOrder");

-- CreateIndex
CREATE INDEX "department_layout_level_idx" ON "department_layout"("level");

-- CreateIndex
CREATE UNIQUE INDEX "service_charter_slug_key" ON "service_charter"("slug");

-- CreateIndex
CREATE INDEX "service_charter_displayOrder_idx" ON "service_charter"("displayOrder");

-- CreateIndex
CREATE INDEX "service_charter_level_idx" ON "service_charter"("level");
