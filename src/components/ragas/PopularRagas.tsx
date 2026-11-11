'use client';

import Link from 'next/link';
import seedRagas from '@/data/seed_ragas.json';
import { useScalePlayer } from '@/hooks/useScalePlayer';
import { ScaleNotes } from '@/components/music/ScaleNotes';
import { finderLink } from '@/lib/finderLink';

interface SeedRaga {
  id: string;
  name: string;
  alternateNames?: string[];
  melakartaNumber?: number;
  thaat?: string;
  arohana: string;
  avarohana: string;
  swaras: string[];
  westernScale?: string;
  rasa?: string;
  timeOfDay?: string;
  description?: string;
  famousSongs?: Array<{ title: string; composerOrFilm?: string }>;
}

const RAGAS = seedRagas as SeedRaga[];

/** Detailed cards for the most commonly taught ragas. */
export function PopularRagas() {
  const player = useScalePlayer();
  return (
    <ul className="grid gap-4 md:grid-cols-2">
      {RAGAS.map((raga) => (
        <li key={raga.id} className="card flex flex-col p-6 sm:p-7">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-3xl tracking-display">{raga.name}</h3>
              {raga.alternateNames?.length ? <p className="mt-1 font-serif text-lg italic text-muted">{raga.alternateNames.join(' · ')}</p> : null}
            </div>
            <div className="flex shrink-0 gap-1.5 text-xs">
              {raga.melakartaNumber && <span className="rounded-full bg-espresso px-2.5 py-1 text-surface">Mela {raga.melakartaNumber}</span>}
              {raga.thaat && <span className="rounded-full bg-canvas px-2.5 py-1 text-muted">{raga.thaat}</span>}
            </div>
          </div>
          {raga.description && <p className="mt-4 leading-relaxed text-muted">{raga.description}</p>}
          <div className="mt-5 space-y-4">
            <ScaleNotes id={`${raga.id}-aro`} label="Arohana" scale={raga.arohana} player={player} size="sm" />
            <ScaleNotes id={`${raga.id}-ava`} label="Avarohana" scale={raga.avarohana} player={player} size="sm" />
          </div>
          <dl className="mt-5 grid grid-cols-2 gap-2 text-sm">
            {raga.rasa && (
              <div className="rounded-2xl bg-canvas/70 p-3">
                <dt className="text-[0.625rem] uppercase tracking-eyebrow text-faint">Mood</dt>
                <dd className="mt-1 text-ink">{raga.rasa}</dd>
              </div>
            )}
            {raga.timeOfDay && (
              <div className="rounded-2xl bg-canvas/70 p-3">
                <dt className="text-[0.625rem] uppercase tracking-eyebrow text-faint">Time</dt>
                <dd className="mt-1 text-ink">{raga.timeOfDay}</dd>
              </div>
            )}
            {raga.westernScale && (
              <div className="col-span-2 rounded-2xl bg-canvas/70 p-3">
                <dt className="text-[0.625rem] uppercase tracking-eyebrow text-faint">Western notes from C</dt>
                <dd className="mt-1 text-ink">{raga.westernScale}</dd>
              </div>
            )}
          </dl>
          {raga.famousSongs?.length ? (
            <p className="mt-5 text-sm text-muted">
              <span className="text-ink">Listen to: </span>
              {raga.famousSongs
                .slice(0, 3)
                .map((s) => s.title + (s.composerOrFilm ? ` (${s.composerOrFilm})` : ''))
                .join(', ')}
            </p>
          ) : null}
          <Link href={finderLink(raga.swaras)} className="link-underline mt-5 self-start text-sm text-ink">
            Open in finder
          </Link>
        </li>
      ))}
    </ul>
  );
}
