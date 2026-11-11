'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { SWARA_GROUPS, sortSwaras } from '@/lib/music/swaras';
import { playSwara } from '@/lib/music/audio';
import { findRagasBySwaras, type RagaMatch } from '@/lib/music/catalog';
import { useScalePlayer } from '@/hooks/useScalePlayer';
import { ScaleNotes } from '@/components/music/ScaleNotes';
import { finderLink } from '@/lib/finderLink';
import { cn } from '@/lib/cn';

const KEYS = SWARA_GROUPS.flatMap((g) => g.variants.map((v) => v.symbol)).filter((s) => s !== 'S');

/** Tap the swaras you hear; matching ragas update instantly. */
export function SwaraLookup() {
  const player = useScalePlayer();
  const [swaras, setSwaras] = useState<string[]>(['R2', 'G3', 'P', 'D2']);
  const result = useMemo(() => (swaras.length >= 2 ? findRagasBySwaras(swaras, 8) : null), [swaras]);

  const toggle = (s: string) => {
    playSwara(s);
    setSwaras((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : sortSwaras([...prev, s])));
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_1.3fr]">
      <div className="card h-fit p-6 sm:p-8">
        <p className="text-muted">Sa is always included. Tap the other notes you hear.</p>
        <div className="mt-5 grid grid-cols-5 gap-1.5">
          {KEYS.map((s) => {
            const on = swaras.includes(s);
            return (
              <button
                key={s}
                type="button"
                onClick={() => toggle(s)}
                aria-pressed={on}
                className={cn('rounded-xl py-3 font-mono text-sm transition-all active:scale-95', on ? 'bg-espresso text-surface' : 'bg-canvas text-ink hover:bg-sand')}
              >
                {s}
              </button>
            );
          })}
        </div>
        <button type="button" onClick={() => setSwaras([])} className="link-underline mt-5 text-sm text-muted hover:text-ink">
          Clear all
        </button>
      </div>

      <div aria-live="polite">
        {!result ? (
          <p className="rounded-4xl border border-dashed border-ink/15 p-10 text-center text-muted">Pick at least two notes besides Sa.</p>
        ) : (
          <div className="space-y-6">
            <Group title={`Uses exactly S ${swaras.join(' ')}`} items={result.exact.slice(0, 8)} player={player} empty="No raga in the library uses exactly these notes." />
            {result.close.length > 0 && <Group title="Close matches" items={result.close} player={player} />}
          </div>
        )}
      </div>
    </div>
  );
}

function Group({ title, items, player, empty }: { title: string; items: RagaMatch[]; player: ReturnType<typeof useScalePlayer>; empty?: string }) {
  return (
    <section>
      <h3 className="text-[0.6875rem] uppercase tracking-eyebrow text-faint">{title}</h3>
      {items.length === 0 && empty ? (
        <p className="mt-3 text-muted">{empty}</p>
      ) : (
        <ul className="mt-3 space-y-2">
          {items.map((m) => (
            <li key={`${m.kind}-${m.name}`} className="flex flex-col gap-3 rounded-3xl border border-ink/[0.06] bg-surface p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <p className="text-ink">
                  {m.name} <span className="text-sm text-muted">· {m.kind === 'melakarta' ? `melakarta ${m.melakartaNumber}` : `from ${m.melakartaName}`}</span>
                </p>
                <ScaleNotes id={`lookup-${m.kind}-${m.name}`} scale={m.arohana} player={player} size="sm" className="mt-2" />
              </div>
              <Link href={finderLink(m.swaras)} className="link-underline shrink-0 text-sm text-muted hover:text-ink">
                Open in finder
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
