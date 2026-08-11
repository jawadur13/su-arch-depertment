import { NextResponse } from 'next/server';
import type { Prisma } from '@prisma/client';
import { prisma } from '@/lib/db';
import { requireUser, withErrorHandling, readJson, ApiError } from '@/lib/auth-server';
import { programCurriculumCreateSchema } from '@/lib/validation';

type RouteContext = { params: Promise<{ programId: string }> };

export const GET = withErrorHandling(async (_request, context: RouteContext) => {
  await requireUser();
  const { programId } = await context.params;
  const item = await prisma.programCurriculum.findUnique({ where: { programId } });
  if (!item) throw new ApiError(404, 'Program curriculum not found');
  return NextResponse.json({ item });
});

export const PUT = withErrorHandling(async (request, context: RouteContext) => {
  await requireUser();
  const { programId } = await context.params;
  const body = await readJson(request);
  const bodyObj = (typeof body === 'object' && body !== null) ? body as Record<string, unknown> : {};
  const parsed = programCurriculumCreateSchema.parse({ ...bodyObj, programId });

  const program = await prisma.program.findUnique({ where: { id: programId }, select: { id: true } });
  if (!program) throw new ApiError(404, 'Program not found');

  const data = {
    programId,
    slug:            parsed.slug,
    heroOverline:    parsed.heroOverline,
    heroTitle:       parsed.heroTitle,
    introOverline:   parsed.introOverline,
    introBody:       parsed.introBody,
    overviewStats:   parsed.overviewStats as unknown as Prisma.InputJsonValue,
    specializations: parsed.specializations,
    careerProspects: parsed.careerProspects,
    semesters:       parsed.semesters as unknown as Prisma.InputJsonValue,
    displayOrder:    parsed.displayOrder,
  };
  const item = await prisma.programCurriculum.upsert({
    where:  { programId },
    create: data,
    update: data,
  });
  return NextResponse.json({ item });
});

export const DELETE = withErrorHandling(async (_request, context: RouteContext) => {
  await requireUser();
  const { programId } = await context.params;
  try {
    await prisma.programCurriculum.delete({ where: { programId } });
    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    if ((e as { code?: string })?.code === 'P2025') throw new ApiError(404, 'Curriculum not found');
    throw e;
  }
});
