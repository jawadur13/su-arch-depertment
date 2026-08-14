import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Plus } from 'lucide-react';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth-server';
import EventsList from './EventsList';

export const metadata = { title: 'Events (CMS)' };

export default async function EventsAdminPage() {
  const session = await getSession();
  if (!session?.user) redirect('/admin/login');

  const events = await prisma.event.findMany({
    orderBy: [{ eventDate: { sort: 'desc', nulls: 'last' } }, { createdAt: 'desc' }],
  });

  // Which 3 the homepage will actually render. Mirrors getEventsHomeTop()
  // in src/lib/identity.ts — Array#sort is stable, so re-sorting this
  // already-date-ordered list by isFeatured alone reproduces that SQL
  // ORDER BY exactly. Keep the two in sync. Costs no extra query since
  // the full list is already loaded.
  const homepageIds = [...events]
    .sort((a, b) => Number(b.isFeatured) - Number(a.isFeatured))
    .slice(0, 3)
    .map((e) => e.id);
  const featuredCount = events.filter((e) => e.isFeatured).length;

  return (
    <div className="space-y-8 max-w-3xl">
      <header>
        <h1 className="text-2xl font-display font-bold text-gray-900">Events</h1>
        <p className="mt-1 text-sm text-gray-500">
          Events for <code className="font-mono">/student-society/events</code> and the homepage EventsSection. Sorted by event date (newest first; undated rows last).
        </p>
        {featuredCount > 3 && (
          <p className="mt-2 text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
            {featuredCount} events are ticked for the homepage but only 3 fit. The 3 with
            the newest event dates are shown; the rest are marked below.
          </p>
        )}
      </header>

      <section className="space-y-3">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-500">Events</h2>
            <p className="text-xs text-gray-400 mt-0.5">
              {events.length} event{events.length === 1 ? '' : 's'}
            </p>
          </div>
          <Link
            href="/admin/events/new"
            className="flex items-center gap-1.5 bg-primary hover:bg-primary/90 text-white font-medium rounded-lg px-4 py-2 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-accent/40"
          >
            <Plus size={16} /> Add event
          </Link>
        </div>
        <EventsList items={events} homepageIds={homepageIds} />
      </section>
    </div>
  );
}
