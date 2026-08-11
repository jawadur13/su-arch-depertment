'use client';

import { useMemo, useState } from 'react';
import { Search, Download, ExternalLink } from 'lucide-react';

type Level = 'Undergraduate' | 'Postgraduate';

export interface ProspectusItem {
  slug: string;
  title: string;
  shortTitle: string;
  department: string;
  level: string;
  cover: string;
  pdf: string;
}

const filters: ('All' | Level)[] = ['All', 'Undergraduate', 'Postgraduate'];

export default function ProspectusClient({ items }: { items: ProspectusItem[] }) {
  const [query, setQuery] = useState('');
  const [active, setActive] = useState<'All' | Level>('All');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter((p) => {
      if (active !== 'All' && p.level !== active) return false;
      if (!q) return true;
      return (
        p.title.toLowerCase().includes(q) ||
        p.department.toLowerCase().includes(q) ||
        p.level.toLowerCase().includes(q)
      );
    });
  }, [items, query, active]);

  return (
    <>
      {/* Search + Filters */}
      <div className="flex flex-col lg:flex-row gap-3 lg:items-center mb-8">
        <div className="relative flex-1">
          <Search
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
          />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search programs..."
            className="w-full pl-11 pr-4 py-3 rounded-lg border border-gray-200 bg-white text-sm placeholder:text-gray-400 focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/15 transition"
          />
        </div>

        <div className="flex gap-2 flex-wrap">
          {filters.map((f) => {
            const isActive = active === f;
            return (
              <button
                key={f}
                type="button"
                onClick={() => setActive(f)}
                className={`px-5 py-3 rounded-lg text-sm font-semibold transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-primary text-white shadow-md'
                    : 'bg-white text-gray-700 border border-gray-200 hover:border-accent hover:text-accent'
                }`}
              >
                {f}
              </button>
            );
          })}
        </div>
      </div>

      <p className="text-sm text-gray-500 mb-8">
        Showing <span className="font-semibold text-primary">{filtered.length}</span>{' '}
        {filtered.length === 1 ? 'program' : 'programs'}
      </p>

      {/* Prospectus items */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-gray-300 p-12 text-center">
          {active === 'Postgraduate' && !query ? (
            <>
              <p className="text-primary font-semibold text-base mb-1">
                Postgraduate prospectus coming soon
              </p>
              <p className="text-gray-500 text-sm">
                Postgraduate programs in Architecture are not offered yet. Please check back later for updates.
              </p>
            </>
          ) : (
            <p className="text-gray-500">No programs match your search.</p>
          )}
        </div>
      ) : (
        <div className="space-y-12">
          {filtered.map((p) => (
            <article key={p.slug} className="space-y-6">
              {/* Header */}
              <div>
                <span
                  className={`inline-block px-3 py-1 rounded-full text-[11px] font-bold tracking-wider uppercase mb-4 ${
                    p.level === 'Undergraduate'
                      ? 'bg-primary/8 text-primary'
                      : 'bg-accent/10 text-accent'
                  }`}
                >
                  {p.level}
                </span>
                <div className="flex items-start justify-between gap-4">
                  <h2 className="font-display text-2xl md:text-3xl font-bold text-primary leading-tight flex-1">
                    {p.shortTitle}
                  </h2>
                  {p.pdf && (
                    <a
                      href={p.pdf}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="shrink-0 inline-flex items-center gap-2 text-primary hover:text-accent transition-colors text-sm font-medium whitespace-nowrap"
                    >
                      Open in a new tab
                      <ExternalLink size={16} />
                    </a>
                  )}
                </div>
                <p className="text-gray-600 mt-2">{p.department}</p>
              </div>

              {/* PDF Preview */}
              {p.pdf ? (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                  <iframe
                    src={`${p.pdf}#toolbar=0`}
                    title={p.title}
                    className="w-full"
                    style={{ height: '600px' }}
                  />
                </div>
              ) : (
                <div className="bg-white rounded-xl border border-dashed border-gray-300 p-12 text-center">
                  <p className="text-gray-500">PDF coming soon</p>
                </div>
              )}

              {/* Download Card */}
              {p.pdf && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow p-6 flex items-center gap-6">
                  <div className="shrink-0 w-16 h-16 rounded-lg bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center">
                    <Download size={28} className="text-white" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="font-display text-lg font-bold text-primary leading-snug">
                      {p.shortTitle}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Download the complete prospectus PDF
                    </p>
                  </div>

                  <a
                    href={p.pdf}
                    download
                    className="shrink-0 inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-primary hover:bg-primary/90 text-white text-sm font-semibold rounded-lg transition-colors whitespace-nowrap"
                  >
                    <Download size={18} />
                    Download PDF
                  </a>
                </div>
              )}
            </article>
          ))}
        </div>
      )}
    </>
  );
}
