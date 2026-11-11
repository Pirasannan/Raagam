import { redirect } from 'next/navigation';
import { HomeHero } from '@/components/home/HomeHero';
import { ClosingCta, ContrastBand, ExploreSection, WelcomeSection } from '@/components/home/HomeSections';
import { Finder } from '@/components/finder/Finder';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { Reveal } from '@/components/ui/Reveal';

/** Old single-page tab URLs (/?tab=…) now live at their own routes. */
const LEGACY_TABS: Record<string, string> = {
  ragas: '/ragas',
  radio: '/radio',
  downloads: '/downloads',
  sos: '/practice',
  updates: '/updates',
};

interface HomeProps {
  searchParams: Promise<{ tab?: string; sub?: string; raga?: string; swaras?: string; song?: string }>;
}

export default async function HomePage({ searchParams }: HomeProps) {
  const params = await searchParams;
  if (params.tab && LEGACY_TABS[params.tab]) {
    const target = LEGACY_TABS[params.tab];
    if (params.tab === 'ragas' && params.sub) redirect(`${target}?view=${encodeURIComponent(params.sub)}`);
    if (params.tab === 'radio' && params.raga) redirect(`${target}?raga=${encodeURIComponent(params.raga)}`);
    redirect(target);
  }

  const initialSwaras = params.swaras
    ?.split(',')
    .map((s) => s.trim().toUpperCase())
    .filter((s) => /^[SRGMPDN][123]?$/.test(s));
  const initialSong = params.song?.slice(0, 300);

  return (
    <>
      <HomeHero />
      <WelcomeSection />
      <section id="finder" className="scroll-mt-24 py-20 sm:py-28">
        <div className="container-page">
          <Reveal className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <SectionHeading eyebrow="Raga finder" title="Three ways" accent="to find a raga." />
            <p className="max-w-sm text-lg leading-relaxed text-muted">
              Answers come from the song archive and the scale library first. Nothing is guessed when the notes can decide.
            </p>
          </Reveal>
          <div className="mt-10">
            <Finder initialSwaras={initialSwaras} initialSong={initialSong} />
          </div>
        </div>
      </section>
      <ExploreSection />
      <ContrastBand />
      <ClosingCta />
    </>
  );
}
