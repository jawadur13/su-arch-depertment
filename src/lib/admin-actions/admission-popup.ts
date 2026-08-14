'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth-server';
import { admissionPopupSettingsUpdateSchema } from '@/lib/validation';

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

export async function updateAdmissionPopupSettingsAction(
  _prev: ActionResult | { ok: null },
  formData: FormData,
): Promise<ActionResult> {
  const session = await getSession();
  if (!session?.user) return { ok: false, error: 'Not authenticated' };

  const raw = {
    enabled:      formData.get('enabled') === 'on',
    delaySeconds: getStr(formData, 'delaySeconds'),
    heading:      getStr(formData, 'heading'),
    subheading:   emptyToNull(formData.get('subheading')),
    buttonLabel:  getStr(formData, 'buttonLabel'),
    footerNote:   emptyToNull(formData.get('footerNote')),
  };

  const parsed = admissionPopupSettingsUpdateSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues
        .map((i) => `${i.path.join('.') || '(root)'}: ${i.message}`)
        .join('; '),
    };
  }

  try {
    await prisma.admissionPopupSettings.upsert({
      where: { id: 'singleton' },
      create: { id: 'singleton', ...parsed.data },
      update: parsed.data,
    });
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Database error' };
  }

  revalidatePath('/admin/admission-popup');
  revalidatePath('/admin');
  revalidatePath('/');
  return { ok: true };
}
