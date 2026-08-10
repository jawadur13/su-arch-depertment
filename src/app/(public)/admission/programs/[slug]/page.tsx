import { notFound } from 'next/navigation';
import Link from 'next/link';
import { FileText, Download, CheckCircle2, ArrowRight, ClipboardCheck, CreditCard } from 'lucide-react';
import PageShell from '@/components/layout/PageShell';
import Container from '@/components/ui/Container';
import { getProgramCurriculumBySlug } from '@/lib/identity';
import { DynamicLucideIcon } from '@/components/ui/DynamicLucideIcon';

type Props = { params: Promise<{ slug: string }> };

type OverviewStat = { iconName: string; label: string; value: string };
type Course = { code: string; title: string; credits: number; elective: boolean };
type Semester = {
  yearLabel: string;
  semesterLabel: string;
  totalContactHours: string;
  electiveCreditsRequired: number;
  courses: Course[];
};

function coerceOverview(v: unknown): OverviewStat[] {
  if (!Array.isArray(v)) return [];
  return v
    .filter((r): r is Record<string, unknown> => typeof r === 'object' && r !== null)
    .map((r) => ({
      iconName: typeof r.iconName === 'string' ? r.iconName : '',
      label:    typeof r.label    === 'string' ? r.label    : '',
      value:    typeof r.value    === 'string' ? r.value    : '',
    }))
    .filter((s) => s.label && s.value);
}

function coerceSemesters(v: unknown): Semester[] {
  if (!Array.isArray(v)) return [];
  return v
    .filter((r): r is Record<string, unknown> => typeof r === 'object' && r !== null)
    .map((r) => ({
      yearLabel:          typeof r.yearLabel === 'string' ? r.yearLabel : '',
      semesterLabel:      typeof r.semesterLabel === 'string' ? r.semesterLabel : '',
      totalContactHours:  typeof r.totalContactHours === 'string' ? r.totalContactHours : '',
      electiveCreditsRequired: typeof r.electiveCreditsRequired === 'number' ? r.electiveCreditsRequired : 0,
      courses: Array.isArray(r.courses)
        ? (r.courses as unknown[])
            .filter((c): c is Record<string, unknown> => typeof c === 'object' && c !== null)
            .map((c) => ({
              code:     typeof c.code === 'string' ? c.code : '',
              title:    typeof c.title === 'string' ? c.title : '',
              credits:  typeof c.credits === 'number' ? c.credits : 0,
              elective: c.elective === true,
            }))
        : [],
    }))
    .filter((s) => s.yearLabel && s.semesterLabel);
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const curriculum = await getProgramCurriculumBySlug(slug);
  if (!curriculum) return {};
  return {
    title: `${curriculum.heroTitle} — Department of Architecture`,
    description: curriculum.introBody ?? undefined,
  };
}

