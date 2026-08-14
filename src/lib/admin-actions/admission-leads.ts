'use server';

import { revalidatePath } from 'next/cache';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth-server';

export type ActionResult = { ok: true } | { ok: false; error: string };

async function requireAuth(): Promise<ActionResult | null> {
  const session = await getSession();
  if (!session?.user) return { ok: false, error: 'Not authenticated' };
  return null;
}

export async function deleteAdmissionLeadAction(id: string): Promise<ActionResult> {
  const denied = await requireAuth();
  if (denied) return denied;

  try {
    await prisma.admissionLead.delete({ where: { id } });
  } catch (e: unknown) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2025') {
      return { ok: false, error: 'Lead not found' };
    }
    return { ok: false, error: e instanceof Error ? e.message : 'Database error' };
  }

  revalidatePath('/admin/admission-leads');
  revalidatePath('/admin');
  return { ok: true };
}
