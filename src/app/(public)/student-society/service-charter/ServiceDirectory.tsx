import Link from 'next/link';
import { ArrowRight, Mail, MapPin, Phone, User } from 'lucide-react';

type Step = { text: string; linkLabel?: string | null; linkHref?: string | null };
type ServiceItem = {
  title: string;
  scope: 'department' | 'university';
  steps: Step[];
  contactName?: string | null;
  contactRole?: string | null;
  contactPhone?: string | null;
  contactEmail?: string | null;
  contactRoom?: string | null;
};

function coerceItems(v: unknown): ServiceItem[] {
  if (!Array.isArray(v)) return [];
  return v
    .filter((r): r is Record<string, unknown> => typeof r === 'object' && r !== null)
    .map((r) => ({
      title: typeof r.title === 'string' ? r.title : '',
      scope: (r.scope === 'university' ? 'university' : 'department') as 'department' | 'university',
      steps: Array.isArray(r.steps)
        ? (r.steps as unknown[])
            .filter((s): s is Record<string, unknown> => typeof s === 'object' && s !== null)
            .map((s) => ({
              text:      typeof s.text === 'string' ? s.text : '',
              linkLabel: typeof s.linkLabel === 'string' ? s.linkLabel : null,
              linkHref:  typeof s.linkHref === 'string' ? s.linkHref : null,
            }))
        : [],
      contactName:  typeof r.contactName === 'string' ? r.contactName : null,
      contactRole:  typeof r.contactRole === 'string' ? r.contactRole : null,
      contactPhone: typeof r.contactPhone === 'string' ? r.contactPhone : null,
      contactEmail: typeof r.contactEmail === 'string' ? r.contactEmail : null,
      contactRoom:  typeof r.contactRoom === 'string' ? r.contactRoom : null,
    }))
    .filter((it) => it.title);
}

export default function ServiceDirectory({ items: raw }: { items: unknown }) {
  const items = coerceItems(raw);
  if (items.length === 0) return null;

  return (
    <section className="mb-14 md:mb-16">
      <div className="text-center max-w-2xl mx-auto mb-8">
        <h2 className="font-display text-2xl md:text-3xl font-bold text-primary leading-tight">
          What to Do, and Who to Ask
        </h2>
        <div className="mt-3 mx-auto h-1 w-16 bg-accent rounded-full" />
        <p className="mt-4 text-sm text-gray-500">
          For the things students need from the department office through the semester.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {items.map((item, idx) => (
          <article key={`${item.title}-${idx}`} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex flex-col">
            <div className="flex items-start gap-3 mb-3">
              <span className="shrink-0 w-7 h-7 rounded-full bg-gradient-to-br from-primary to-accent text-white text-xs font-bold flex items-center justify-center">
                {idx + 1}
              </span>
              <h3 className="font-display text-[15px] font-bold text-primary leading-snug">{item.title}</h3>
            </div>

            <ol className="space-y-1.5 mb-4 pl-1">
              {item.steps.map((step, sIdx) => (
                <li key={sIdx} className="flex items-start gap-2 text-sm text-gray-700 leading-relaxed">
                  {item.steps.length > 1 ? (
                    <span className="shrink-0 text-xs font-semibold text-accent mt-0.5">{sIdx + 1}.</span>
                  ) : (
                    <ArrowRight size={14} className="shrink-0 text-accent mt-1" />
                  )}
                  <span>
                    {step.text}
                    {step.linkHref && (
                      <>
                        {' '}
                        <Link href={step.linkHref} className="text-accent font-medium hover:underline">
                          {step.linkLabel || step.linkHref}
                        </Link>
                      </>
                    )}
                  </span>
                </li>
              ))}
            </ol>

            {(item.contactName || item.contactPhone || item.contactEmail) && (
              <div className="mt-auto pt-3 border-t border-gray-100 space-y-1">
                {item.contactName && (
                  <div className="flex items-center gap-2 text-xs font-semibold text-primary">
                    <User size={13} className="shrink-0 text-gray-400" />
                    {item.contactName}{item.contactRole && <span className="font-normal text-gray-500"> ({item.contactRole})</span>}
                  </div>
                )}
                {item.contactPhone && (
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <Phone size={13} className="shrink-0 text-gray-400" />
                    {item.contactPhone}
                  </div>
                )}
                {item.contactEmail && (
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <Mail size={13} className="shrink-0 text-gray-400" />
                    {item.contactEmail}
                  </div>
                )}
                {item.contactRoom && (
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <MapPin size={13} className="shrink-0 text-gray-400" />
                    {item.contactRoom}
                  </div>
                )}
              </div>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}
