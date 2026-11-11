'use client';

import { useEffect, useRef, useState } from 'react';
import { Headphones, LockOpen, Waves } from 'lucide-react';
import { Tanpura } from '@/lib/music/audio';
import { Eyebrow } from '@/components/ui/Eyebrow';
import { ButtonLink } from '@/components/ui/Button';
import { BreathingOrb } from '@/components/music/BreathingOrb';
import { TanpuraArch } from './TanpuraArch';
import { ContourCard } from './ContourCard';

const STRING_NAMES = ['Pa', 'Sa', 'Sa', 'Sa'];

export function HomeHero() {
  const tanpura = useRef<Tanpura | null>(null);
  const [pluck, setPluck] = useState<{ index: number; count: number } | null>(null);
  const playing = pluck !== null;

  useEffect(() => () => tanpura.current?.stop(), []);

  const toggleDrone = () => {
    if (playing) {
      tanpura.current?.stop();
      setPluck(null);
      return;
    }
    tanpura.current ??= new Tanpura({
      saHz: 261.63,
      tuning: 'Pa',
      volume: 0.55,
      onPluck: (index) => setPluck((prev) => ({ index, count: (prev?.count ?? 0) + 1 })),
    });
    tanpura.current.start();
  };

  return (
    <section className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[44rem] bg-[radial-gradient(60%_50%_at_50%_10%,#f8f4ef_0%,rgba(248,244,239,0)_70%)]" aria-hidden />
      <div className="container-page relative pt-14 text-center sm:pt-20">
        <div className="animate-fade-up">
          <Eyebrow>Carnatic &amp; Hindustani ragas</Eyebrow>
        </div>
        <h1 className="display mx-auto mt-6 max-w-4xl text-[2.9rem] animate-fade-up sm:text-7xl lg:text-[5.5rem]" style={{ animationDelay: '80ms' }}>
          Hear a raga.
          <br />
          <span className="text-coral">Know its name.</span>
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-muted animate-fade-up sm:text-lg" style={{ animationDelay: '160ms' }}>
          Tap the swaras you hear, type a song or kriti, or write out the notes. Raagam finds the raga, plays its scale and shows where it
          comes from.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3 animate-fade-up" style={{ animationDelay: '240ms' }}>
          <ButtonLink href="#finder">Find a raga</ButtonLink>
          <ButtonLink href="/ragas" variant="light">
            Explore 908 ragas
          </ButtonLink>
        </div>
        <ul className="mt-7 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[0.6875rem] font-medium uppercase tracking-eyebrow text-muted animate-fade-up" style={{ animationDelay: '320ms' }}>
          <li className="flex items-center gap-1.5">
            <LockOpen className="h-3.5 w-3.5 text-coral" /> No sign-in
          </li>
          <li className="flex items-center gap-1.5">
            <Headphones className="h-3.5 w-3.5 text-coral" /> Plays in your browser
          </li>
          <li className="flex items-center gap-1.5">
            <Waves className="h-3.5 w-3.5 text-coral" /> Just intonation
          </li>
        </ul>

        <div className="relative mx-auto mt-14 max-w-5xl md:h-[34rem]">
          <TanpuraArch pluck={pluck} className="mx-auto h-[24rem] w-[17rem] sm:h-[30rem] sm:w-[22rem] md:absolute md:bottom-0 md:left-1/2 md:h-[34rem] md:w-[26rem] md:-translate-x-1/2" />

          <div className="relative -mt-24 flex flex-col items-center gap-4 px-2 pb-12 md:static md:mt-0 md:p-0">
            <button
              type="button"
              onClick={toggleDrone}
              aria-pressed={playing}
              className="group w-full max-w-[16rem] rounded-3xl border border-ink/[0.06] bg-surface/90 p-4 text-left shadow-lift backdrop-blur transition-transform duration-500 hover:-translate-y-1 md:absolute md:left-0 md:top-10 lg:-left-6"
            >
              <span className="flex items-center justify-between">
                <span className="text-[0.95rem] tracking-[-0.01em] text-ink">Tanpura drone</span>
                <span className="font-mono text-xs text-faint">{playing ? STRING_NAMES[pluck.index] : 'Sa = C'}</span>
              </span>
              <BreathingOrb active={playing} label={playing ? 'Breathe' : 'Play'} className="mx-auto my-2 w-36" />
              <span className="block text-center text-sm leading-snug text-muted">
                {playing ? 'Breathe in on Pa, out on Sa. Tap to stop.' : 'Tap to start a drone and sing along.'}
              </span>
            </button>

            <ContourCard className="md:absolute md:right-0 md:top-36 lg:-right-6" />

            <p className="text-sm text-muted md:absolute md:bottom-6 md:left-6 md:max-w-[12rem] md:text-left">
              <span className="block text-2xl tracking-display text-ink">5,187</span>
              songs and kritis mapped to their ragas
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
