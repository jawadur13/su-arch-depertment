import { notFound, redirect } from 'next/navigation';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth-server';
import ServiceCharterForm from '../ServiceCharterForm';

export const metadata = { title: 'Edit service and charter' };

export default async function EditServiceCharterPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session?.user) redirect('/admin/login');

  const { id } = await params;
  const item = await prisma.serviceCharter.findUnique({ where: { id } });
  if (!item) notFound();

  return (
    <div className="space-y-6 max-w-3xl">
      <header>
        <h1 className="text-2xl font-display font-bold text-gray-900">
          Edit service and charter: <span className="text-accent">{item.shortTitle}</span>
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Slug: <code className="font-mono">{item.slug}</code> · {item.level}
        </p>
      </header>
      <ServiceCharterForm initial={item} />
    </div>
  );
}
