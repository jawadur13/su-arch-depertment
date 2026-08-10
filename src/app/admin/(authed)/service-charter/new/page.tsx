import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth-server';
import ServiceCharterForm from '../ServiceCharterForm';

export const metadata = { title: 'New service and charter' };

export default async function NewServiceCharterPage() {
  const session = await getSession();
  if (!session?.user) redirect('/admin/login');
  return (
    <div className="space-y-6 max-w-3xl">
      <header>
        <h1 className="text-2xl font-display font-bold text-gray-900">Add service and charter</h1>
        <p className="mt-1 text-sm text-gray-500">New charter document for <code className="font-mono">/about/service-charter</code>.</p>
      </header>
      <ServiceCharterForm initial={null} />
    </div>
  );
}
