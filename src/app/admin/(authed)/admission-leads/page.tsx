import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth-server';
import LeadsList from './LeadsList';

export const metadata = { title: 'Admission Leads' };

export default async function AdmissionLeadsPage() {
  const session = await getSession();
  if (!session?.user) redirect('/admin/login');

  const leads = await prisma.admissionLead.findMany({
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      fullName: true,
      mobile: true,
      programName: true,
      createdAt: true,
    },
  });

  return (
    <div className="space-y-6 max-w-4xl">
      <header>
        <h1 className="text-2xl font-display font-bold text-gray-900">Admission Leads</h1>
        <p className="mt-1 text-sm text-gray-500">
          Submissions from the homepage popup (
          <code className="font-mono">Admission Leads → Popup Settings</code> controls its
          copy and delay). {leads.length} lead{leads.length === 1 ? '' : 's'}.
        </p>
      </header>

      <LeadsList
        items={leads.map((l) => ({
          id: l.id,
          fullName: l.fullName,
          mobile: l.mobile,
          programName: l.programName,
          createdAt: l.createdAt.toISOString(),
        }))}
      />
    </div>
  );
}
