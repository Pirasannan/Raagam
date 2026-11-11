import type { Metadata } from 'next';
import { PageHeader } from '@/components/layout/PageHeader';
import { ChakraWheel } from '@/components/melakarta/ChakraWheel';
import { MelakartaGrid } from '@/components/ragas/MelakartaGrid';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { Reveal } from '@/components/ui/Reveal';
import { Eyebrow } from '@/components/ui/Eyebrow';

export const metadata: Metadata = {
  title: 'The 72 melakartas',
  description: 'The 72 melakarta parent scales of Carnatic music, arranged in 12 chakras, with the Katapayadi rule for finding their numbers.',
};

const STEPS = [
  {
    title: 'Madhyamam splits the system',
    text: 'Melakartas 1–36 use shuddha madhyamam (M1). Melakartas 37–72 repeat the same pattern with prati madhyamam (M2).',
  },
  {
    title: 'The chakra fixes Ri and Ga',
    text: 'Each half has six chakras of six ragas. Within a chakra the rishabham and gandharam never change.',
  },
  {
    title: 'The position fixes Dha and Ni',
    text: 'The six ragas of a chakra walk through the six Dha–Ni pairs, from D1 N1 to D3 N3, in the same order every time.',
  },
  {
    title: 'The name carries the number',
    text: 'The first two syllables of each name encode its number through the Katapayadi system. Read them, then reverse the digits.',
  },
];

const KATAPAYADI = [
  ['1', 'ka · ṭa · pa · ya'],
  ['2', 'kha · ṭha · pha · ra'],
  ['3', 'ga · ḍa · ba · la'],
  ['4', 'gha · ḍha · bha · va'],
  ['5', 'ṅa · ṇa · ma · śa'],
  ['6', 'ca · ta · ṣa'],
  ['7', 'cha · tha · sa'],
  ['8', 'ja · da · ha'],
  ['9', 'jha · dha'],
  ['0', 'ña · na'],
];

const EXAMPLES = [
  { name: 'Kharaharapriya', first: 'kha = 2', second: 'ra = 2', number: 22 },
  { name: 'Mayamalavagowla', first: 'ma = 5', second: 'ya = 1', number: 15 },
  { name: 'Dheerasankarabharanam', first: 'dhī = 9', second: 'ra = 2', number: 29 },
  { name: 'Mechakalyani', first: 'me = 5', second: 'ca = 6', number: 65 },
  { name: 'Hanumatodi', first: 'ha = 8', second: 'nu = 0', number: 8 },
  { name: 'Charukesi', first: 'ca = 6', second: 'ru = 2', number: 26 },
];

export default function MelakartaPage() {
  return (
    <>
      <PageHeader
        eyebrow="Melakarta system"
        title="Seventy-two scales."
        accent="One wheel."
        description="Every Carnatic raga descends from one of 72 complete parent scales. They are arranged so precisely that a raga's name tells you its number, and its number tells you its notes."
      />

      <section className="container-page pb-24">
        <ChakraWheel />
      </section>

      <section className="bg-espresso py-20 text-surface sm:py-28">
        <div className="container-page grid gap-12 lg:grid-cols-[0.9fr_1.1fr]">
          <Reveal>
            <SectionHeading tone="dark" eyebrow="How it works" title="A system you can" accent="work out by hand." />
            <p className="mt-6 max-w-md text-lg leading-relaxed text-surface/60">
              Once you see the pattern, you never need to memorise a melakarta scale again.
            </p>
          </Reveal>
          <ol className="divide-y divide-surface/10 border-y border-surface/10">
            {STEPS.map((step, i) => (
              <Reveal as="li" key={step.title} delay={i * 100} className="flex gap-5 py-7">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-surface/15 font-mono text-sm text-surface/70">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <div>
                  <h3 className="text-2xl tracking-display">{step.title}</h3>
                  <p className="mt-2 leading-relaxed text-surface/60">{step.text}</p>
                </div>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      <section className="py-20 sm:py-28">
        <div className="container-page">
          <Reveal className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <SectionHeading eyebrow="Katapayadi" title="Read the number" accent="hidden in the name." />
            <p className="max-w-sm text-lg leading-relaxed text-muted">
              Each consonant stands for a digit. Take the first two syllables, then read the digits right to left.
            </p>
          </Reveal>
          <div className="mt-10 grid gap-4 lg:grid-cols-[1fr_1.3fr]">
            <Reveal className="card p-6">
              <h3 className="text-[0.6875rem] uppercase tracking-eyebrow text-faint">Consonant → digit</h3>
              <dl className="mt-4 grid grid-cols-1 gap-x-6 sm:grid-cols-2">
                {KATAPAYADI.map(([digit, letters]) => (
                  <div key={digit} className="flex items-baseline gap-4 border-b border-ink/[0.06] py-2.5">
                    <dt className="w-5 font-mono text-coral">{digit}</dt>
                    <dd className="text-ink">{letters}</dd>
                  </div>
                ))}
              </dl>
            </Reveal>
            <Reveal delay={120} className="grid gap-3 sm:grid-cols-2">
              {EXAMPLES.map((ex) => (
                <div key={ex.name} className="rounded-3xl border border-ink/[0.06] bg-surface p-5">
                  <p className="text-lg tracking-[-0.02em]">{ex.name}</p>
                  <p className="mt-1 font-mono text-sm text-muted">
                    {ex.first}, {ex.second}
                  </p>
                  <p className="mt-3 flex items-baseline justify-between">
                    <span className="text-sm text-muted">reversed</span>
                    <span className="text-3xl tracking-display text-coral">{ex.number}</span>
                  </p>
                </div>
              ))}
            </Reveal>
          </div>
        </div>
      </section>

      <section className="border-t border-ink/10 py-20 sm:py-24">
        <div className="container-page">
          <Eyebrow>All 72</Eyebrow>
          <h2 className="display mt-5 text-[2.15rem] sm:text-5xl">The complete list</h2>
          <div className="mt-10">
            <MelakartaGrid />
          </div>
        </div>
      </section>
    </>
  );
}
