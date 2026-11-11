'use client';

import { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { LOOKALIKES, type LookalikeSide } from '@/lib/music/lookalikes';
import { useScalePlayer } from '@/hooks/useScalePlayer';
import { ScaleNotes } from '@/components/music/ScaleNotes';

/** Side-by-side comparison of ragas that are easily confused. */
export function LookalikePairs() {
  const player = useScalePlayer();
  const [query, setQuery] = useState('');
  const pairs = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? LOOKALIKES.filter((p) => [p.a.name, p.b.name, p.difference].some((t) => t.toLowerCase().includes(q))) : LOOKALIKES;
  }, [query]);

  return (
    <div>
      <div className="relative max-w-md">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-faint" />
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Find a raga, e.g. Mohanam" className="field pl-10" aria-label="Search look-alike ragas" />
      </div>
      {pairs.length === 0 && <p className="py-16 text-center text-muted">No pair mentions “{query}”.</p>}
      <ul className="mt-8 space-y-4">
        {pairs.map((pair) => {
          const sameNotes = pair.a.play.join() === pair.b.play.join();
          return (
            <li key={pair.id} className="card overflow-hidden">
              <div className="grid md:grid-cols-2">
                <Side side={pair.a} id={`${pair.id}-a`} player={player} />
                <Side side={pair.b} id={`${pair.id}-b`} player={player} border />
              </div>
              <div className="border-t border-ink/[0.06] bg-canvas/60 px-6 py-5 sm:px-8">
                <p className="text-[0.6875rem] uppercase tracking-eyebrow text-coral-dark">How to tell them apart</p>
                <p className="mt-2 text-[1.05rem] leading-relaxed text-ink">{pair.difference}</p>
                {sameNotes && <p className="mt-2 text-sm text-muted">The playback is identical because the difference lies in ornamentation, which a plain synthesizer cannot reproduce.</p>}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function Side({ side, id, player, border }: { side: LookalikeSide; id: string; player: ReturnType<typeof useScalePlayer>; border?: boolean }) {
  return (
    <div className={border ? 'border-t border-ink/[0.06] p-6 sm:p-8 md:border-l md:border-t-0' : 'p-6 sm:p-8'}>
      <div className="flex items-baseline justify-between gap-3">
        <h3 className="text-2xl tracking-display">{side.name}</h3>
        <span className="text-xs uppercase tracking-eyebrow text-faint">{side.tradition}</span>
      </div>
      <p className="mt-2 leading-relaxed text-muted">{side.about}</p>
      <ScaleNotes id={id} scale={side.scale} notes={side.play} player={player} size="sm" className="mt-5" />
    </div>
  );
}
