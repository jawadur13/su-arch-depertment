import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireUser, withErrorHandling, readJson, ApiError } from '@/lib/auth-server';
import { serviceCharterUpdateSchema } from '@/lib/validation';

type RouteContext = { params: Promise<{ id: string }> };

export const GET = withErrorHandling(async (_request, context: RouteContext) => {
  await requireUser();
  const { id } = await context.params;
  const item = await prisma.serviceCharter.findUnique({ where: { id } });
  if (!item) throw new ApiError(404, 'Service charter entry not found');
  return NextResponse.json({ item });
});

export const PUT = withErrorHandling(async (request, context: RouteContext) => {
  await requireUser();
  const { id } = await context.params;
  const body = await readJson(request);
  const data = serviceCharterUpdateSchema.parse(body);
  try {
    const item = await prisma.serviceCharter.update({ where: { id }, data });
    return NextResponse.json({ item });
  } catch (e: unknown) {
    if ((e as { code?: string })?.code === 'P2025') throw new ApiError(404, 'Service charter entry not found');
    throw e;
  }
});

export const DELETE = withErrorHandling(async (_request, context: RouteContext) => {
  await requireUser();
  const { id } = await context.params;
  try {
    await prisma.serviceCharter.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    if ((e as { code?: string })?.code === 'P2025') throw new ApiError(404, 'Service charter entry not found');
    throw e;
  }
});
