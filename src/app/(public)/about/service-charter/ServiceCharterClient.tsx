'use client';

import Image from 'next/image';
import { useMemo, useState } from 'react';
import { Search, Download } from 'lucide-react';

export interface ServiceCharterItem {
  slug: string;
  title: string;
  shortTitle: string;
  department: string;
  cover: string;
  pdf: string;
}

export default function ServiceCharterClient({ items }: { items: ServiceCharterItem[] }) {
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((p) => (
      p.title.toLowerCase().includes(q) ||
      p.department.toLowerCase().includes(q)
    ));
  }, [items, query]);

  return (
    <>
      {/* Search */}
      <div className="relative mb-3">
        <Search
          size={18}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
        />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search charters..."
          className="w-full pl-11 pr-4 py-3 rounded-lg border border-gray-200 bg-white text-sm placeholder:text-gray-400 focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/15 transition"
        />
      </div>

      <p className="text-sm text-gray-500 mb-8">
        Showing <span className="font-semibold text-primary">{filtered.length}</span>{' '}
        {filtered.length === 1 ? 'charter' : 'charters'}
      </p>

      {/* Charter cards */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-gray-300 p-12 text-center">
          <p className="text-gray-500">No charters match your search.</p>
        </div>
      ) : (
        <div
          className={
            filtered.length === 1
              ? 'flex justify-center'
              : 'grid sm:grid-cols-2 lg:grid-cols-3 gap-6'
          }
        >
          {filtered.map((p) => (
            <article
              key={p.slug}
              className={`bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow overflow-hidden flex flex-col ${
                filtered.length === 1 ? 'w-full max-w-md' : ''
              }`}
            >
              {/* Cover */}
              <div className="bg-gray-50">
                <Image
                  src={p.cover}
                  alt={p.title}
                  width={600}
                  height={800}
                  sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                  className="block w-full h-auto"
                />
              </div>

              {/* Body */}
              <div className="p-5 flex-1 flex flex-col">
                <h3 className="font-display text-base md:text-lg font-bold text-primary leading-snug mb-1">
                  {p.shortTitle}
                </h3>
                <p className="text-sm text-gray-600 mb-5">{p.department}</p>

                {p.pdf ? (
                  <a
                    href={p.pdf}
                    download
                    className="mt-auto inline-flex items-center justify-center gap-2 w-full px-5 py-3 bg-primary hover:bg-primary/90 text-white text-sm font-semibold rounded-md transition-colors"
                  >
                    <Download size={16} />
                    Download
                  </a>
                ) : (
                  <span className="mt-auto inline-flex items-center justify-center gap-2 w-full px-5 py-3 bg-gray-100 text-gray-400 text-sm font-semibold rounded-md cursor-not-allowed">
                    PDF coming soon
                  </span>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </>
  );
}
