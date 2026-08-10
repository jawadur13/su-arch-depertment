import PageShell from '@/components/layout/PageShell';
import Container from '@/components/ui/Container';
import { getDepartmentLayouts, getPageHero, getUniversityIdentity } from '@/lib/identity';
import DepartmentLayoutClient from './DepartmentLayoutClient';
import OfficeDirectory from './OfficeDirectory';

export const metadata = {
  title: 'Department Layout — Department of Architecture',
  description: 'Department layout documents for Architecture at Sonargaon University.',
};

export default async function DepartmentLayoutPage() {
  const [entries, hero, university] = await Promise.all([
    getDepartmentLayouts(),
    getPageHero('about-department-layout'),
    getUniversityIdentity(),
  ]);
  const items = entries.map((p) => ({
    slug: p.slug,
    title: p.title,
    shortTitle: p.shortTitle,
    department: p.department,
    cover: p.coverUrl,
    pdf: p.pdfUrl ?? '',
  }));

  return (
    <PageShell
      title={hero?.heroTitle ?? 'Department Layout'}
      subtitle={hero?.heroSubtitle ?? undefined}
      overline={hero?.heroOverline ?? 'About'}
      image={hero?.heroImageUrl ?? '/assets/mission-vision-hero.webp'}
      imagePosition={hero ? `center ${hero.heroImageVerticalPercent}%` : 'top'}
      contentClassName="bg-gray-50 py-12 md:py-20"
    >
      <Container>
        <div className="max-w-3xl mx-auto">
          <OfficeDirectory address={university?.address ?? '147/I, Green Road, Panthapath, Tejgaon, Dhaka'} />
        </div>
        <DepartmentLayoutClient items={items} />
      </Container>
    </PageShell>
  );
}
