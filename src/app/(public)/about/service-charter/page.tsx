import PageShell from '@/components/layout/PageShell';
import Container from '@/components/ui/Container';
import { getServiceCharters, getPageHero } from '@/lib/identity';
import ServiceCharterClient from './ServiceCharterClient';
import ServiceDirectory from './ServiceDirectory';

export const metadata = {
  title: 'Service and Charter — Department of Architecture',
  description: 'Service and charter documents for Architecture at Sonargaon University.',
};

export default async function ServiceCharterPage() {
  const [entries, hero] = await Promise.all([
    getServiceCharters(),
    getPageHero('about-service-and-charter'),
  ]);
  const serviceItems = entries[0]?.serviceItems ?? [];
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
      title={hero?.heroTitle ?? 'Service and Charter'}
      subtitle={hero?.heroSubtitle ?? undefined}
      overline={hero?.heroOverline ?? 'About'}
      image={hero?.heroImageUrl ?? '/assets/mission-vision-hero.webp'}
      imagePosition={hero ? `center ${hero.heroImageVerticalPercent}%` : 'top'}
      contentClassName="bg-gray-50 py-12 md:py-20"
    >
      <Container>
        <div className="max-w-4xl mx-auto">
          <ServiceDirectory items={serviceItems} />
        </div>
        <ServiceCharterClient items={items} />
      </Container>
    </PageShell>
  );
}
