'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Search } from 'lucide-react';
import { CHAKRAS, MELAKARTAS } from '@/lib/music/melakarta';
import { useScalePlayer } from '@/hooks/useScalePlayer';
import { ScaleNotes } from '@/components/music/ScaleNotes';
import { finderLink } from '@/lib/finderLink';
import { cn } from '@/lib/cn';

/** The 72 melakartas grouped by chakra, each with a playable scale. */
export function MelakartaGrid({ chakra, onChakraChange }: { chakra?: number | null; onChakraChange?: (n: number | null) => void }) {
  const player = useScalePlayer();
  const [query, setQuery] = useState('');
  const [localChakra, setLocalChakra] = useState<number | null>(null);
  const active = chakra !== undefined ? chakra : localChakra;
  const setActive = onChakraChange ?? setLocalChakra;

  const groups = useMemo(() => {
    const q = query.trim().toLowerCase();
    return CHAKRAS.filter((c) => active === null || c.number === active)
      .map((c) => ({
        chakra: c,
        ragas: MELAKARTAS.filter(
          (m) => m.chakra.number === c.number && (!q || m.name.toLowerCase().includes(q) || String(m.number) === q || m.arohana.toLowerCase().includes(q)),
        ),
      }))
      .filter((g) => g.ragas.length > 0);
  }, [active, query]);

  return (
    <div>
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="relative md:w-80">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-faint" />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Name, number or notes" className="field pl-10" aria-label="Search melakartas" />
        </div>
        <div className="no-scrollbar -mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1">
          <button type="button" onClick={() => setActive(null)} className={cn('chip shrink-0', active === null && 'border-espresso bg-espresso text-surface hover:text-surface')}>
            All chakras
          </button>
          {CHAKRAS.map((c) => (
            <button
              key={c.number}
              type="button"
              onClick={() => setActive(active === c.number ? null : c.number)}
              className={cn('chip shrink-0', active === c.number && 'border-espresso bg-espresso text-surface hover:text-surface')}
            >
              {c.number}. {c.name}
            </button>
          ))}
        </div>
      </div>

      {groups.length === 0 && <p className="py-16 text-center text-muted">No melakarta matches “{query}”.</p>}

      <div className="mt-8 space-y-10">
        {groups.map(({ chakra: c, ragas }) => (
          <section key={c.number} aria-labelledby={`chakra-${c.number}`}>
            <div className="flex items-baseline justify-between gap-4 border-b border-ink/10 pb-3">
              <h3 id={`chakra-${c.number}`} className="text-2xl tracking-display">
                <span className="text-faint">{String(c.number).padStart(2, '0')}</span> {c.name}{' '}
                <span className="font-serif text-xl italic text-muted">{c.meaning}</span>
              </h3>
              <span className="shrink-0 font-mono text-sm text-muted">{c.madhyamam}</span>
            </div>
            <ul className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {ragas.map((m) => (
                <li key={m.number} className="card flex flex-col rounded-3xl p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-mono text-xs text-faint">No. {m.number}</p>
                      <p className="mt-0.5 text-xl tracking-[-0.02em]">{m.name}</p>
                    </div>
                    <Link href={finderLink(m.swaras)} className="link-underline shrink-0 text-sm text-muted hover:text-ink">
                      Open in finder
                    </Link>
                  </div>
                  <ScaleNotes id={`mela-${m.number}`} scale={m.arohana} player={player} size="sm" className="mt-4" />
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
