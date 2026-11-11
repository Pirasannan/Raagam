import Link from 'next/link';
import { AudioLines, BookOpen, Disc3, Grid3x3, Radio, Waves } from 'lucide-react';
import { Reveal } from '@/components/ui/Reveal';
import { Eyebrow } from '@/components/ui/Eyebrow';
import { ButtonLink } from '@/components/ui/Button';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { Equalizer } from '@/components/ui/Equalizer';
import { BreathingOrb } from '@/components/music/BreathingOrb';

const STRIP = [
  { icon: AudioLines, label: 'Swara keyboard' },
  { icon: BookOpen, label: '908 janya ragas' },
  { icon: Grid3x3, label: '72 melakartas' },
  { icon: Radio, label: '90 radio channels' },
  { icon: Waves, label: 'Tanpura drone' },
];

export function WelcomeSection() {
  return (
    <section className="bg-espresso text-surface">
      <div className="container-page">
        <ul className="no-scrollbar flex gap-8 overflow-x-auto border-b border-surface/10 py-7 md:justify-between">
          {STRIP.map(({ icon: Icon, label }) => (
            <li key={label} className="flex shrink-0 items-center gap-3 text-lg tracking-[-0.02em]">
              <Icon className="h-5 w-5 text-coral" strokeWidth={1.6} />
              {label}
            </li>
          ))}
        </ul>

        <Reveal className="py-20 text-center sm:py-28">
          <Eyebrow tone="dark">Why Raagam</Eyebrow>
          <h2 className="display mx-auto mt-6 max-w-3xl text-[2.15rem] sm:text-5xl">
            You don&apos;t need theory
            <br />
            <span className="text-surface/45">to recognise a raga.</span>
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-surface/60 sm:text-xl">
            A raga is a feeling before it is a scale. Start from what you hear — a phrase, a song, a handful of notes — and Raagam
            shows you its name, its notes and the family it belongs to.
          </p>
        </Reveal>

        <div className="grid border-t border-surface/10 md:grid-cols-3">
          {[
            { word: 'listen.', text: 'Play any scale and hear each swara light up as it sounds.', coral: false },
            { word: 'recognise.', text: 'Match swaras or songs against thousands of entries.', coral: true },
            { word: 'practise.', text: 'Sing against a tanpura and train your ear on look-alike ragas.', coral: false },
          ].map((item, i) => (
            <Reveal key={item.word} delay={i * 120} className="border-surface/10 py-10 md:border-l md:px-8 md:first:border-l-0 md:first:pl-0">
              <p className="text-[0.6875rem] uppercase tracking-eyebrow text-surface/50">A way to</p>
              <p className={`mt-2 font-serif text-6xl italic leading-none sm:text-7xl ${item.coral ? 'text-coral' : 'text-surface'}`}>{item.word}</p>
              <p className="mt-4 text-surface/55">{item.text}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

const EXPLORE = [
  {
    href: '/ragas',
    tag: 'Raga library',
    title: 'Every janya, playable.',
    text: 'Search 908 janya ragas by name, parent or notes. Filter by type and hear the arohana and avarohana in one tap.',
    cta: 'Browse ragas',
    visual: 'notes',
  },
  {
    href: '/melakarta',
    tag: 'Melakarta system',
    title: 'Seventy-two parent scales.',
    text: 'See how the 72 melakartas fall into twelve chakras, and how a single change of swara moves you to the next.',
    cta: 'Open the chakra',
    visual: 'wheel',
  },
  {
    href: '/radio',
    tag: 'Raga radio',
    title: 'Learn a raga through songs.',
    text: 'Ninety channels, one per raga, filled with film songs composed in it. Tune in and let the raga settle in your ear.',
    cta: 'Tune in',
    visual: 'radio',
  },
  {
    href: '/practice',
    tag: 'Practice room',
    title: 'A drone and a quiet ear.',
    text: 'A tanpura in any shruti, side-by-side comparisons of ragas that are easily confused, and a quick swara lookup.',
    cta: 'Start practising',
    visual: 'orb',
  },
] as const;

function Visual({ kind }: { kind: (typeof EXPLORE)[number]['visual'] }) {
  if (kind === 'notes') {
    return (
      <div className="flex h-full flex-col justify-center gap-2 px-6">
        {["S R2 G3 P D2 S'", "S R2 M1 P N2 S'", "S G2 M1 D1 N2 S'"].map((row, r) => (
          <div key={row} className="flex gap-1.5" style={{ opacity: 1 - r * 0.25 }}>
            {row.split(' ').map((n, i) => (
              <span key={i} className="rounded-md bg-surface px-2 py-1 font-mono text-xs text-ink shadow-card">
                {n}
              </span>
            ))}
          </div>
        ))}
      </div>
    );
  }
  if (kind === 'wheel') {
    return (
      <div className="flex h-full items-center justify-center">
        <svg viewBox="-60 -60 120 120" className="h-36 w-36 animate-spin-slow" aria-hidden>
          {Array.from({ length: 72 }, (_, i) => {
            const a = (i / 72) * Math.PI * 2;
            const long = i % 6 === 0;
            return (
              <line
                key={i}
                x1={Math.cos(a) * (long ? 34 : 42)}
                y1={Math.sin(a) * (long ? 34 : 42)}
                x2={Math.cos(a) * 52}
                y2={Math.sin(a) * 52}
                stroke={long ? '#e0583e' : '#3a1a15'}
                strokeOpacity={long ? 1 : 0.35}
                strokeWidth={long ? 1.6 : 0.8}
              />
            );
          })}
          <circle r="22" fill="#3a1a15" />
          <circle r="6" fill="#e0583e" />
        </svg>
      </div>
    );
  }
  if (kind === 'radio') {
    return (
      <div className="flex h-full items-center justify-center gap-4 text-coral">
        <Disc3 className="h-16 w-16 text-espresso animate-spin-slow" style={{ animationDuration: '6s' }} strokeWidth={1.2} />
        <Equalizer bars={7} height={56} barWidth={6} gap={4} />
      </div>
    );
  }
  return (
    <div className="flex h-full items-center justify-center">
      <BreathingOrb className="w-40" />
    </div>
  );
}

export function ExploreSection() {
  return (
    <section className="py-20 sm:py-28">
      <div className="container-page">
        <Reveal className="flex flex-col justify-between gap-8 md:flex-row md:items-end">
          <SectionHeading eyebrow="Explore" title="Everything a raga" accent="has to say." />
          <p className="max-w-sm text-lg leading-relaxed text-muted">
            Beyond the finder, Raagam is a small library you can wander through, with every scale ready to play.
          </p>
        </Reveal>

        <div className="mt-12 rounded-5xl bg-[radial-gradient(120%_80%_at_15%_10%,#c98157_0%,#a3552e_38%,#7a3420_75%,#4a1f17_100%)] p-3 sm:p-5">
          <div className="grid gap-3 sm:gap-4 md:grid-cols-2">
            {EXPLORE.map((item, i) => (
              <Reveal key={item.href} delay={(i % 2) * 120}>
                <Link href={item.href} className="group flex h-full flex-col rounded-4xl bg-surface p-2 transition-transform duration-500 hover:-translate-y-1">
                  <div className="relative h-48 overflow-hidden rounded-[1.6rem] bg-[linear-gradient(180deg,#ece2d6,#ddcfc0)]">
                    <span className="absolute left-3 top-3 z-10 rounded-full bg-surface px-2.5 py-1 font-mono text-xs text-ink">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <span className="absolute bottom-3 left-4 z-10 text-[0.6875rem] uppercase tracking-eyebrow text-espresso/70">{item.tag}</span>
                    <Visual kind={item.visual} />
                  </div>
                  <div className="flex flex-1 flex-col px-4 pb-4 pt-5">
                    <h3 className="text-2xl tracking-display text-ink">{item.title}</h3>
                    <p className="mt-2 flex-1 leading-relaxed text-muted">{item.text}</p>
                    <span className="mt-5 flex items-center justify-between text-ink">
                      {item.cta}
                      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-espresso text-surface transition-transform duration-300 group-hover:rotate-[8deg]">
                        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                          <path d="M7 17 17 7M8 7h9v9" />
                        </svg>
                      </span>
                    </span>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export function ContrastBand() {
  const lines = [
    ['Less guessing.', 'More listening.'],
    ['Less theory.', 'More feeling.'],
    ['Less memorising.', 'More music.'],
  ];
  return (
    <section className="bg-blush py-20 sm:py-28">
      <div className="container-page text-center">
        <Reveal>
          <Eyebrow>A different way in</Eyebrow>
          <h2 className="display mx-auto mt-6 max-w-2xl text-[2.15rem] sm:text-5xl">A raga is not a puzzle to be solved.</h2>
          <p className="mx-auto mt-5 max-w-xl text-lg text-ink/75">
            It is a mood with a grammar. Raagam keeps the grammar close at hand so you can stay with the mood.
          </p>
        </Reveal>
        <div className="mt-12 space-y-2 sm:mt-16">
          {lines.map(([less, more], i) => (
            <Reveal key={less} delay={i * 140} className="flex flex-wrap items-baseline justify-center gap-x-4 text-[2rem] leading-tight sm:text-6xl">
              <span className="text-ink/35 line-through decoration-coral decoration-2">{less}</span>
              <span className="font-serif italic text-ink">{more}</span>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

export function ClosingCta() {
  return (
    <section className="relative overflow-hidden bg-[linear-gradient(135deg,#b8653b_0%,#8e4127_45%,#4a1f17_100%)] py-20 text-surface sm:py-28">
      <div className="pointer-events-none absolute -right-40 top-10 h-[32rem] w-[32rem] rounded-full border border-surface/20" aria-hidden />
      <div className="pointer-events-none absolute -right-24 top-24 h-[24rem] w-[24rem] rounded-full border border-surface/10 animate-ripple" style={{ animationDuration: '7s' }} aria-hidden />
      <Reveal className="container-page relative text-center">
        <h2 className="display text-[2.4rem] sm:text-6xl">There is no wrong note to begin with.</h2>
        <p className="mt-4 font-serif text-3xl italic text-surface/85 sm:text-4xl">Only the next one.</p>
        <div className="mt-9 flex flex-wrap justify-center gap-3">
          <ButtonLink href="#finder" variant="light">
            Find a raga
          </ButtonLink>
          <ButtonLink href="/practice" variant="ghost">
            Open the practice room
          </ButtonLink>
        </div>
      </Reveal>
    </section>
  );
}
