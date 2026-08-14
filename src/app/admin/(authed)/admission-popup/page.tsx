import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth-server';
import AdmissionPopupForm from './AdmissionPopupForm';

export const metadata = { title: 'Admission Leads — Popup Settings' };

export default async function AdmissionPopupPage() {
  const session = await getSession();
  if (!session?.user) redirect('/admin/login');

  const row = await prisma.admissionPopupSettings.findUnique({ where: { id: 'singleton' } });

  return (
    <div className="space-y-6 max-w-2xl">
      <header>
        <h1 className="text-2xl font-display font-bold text-gray-900">
          Admission Leads — Popup Settings
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Controls the lead-capture dialog that appears on the homepage after a visitor
          has been on the page for a while. Submissions land in{' '}
          <code className="font-mono">Admission Leads → Leads</code>.
        </p>
      </header>
      <AdmissionPopupForm initial={row} />
    </div>
  );
}