export default async function ProgramCurriculumPage({ params }: Props) {
  const { slug } = await params;
  const curriculum = await getProgramCurriculumBySlug(slug);
  if (!curriculum) notFound();

  const overview = coerceOverview(curriculum.overviewStats);
  const semesters = coerceSemesters(curriculum.semesters);

  // Credit Distribution — derived from `semesters`, not stored separately.
  let running = 0;
  const distribution = semesters.map((sem) => {
    // Core has no alternatives, so summing non-elective course rows is
    // exact. Elective is NOT summed from `courses` — that list shows
    // every alternative in each "select one" set for browsing, so a
    // naive sum would count credits the student never actually earns.
    const core = sem.courses.filter((c) => !c.elective).reduce((sum, c) => sum + c.credits, 0);
    const elective = sem.electiveCreditsRequired;
    const total = core + elective;
    running += total;
    return {
      label: `${sem.yearLabel} · ${sem.semesterLabel}`,
      core, elective, total,
      cumulative: running,
    };
  });

  return (
    <PageShell
      title={curriculum.heroTitle}
      overline={curriculum.heroOverline ?? 'Undergraduate Program'}
      image={curriculum.heroImageUrl ?? undefined}
      contentClassName="bg-gray-50 py-12 md:py-20"
    >
      <Container>
      <div className="max-w-5xl mx-auto">
        {/* Intro */}
        {(curriculum.introOverline || curriculum.introBody) && (
          <div className="max-w-3xl mx-auto text-center mb-12 md:mb-16">
            {curriculum.introOverline && (
              <span className="inline-block text-accent text-[11px] font-bold tracking-[0.3em] uppercase mb-2">
                {curriculum.introOverline}
              </span>
            )}
            {curriculum.introBody && (
              <p className="text-base text-gray-700 leading-[1.85] mt-3">
                {curriculum.introBody}
              </p>
            )}
          </div>
        )}

        {/* At a Glance */}
        {overview.length > 0 && (
          <section className="mb-14 md:mb-16">
            <SectionHeading overline="Overview" heading="At a Glance" />
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {overview.map((stat) => (
                <div key={`${stat.label}-${stat.value}`}
                     className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-shadow text-center">
                  <div className="inline-flex w-11 h-11 rounded-lg bg-gradient-to-br from-primary to-accent text-white items-center justify-center mb-3 shadow-md">
                    <DynamicLucideIcon name={stat.iconName} size={20} strokeWidth={1.75} />
                  </div>
                  <div className="text-[10px] font-bold tracking-wider uppercase text-gray-500 mb-1">{stat.label}</div>
                  <div className="font-display text-lg md:text-xl font-bold text-primary leading-tight">{stat.value}</div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Specializations */}
        {curriculum.specializations.length > 0 && (
          <section className="mb-14 md:mb-16">
            <SectionHeading overline="Focus Areas" heading="Specializations" />
            <div className="grid sm:grid-cols-2 gap-3">
              {curriculum.specializations.map((spec) => (
                <div key={spec} className="flex items-center gap-2.5 bg-white rounded-lg border border-gray-100 px-4 py-3 text-sm font-semibold text-primary shadow-sm">
                  <CheckCircle2 size={18} className="shrink-0 text-accent" />
                  {spec}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Career Prospects */}
        {curriculum.careerProspects && (
          <section className="mb-14 md:mb-16">
            <SectionHeading overline="After Graduation" heading="Career Prospects" />
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 md:p-8">
              <p className="text-[15px] text-gray-700 leading-[1.85] whitespace-pre-line">
                {curriculum.careerProspects}
              </p>
            </div>
          </section>
        )}

        {/* Course Structure */}
        {semesters.length > 0 && (
          <section className="mb-14 md:mb-16">
            <SectionHeading overline={`${semesters.length} Semesters`} heading="Course Structure" />
            <p className="text-sm text-gray-500 text-center -mt-6 mb-8">Select a semester to see its courses.</p>
            <div className="space-y-3">
              {semesters.map((sem) => {
                const semCoreCredits = sem.courses.filter((c) => !c.elective).reduce((sum, c) => sum + c.credits, 0);
                const totalCredits = semCoreCredits + sem.electiveCreditsRequired;
                return (
                  <details key={`${sem.yearLabel}-${sem.semesterLabel}`}
                           name="semester-accordion"
                           className="group bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                    <summary className="flex items-center justify-between gap-3 px-5 py-4 cursor-pointer select-none list-none">
                      <div className="flex items-center gap-3 min-w-0">
                        <FileText size={18} className="text-accent shrink-0" />
                        <div className="min-w-0">
                          <div className="font-display font-bold text-primary text-[15px] leading-tight">
                            {sem.yearLabel} · {sem.semesterLabel}
                          </div>
                          <div className="text-xs text-gray-500 mt-0.5">
                            {sem.courses.length} courses · {totalCredits.toFixed(2)} credits
                          </div>
                        </div>
                      </div>
                      <ArrowRight size={16} className="text-gray-300 shrink-0 transition-transform group-open:rotate-90" />
                    </summary>
                    <div className="border-t border-gray-100 overflow-x-auto">
                      <table className="w-full min-w-[480px] border-collapse">
                        <thead>
                          <tr className="border-b border-gray-100 text-left bg-gray-50/60">
                            <th className="px-5 py-2.5 text-[11px] font-bold tracking-wider uppercase text-gray-500">Code</th>
                            <th className="px-5 py-2.5 text-[11px] font-bold tracking-wider uppercase text-gray-500">Course</th>
                            <th className="px-5 py-2.5 text-[11px] font-bold tracking-wider uppercase text-gray-500 text-right">Credits</th>
                          </tr>
                        </thead>
                        <tbody>
                          {sem.courses.map((c, idx) => (
                            <tr key={`${c.code}-${idx}`} className="border-b border-gray-50 last:border-0 hover:bg-accent/5 transition-colors">
                              <td className="px-5 py-3 font-mono text-xs text-gray-600">{c.code}</td>
                              <td className="px-5 py-3 text-sm text-gray-800">
                                {c.title}
                                {c.elective && (
                                  <span className="ml-2 inline-block px-2 py-0.5 bg-accent/10 text-accent text-[10px] font-bold uppercase tracking-wider rounded">
                                    Elective
                                  </span>
                                )}
                              </td>
                              <td className="px-5 py-3 text-right font-display font-bold text-primary text-sm">
                                {c.credits.toFixed(2)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </details>
                );
              })}
            </div>
          </section>
        )}

        {/* Credit Distribution */}
        {distribution.length > 0 && (
          <section className="mb-14 md:mb-16">
            <SectionHeading overline="Summary" heading="Credit Distribution" />
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-x-auto">
              <table className="w-full min-w-[520px] border-collapse">
                <thead>
                  <tr className="border-b-2 border-primary/15 text-left">
                    <th className="px-4 py-3 text-[11px] font-bold tracking-wider uppercase text-gray-500">Semester</th>
                    <th className="px-4 py-3 text-[11px] font-bold tracking-wider uppercase text-gray-500 text-right">Core</th>
                    <th className="px-4 py-3 text-[11px] font-bold tracking-wider uppercase text-gray-500 text-right">Elective</th>
                    <th className="px-4 py-3 text-[11px] font-bold tracking-wider uppercase text-gray-500 text-right">Total</th>
                    <th className="px-4 py-3 text-[11px] font-bold tracking-wider uppercase text-gray-500 text-right">Cumulative</th>
                  </tr>
                </thead>
                <tbody>
                  {distribution.map((row) => (
                    <tr key={row.label} className="border-b border-gray-50 last:border-0 hover:bg-accent/5 transition-colors">
                      <td className="px-4 py-3 text-sm font-semibold text-gray-800">{row.label}</td>
                      <td className="px-4 py-3 text-right text-gray-600 text-sm">{row.core.toFixed(2)}</td>
                      <td className="px-4 py-3 text-right text-gray-600 text-sm">{row.elective.toFixed(2)}</td>
                      <td className="px-4 py-3 text-right font-semibold text-primary text-sm">{row.total.toFixed(2)}</td>
                      <td className="px-4 py-3 text-right font-display font-bold text-accent text-sm">{row.cumulative.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* PDF download + quick links */}
        <section className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-lg bg-primary/8 text-primary flex items-center justify-center shrink-0">
              <FileText size={20} />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-800">Course structure and credit distribution</p>
              <p className="text-xs text-gray-500">The tables on this page as a PDF you can keep.</p>
            </div>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            {curriculum.syllabusPdfUrl && (
              <a href={curriculum.syllabusPdfUrl} target="_blank" rel="noopener noreferrer"
                 className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-white font-medium rounded-lg px-4 py-2.5 text-sm transition-colors">
                <Download size={16} /> Download PDF
              </a>
            )}
          </div>
        </section>

        {/* Ready to Apply CTA */}
        <section className="relative mt-6 bg-primary text-white rounded-2xl shadow-2xl overflow-hidden">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 right-0 w-72 h-72 bg-accent/15 rounded-full blur-3xl -translate-y-1/3 translate-x-1/3" />
            <div className="absolute bottom-0 left-0 w-56 h-56 bg-white/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4" />
          </div>
          <div className="relative px-6 py-12 md:py-14 max-w-2xl mx-auto text-center">
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-4 leading-tight">
              Ready to Apply?
            </h2>
            <p className="text-white/80 text-base leading-relaxed mb-8">
              Take the next step toward your career in {curriculum.heroTitle}. Review the admission requirements or explore the tuition fee structure.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link href="/admission/requirements"
                    className="inline-flex items-center gap-2 bg-button-yellow hover:bg-button-yellow/90 text-primary font-bold rounded-lg px-6 py-3 text-sm transition-colors">
                <ClipboardCheck size={16} /> View Requirements
              </Link>
              <Link href="/admission/tuition-fees"
                    className="inline-flex items-center gap-2 border-2 border-white/70 hover:bg-white hover:text-primary text-white font-bold rounded-lg px-6 py-3 text-sm transition-colors">
                <CreditCard size={16} /> Tuition Fees
              </Link>
            </div>
          </div>
        </section>
      </div>
      </Container>
    </PageShell>
  );
}

function SectionHeading({ overline, heading }: { overline: string; heading: string }) {
  return (
    <div className="text-center max-w-2xl mx-auto mb-8">
      <span className="inline-block text-accent text-[11px] font-bold tracking-[0.3em] uppercase mb-2">
        {overline}
      </span>
      <h2 className="font-display text-2xl md:text-3xl font-bold text-primary leading-tight">
        {heading}
      </h2>
      <div className="mt-3 mx-auto h-1 w-16 bg-accent rounded-full" />
    </div>
  );
}
