'use client';

import { useState } from 'react';
import Link from 'next/link';
import { CHAKRAS, MELAKARTAS, ordinal } from '@/lib/music/melakarta';
import { useScalePlayer } from '@/hooks/useScalePlayer';
import { ScaleNotes } from '@/components/music/ScaleNotes';
import { finderLink } from '@/lib/finderLink';
import { cn } from '@/lib/cn';

const OUTER = 150;
const INNER = 84;
const STEP = 360 / 72;

function polar(r: number, deg: number) {
  const a = ((deg - 90) * Math.PI) / 180;
  // Rounded so server and browser render identical markup (trig results can differ in the last digits).
  return [Math.round(r * Math.cos(a) * 100) / 100, Math.round(r * Math.sin(a) * 100) / 100];
}

function wedge(index: number) {
  const start = index * STEP + 0.4;
  const end = (index + 1) * STEP - 0.4;
  const [x1, y1] = polar(OUTER, start);
  const [x2, y2] = polar(OUTER, end);
  const [x3, y3] = polar(INNER, end);
  const [x4, y4] = polar(INNER, start);
  return `M${x1},${y1} A${OUTER},${OUTER} 0 0 1 ${x2},${y2} L${x3},${y3} A${INNER},${INNER} 0 0 0 ${x4},${y4} Z`;
}

/** Interactive wheel of the 72 melakartas, arranged by chakra. */
export function ChakraWheel() {
  const player = useScalePlayer();
  const [selected, setSelected] = useState(15);
  const mela = MELAKARTAS[selected - 1];
  const playing = player.playingId === `wheel-${mela.number}`;

  const choose = (n: number) => {
    setSelected(n);
    const m = MELAKARTAS[n - 1];
    void player.play(`wheel-${n}`, [...m.arohana.split(' ')], { noteDuration: 0.32 });
  };

  return (
    <div className="grid items-center gap-10 lg:grid-cols-[1.1fr_1fr]">
      <div className="relative mx-auto w-full max-w-[34rem]">
        <svg viewBox="-200 -200 400 400" className="w-full" role="group" aria-label="Melakarta wheel">
          <g className="animate-spin-slow" style={{ transformOrigin: 'center', transformBox: 'fill-box' }} aria-hidden>
            {Array.from({ length: 144 }, (_, i) => {
              const [x1, y1] = polar(186, i * 2.5);
              const [x2, y2] = polar(i % 12 === 0 ? 178 : 182, i * 2.5);
              return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#3a1a15" strokeOpacity={i % 12 === 0 ? 0.5 : 0.18} />;
            })}
          </g>
          {CHAKRAS.map((c) => {
            const [x, y] = polar(166, (c.number - 0.5) * 30);
            return (
              <text key={c.number} x={x} y={y} textAnchor="middle" dominantBaseline="middle" className="fill-muted text-[10px] uppercase tracking-[0.12em]">
                {c.name}
              </text>
            );
          })}
          {MELAKARTAS.map((m, i) => {
            const active = m.number === selected;
            const [lx, ly] = polar((OUTER + INNER) / 2, (i + 0.5) * STEP);
            return (
              <g key={m.number}>
                <path
                  d={wedge(i)}
                  role="button"
                  tabIndex={0}
                  aria-label={`${m.number}. ${m.name}`}
                  aria-pressed={active}
                  onClick={() => choose(m.number)}
                  onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), choose(m.number))}
                  className={cn(
                    'cursor-pointer outline-none transition-[fill] duration-300 focus-visible:stroke-coral focus-visible:stroke-2',
                    active ? 'fill-coral' : m.chakra.madhyamam === 'M1' ? 'fill-sand hover:fill-blush' : 'fill-[#d9c7b5] hover:fill-blush',
                  )}
                />
                {(i % 6 === 0 || active) && (
                  <text x={lx} y={ly} textAnchor="middle" dominantBaseline="middle" className={cn('pointer-events-none text-[8px]', active ? 'fill-surface' : 'fill-espresso/60')}>
                    {m.number}
                  </text>
                )}
              </g>
            );
          })}
          <circle r={INNER - 10} className="fill-espresso" />
          {playing && <circle r={INNER - 10} className="fill-coral/30 animate-ripple" style={{ transformOrigin: 'center', transformBox: 'fill-box' }} />}
          <text y={-14} textAnchor="middle" className="fill-surface/50 text-[9px] uppercase tracking-[0.16em]">
            Melakarta
          </text>
          <text y={18} textAnchor="middle" className="fill-surface text-[34px] tracking-tight">
            {mela.number}
          </text>
        </svg>
        <p className="mt-2 text-center text-sm text-muted">
          Lighter segments use M1 (shuddha madhyamam), darker ones M2 (prati madhyamam).
        </p>
      </div>

      <div className="card p-6 sm:p-8">
        <p className="text-[0.6875rem] uppercase tracking-eyebrow text-faint">
          Chakra {mela.chakra.number} · {mela.chakra.name} ({mela.chakra.meaning})
        </p>
        <h2 className="display mt-3 text-4xl sm:text-5xl">{mela.name}</h2>
        <p className="mt-3 text-muted">
          The {ordinal(mela.number)} melakarta. Choose any segment of the wheel to hear its scale.
        </p>
        <div className="mt-6 space-y-4">
          <ScaleNotes id={`wheel-${mela.number}`} label="Arohana" scale={mela.arohana} player={player} />
          <ScaleNotes id={`wheel-${mela.number}-ava`} label="Avarohana" scale={mela.avarohana} player={player} />
        </div>
        <div className="mt-7 flex flex-wrap gap-x-6 gap-y-2 border-t border-ink/[0.08] pt-5 text-sm">
          <Link href={finderLink(mela.swaras)} className="link-underline text-ink">
            Open in finder
          </Link>
          <Link href={`/ragas?view=janya`} className="link-underline text-muted hover:text-ink">
            Browse its janya ragas
          </Link>
        </div>
      </div>
    </div>
  );
}
