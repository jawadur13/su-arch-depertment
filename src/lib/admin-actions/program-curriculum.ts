'use server';

import { revalidatePath } from 'next/cache';
import type { Prisma } from '@prisma/client';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth-server';
import { programCurriculumUpdateSchema } from '@/lib/validation';

export type ActionResult = { ok: true } | { ok: false; error: string };

function getStr(fd: FormData, key: string): string {
  const v = fd.get(key);
  return typeof v === 'string' ? v.trim() : '';
}
function emptyToNull(v: FormDataEntryValue | null): string | null {
  if (typeof v !== 'string') return null;
  const t = v.trim();
  return t.length > 0 ? t : null;
}
function parseJsonArray(fd: FormData, key: string): unknown {
  const raw = fd.get(key);
  if (typeof raw !== 'string' || !raw.trim()) return [];
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}
function parseLines(fd: FormData, key: string): string[] {
  const raw = fd.get(key);
  if (typeof raw !== 'string') return [];
  return raw.split('\n').map((l) => l.trim()).filter(Boolean);
}

async function requireAuth(): Promise<ActionResult | null> {
  const session = await getSession();
  if (!session?.user) return { ok: false, error: 'Not authenticated' };
  return null;
}

function revalidateCurriculumSurfaces(slug?: string) {
  if (slug) revalidatePath(`/admission/programs/${slug}`);
  revalidatePath('/admin/program-curriculum');
  revalidatePath('/admin');
  revalidatePath('/', 'layout');
}

// Upsert keyed by programId — admin form lives at
// /admin/program-curriculum/[programId], same 1:1-with-Program pattern
// as ProgramFeeStructure.
export async function upsertProgramCurriculumAction(
  programId: string,
  _prev: ActionResult | { ok: null },
  formData: FormData,
): Promise<ActionResult> {
  const denied = await requireAuth();
  if (denied) return denied;

  const raw = {
    programId,
    slug:            getStr(formData, 'slug'),
    heroOverline:    emptyToNull(formData.get('heroOverline')),
    heroTitle:       getStr(formData, 'heroTitle'),
    introOverline:   emptyToNull(formData.get('introOverline')),
    introBody:       emptyToNull(formData.get('introBody')),
    overviewStats:   parseJsonArray(formData, 'overviewStats'),
    specializations: parseLines(formData, 'specializations'),
    careerProspects: emptyToNull(formData.get('careerProspects')),
    semesters:       parseJsonArray(formData, 'semesters'),
    displayOrder:    Number(getStr(formData, 'displayOrder')) || 0,
  };

  const parsed = programCurriculumUpdateSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues.map((i) => `${i.path.join('.') || '(root)'}: ${i.message}`).join('; ') };
  }

  const program = await prisma.program.findUnique({ where: { id: programId }, select: { id: true } });
  if (!program) return { ok: false, error: 'Program not found' };

  const heroImageUrl      = emptyToNull(formData.get('heroImageUrl'));
  const heroImagePublicId = emptyToNull(formData.get('heroImagePublicId'));
  const syllabusPdfUrl      = emptyToNull(formData.get('syllabusPdfUrl'));
  const syllabusPdfPublicId = emptyToNull(formData.get('syllabusPdfPublicId'));
  const syllabusPdfFileName = emptyToNull(formData.get('syllabusPdfFileName'));

  const data = {
    programId,
    slug:                parsed.data.slug,
    heroOverline:        parsed.data.heroOverline,
    heroTitle:           parsed.data.heroTitle,
    heroImageUrl,
    heroImagePublicId,
    introOverline:       parsed.data.introOverline,
    introBody:           parsed.data.introBody,
    overviewStats:       parsed.data.overviewStats as unknown as Prisma.InputJsonValue,
    specializations:     parsed.data.specializations,
    careerProspects:     parsed.data.careerProspects,
    semesters:           parsed.data.semesters as unknown as Prisma.InputJsonValue,
    syllabusPdfUrl,
    syllabusPdfPublicId,
    syllabusPdfFileName,
    displayOrder:        parsed.data.displayOrder,
  };

  try {
    await prisma.programCurriculum.upsert({
      where:  { programId },
      create: data,
      update: data,
    });
  } catch (e: unknown) {
    if ((e as { code?: string })?.code === 'P2002') {
      return { ok: false, error: `slug "${parsed.data.slug}" is already in use` };
    }
    return { ok: false, error: e instanceof Error ? e.message : 'Database error' };
  }
  revalidateCurriculumSurfaces(parsed.data.slug);
  return { ok: true };
}

export async function deleteProgramCurriculumAction(programId: string): Promise<ActionResult> {
  const denied = await requireAuth();
  if (denied) return denied;
  try {
    const existing = await prisma.programCurriculum.findUnique({ where: { programId }, select: { slug: true } });
    await prisma.programCurriculum.delete({ where: { programId } });
    revalidateCurriculumSurfaces(existing?.slug);
  } catch (e: unknown) {
    if ((e as { code?: string })?.code === 'P2025') return { ok: false, error: 'Curriculum not found' };
    return { ok: false, error: e instanceof Error ? e.message : 'Database error' };
  }
  return { ok: true };
}
