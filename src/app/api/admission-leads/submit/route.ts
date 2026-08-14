import { NextResponse, type NextRequest } from 'next/server';
import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/db';
import { admissionLeadCreateSchema } from '@/lib/validation';
import { checkRateLimit } from '@/lib/rate-limit';

// Honeypot field name — must match the hidden input in AdmissionLeadPopup.
// Real users never fill it (hidden via CSS); bots fill all inputs.
// On honeypot trip we return 200 OK so the bot's logging shows
// success and they don't probe for a different attack surface.
const HONEYPOT_FIELD = 'website';

function getClientIp(request: NextRequest): string | null {
  const xff = request.headers.get('x-forwarded-for');
  if (xff) {
    const first = xff.split(',')[0];
    if (first) return first.trim();
  }
  const real = request.headers.get('x-real-ip');
  if (real) return real.trim();
  return null;
}

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  if (!body || typeof body !== 'object') {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }

  // Honeypot — silently accept and discard. Bots happily move on.
  const honeypotValue = (body as Record<string, unknown>)[HONEYPOT_FIELD];
  if (typeof honeypotValue === 'string' && honeypotValue.trim().length > 0) {
    return NextResponse.json({ ok: true });
  }

  const ip = getClientIp(request);
  const userAgent = request.headers.get('user-agent');

  // Rate limit by IP; the 'no-ip' bucket is shared so abuse from a
  // misconfigured proxy can't bypass the limit by stripping headers.
  const rateLimitKey = `admission-lead:${ip ?? 'no-ip'}`;
  const limit = checkRateLimit(rateLimitKey);
  if (!limit.allowed) {
    const retryAfter = Math.max(1, Math.ceil((limit.resetMs - Date.now()) / 1000));
    return NextResponse.json(
      { error: 'Too many submissions from your network. Please try again later.' },
      { status: 429, headers: { 'Retry-After': String(retryAfter) } },
    );
  }

  const parsed = admissionLeadCreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: 'Validation failed',
        issues: parsed.error.issues.map((i) => ({
          path: i.path.join('.'),
          message: i.message,
        })),
      },
      { status: 400 },
    );
  }

  await prisma.admissionLead.create({
    data: {
      ...parsed.data,
      ipAddress: ip,
      userAgent: userAgent ?? null,
    },
  });

  revalidatePath('/admin/admission-leads');
  revalidatePath('/admin');

  return NextResponse.json({ ok: true });
}
