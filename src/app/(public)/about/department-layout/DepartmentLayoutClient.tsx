import Image from 'next/image';
import { Download } from 'lucide-react';

export interface DepartmentLayoutItem {
  slug: string;
  title: string;
  shortTitle: string;
  department: string;
  cover: string;
  pdf: string;
}

export default function DepartmentLayoutClient({ items }: { items: DepartmentLayoutItem[] }) {
  return (
    <>
      {/* Layout cards */}
      {items.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-gray-300 p-12 text-center">
          <p className="text-gray-500">No layouts yet.</p>
        </div>
      ) : (
        <div
          className={
            items.length === 1
              ? 'flex justify-center'
              : 'grid sm:grid-cols-2 lg:grid-cols-3 gap-6'
          }
        >
          {items.map((p) => (
            <article
              key={p.slug}
              className={`bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow overflow-hidden flex flex-col ${
                items.length === 1 ? 'w-full max-w-md' : ''
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
