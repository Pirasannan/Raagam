'use client';

import { Pause, Play } from 'lucide-react';
import { useScalePlayer } from '@/hooks/useScalePlayer';
import { swaraRatio } from '@/lib/music/swaras';
import { cn } from '@/lib/cn';

const AROHANA = ['S', 'R1', 'G3', 'M1', 'P', 'D1', 'N3', "S'"];
const SEQUENCE = [...AROHANA, ...[...AROHANA].reverse().slice(1)];

const W = 240;
const H = 96;
const points = AROHANA.map((note, i) => {
  const cents = 1200 * Math.log2(swaraRatio(note) ?? 1);
  const round = (v: number) => Math.round(v * 100) / 100;
  return { note, x: round(10 + (i * (W - 20)) / (AROHANA.length - 1)), y: round(H - 8 - (cents / 1200) * (H - 20)) };
});
const path = points.map((p, i) => `${i ? 'L' : 'M'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
const area = `${path} L${W - 10},${H} L10,${H} Z`;

/** Dark card charting the rise of a scale. The dot follows the notes as they play. */
export function ContourCard({ className }: { className?: string }) {
  const player = useScalePlayer();
  const playing = player.playingId === 'hero-contour';
  const step = playing && player.noteIndex >= 0 ? player.noteIndex : -1;
  const position = step < 0 ? AROHANA.length - 1 : step < AROHANA.length ? step : SEQUENCE.length - 1 - step;
  const dot = points[position];

  return (
    <div className={cn('w-full max-w-[19rem] rounded-3xl bg-espresso p-5 text-left text-surface shadow-lift', className)}>
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[0.95rem] tracking-[-0.01em]">Mayamalavagowla</p>
          <p className="text-xs text-surface/50">Arohana · avarohana</p>
        </div>
        <button
          type="button"
          onClick={() => player.toggle('hero-contour', SEQUENCE, { noteDuration: 0.36 })}
          className="flex items-center gap-1.5 rounded-full bg-coral px-3 py-1.5 text-xs font-medium text-surface transition-colors hover:bg-coral-dark"
          aria-label={playing ? 'Stop scale' : 'Play scale'}
        >
          {playing ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
          {playing ? 'Stop' : 'Play'}
        </button>
      </div>
      <svg viewBox={`0 0 ${W} ${H + 18}`} className="mt-4 w-full overflow-visible" aria-hidden>
        <defs>
          <linearGradient id="contour-fill" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#e0583e" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#e0583e" stopOpacity="0" />
          </linearGradient>
        </defs>
        {[0.25, 0.5, 0.75].map((f) => (
          <line key={f} x1="10" x2={W - 10} y1={H * f} y2={H * f} stroke="#f8f4ef" strokeOpacity="0.06" />
        ))}
        <path d={area} fill="url(#contour-fill)" />
        <path d={path} fill="none" stroke="#e0583e" strokeWidth="2" strokeLinejoin="round" className="animate-draw" style={{ '--path-length': 420 } as React.CSSProperties} />
        {points.map((p, i) => (
          <g key={p.note}>
            <circle cx={p.x} cy={p.y} r="2.2" fill="#f8f4ef" fillOpacity={i === position ? 0 : 0.35} />
            <text x={p.x} y={H + 14} textAnchor="middle" className={cn('fill-current text-[9px]', i === position ? 'text-coral' : 'text-surface/45')}>
              {p.note}
            </text>
          </g>
        ))}
        <g style={{ transform: `translate(${dot.x}px, ${dot.y}px)`, transition: 'transform 0.3s cubic-bezier(0.3,0.7,0.2,1)' }}>
          <circle r="9" fill="#e0583e" fillOpacity="0.25" className={playing ? 'animate-ripple' : undefined} style={{ transformBox: 'fill-box', transformOrigin: 'center' }} />
          <circle r="4.5" fill="#e0583e" stroke="#f8f4ef" strokeWidth="1.5" />
        </g>
      </svg>
    </div>
  );
}
