import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth-server';
import AboutInnovationHubForm from './AboutInnovationHubForm';

export const metadata = { title: 'About — Mecha Club' };

export default async function AboutInnovationHubPage() {
  const session = await getSession();
  if (!session?.user) redirect('/admin/login');

  const row = await prisma.aboutMechaClub.findUnique({ where: { id: 'singleton' } });

  return (
    <div className="space-y-6 max-w-3xl">
      <header>
        <h1 className="text-2xl font-display font-bold text-gray-900">About — Mecha Club</h1>
        <p className="mt-1 text-sm text-gray-500">
          Hero, intro, stats, activities, and network section for <code className="font-mono">/about/innovation-hub</code>.
        </p>
      </header>
      <AboutInnovationHubForm initial={row} />
    </div>
  );
}
