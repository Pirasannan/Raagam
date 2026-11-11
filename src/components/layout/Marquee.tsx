import { MARQUEE_RAGAS } from '@/lib/site';

function Glyph() {
  // A small veena-bridge glyph, echoing the reference design's separators.
  return (
    <svg viewBox="0 0 16 16" className="h-4 w-4 shrink-0 text-coral" aria-hidden>
      <path d="M3 3v10M8 5v8M13 3v10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

/** Endless strip of raga names. Duplicated once so the loop is seamless. */
export function Marquee() {
  const items = [...MARQUEE_RAGAS, ...MARQUEE_RAGAS];
  return (
    <div className="overflow-hidden border-y border-surface/10 bg-espresso py-5 text-surface" aria-hidden>
      <div className="flex w-max animate-marquee items-center gap-10 pr-10">
        {items.map((name, i) => (
          <span key={i} className="flex items-center gap-10 text-xl tracking-display sm:text-2xl">
            {name}
            <Glyph />
          </span>
        ))}
      </div>
    </div>
  );
}
