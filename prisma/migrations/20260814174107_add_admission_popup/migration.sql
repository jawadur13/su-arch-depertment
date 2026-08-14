-- CreateTable
CREATE TABLE "admission_popup_settings" (
    "id" TEXT NOT NULL DEFAULT 'singleton',
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "delaySeconds" INTEGER NOT NULL DEFAULT 15,
    "heading" TEXT NOT NULL DEFAULT 'Start your journey with Sonargaon University',
    "subheading" TEXT DEFAULT 'Get personalized admission guidance from our admission team.',
    "buttonLabel" TEXT NOT NULL DEFAULT 'Get admission guidance',
    "footerNote" TEXT DEFAULT 'Our admission team will contact you shortly.',
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "admission_popup_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "admission_lead" (
    "id" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "mobile" TEXT NOT NULL,
    "programName" TEXT NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "admission_lead_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "admission_lead_createdAt_idx" ON "admission_lead"("createdAt");

-- Seed the singleton row so the popup is live with sensible defaults
-- immediately, without requiring an admin trip to the dashboard first.
INSERT INTO "admission_popup_settings" (
    "id", "enabled", "delaySeconds", "heading", "subheading", "buttonLabel", "footerNote", "updatedAt"
) VALUES (
    'singleton',
    true,
    15,
    'Start your journey with Sonargaon University',
    'Get personalized admission guidance from our admission team.',
    'Get admission guidance',
    'Our admission team will contact you shortly.',
    NOW()
);
