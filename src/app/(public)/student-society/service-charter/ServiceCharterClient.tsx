import { Download, FileText } from 'lucide-react';

export interface ServiceCharterItem {
  slug: string;
  title: string;
  shortTitle: string;
  department: string;
  cover: string;
  pdf: string;
}

export default function ServiceCharterClient({ items }: { items: ServiceCharterItem[] }) {
  return (
    <>
      {/* Charter cards */}
      {items.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-gray-300 p-12 text-center">
          <p className="text-gray-500">No charters yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {items.map((p) => (
            <article
              key={p.slug}
              className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow overflow-hidden flex items-center gap-6 p-6"
            >
              {/* Icon box */}
              <div className="shrink-0 w-16 h-16 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
                <FileText size={28} className="text-white" />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <h3 className="font-display text-lg font-bold text-primary leading-snug mb-1">
                  {p.shortTitle}
                </h3>
                <p className="text-sm text-gray-600">
                  {p.department}
                </p>
              </div>

              {/* Download button */}
              {p.pdf ? (
                <a
                  href={p.pdf}
                  download
                  className="shrink-0 inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary hover:bg-primary/90 text-white text-sm font-semibold rounded-md transition-colors whitespace-nowrap"
                >
                  <Download size={18} />
                  Download PDF
                </a>
              ) : (
                <span className="shrink-0 inline-flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 text-gray-400 text-sm font-semibold rounded-md cursor-not-allowed whitespace-nowrap">
                  Coming soon
                </span>
              )}
            </article>
          ))}
        </div>
      )}
    </>
  );
}
