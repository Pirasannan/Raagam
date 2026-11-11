'use client';

import { useState } from 'react';
import { Pause, Play, RotateCcw } from 'lucide-react';
import { SWARA_GROUPS, sortSwaras } from '@/lib/music/swaras';
import { playSwara } from '@/lib/music/audio';
import { useScalePlayer } from '@/hooks/useScalePlayer';
import { cn } from '@/lib/cn';

export const PRESETS: Array<{ name: string; swaras: string[] }> = [
  { name: 'Mayamalavagowla', swaras: ['S', 'R1', 'G3', 'M1', 'P', 'D1', 'N3'] },
  { name: 'Mohanam', swaras: ['S', 'R2', 'G3', 'P', 'D2'] },
  { name: 'Kalyani', swaras: ['S', 'R2', 'G3', 'M2', 'P', 'D2', 'N3'] },
  { name: 'Kharaharapriya', swaras: ['S', 'R2', 'G2', 'M1', 'P', 'D2', 'N2'] },
  { name: 'Keeravani', swaras: ['S', 'R2', 'G2', 'M1', 'P', 'D1', 'N3'] },
  { name: 'Hamsadhwani', swaras: ['S', 'R2', 'G3', 'P', 'N3'] },
  { name: 'Hindolam', swaras: ['S', 'G2', 'M1', 'D1', 'N2'] },
  { name: 'Charukesi', swaras: ['S', 'R2', 'G3', 'M1', 'P', 'D1', 'N2'] },
];

interface SwaraKeyboardProps {
  value: string[];
  onChange: (swaras: string[]) => void;
}

/** Sixteen swara keys grouped by family. Sa is always part of the scale. */
export function SwaraKeyboard({ value, onChange }: SwaraKeyboardProps) {
  const player = useScalePlayer();
  const [strikes, setStrikes] = useState<Record<string, number>>({});
  const selected = sortSwaras(value.includes('S') ? value : ['S', ...value]);
  const sequence = [...selected, "S'"];
  const playingSelection = player.playingId === 'selection';
  const sounding = playingSelection && player.noteIndex >= 0 ? sequence[player.noteIndex]?.replace("'", '') : null;

  const press = (symbol: string) => {
    playSwara(symbol);
    setStrikes((s) => ({ ...s, [symbol]: (s[symbol] ?? 0) + 1 }));
    if (symbol === 'S') return;
    onChange(selected.includes(symbol) ? selected.filter((s) => s !== symbol) : sortSwaras([...selected, symbol]));
  };

  const applyPreset = (swaras: string[]) => {
    onChange(swaras);
    void player.play('selection', [...swaras, "S'"], { noteDuration: 0.3 });
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-3xl bg-canvas/70 p-3 pl-4">
        <ol className="flex min-h-9 flex-wrap items-center gap-1.5" aria-label="Selected swaras">
          {selected.map((s) => (
            <li
              key={s}
              className={cn(
                'rounded-lg px-2.5 py-1 font-mono text-sm transition-all duration-200',
                sounding === s ? 'is-sounding -translate-y-0.5 bg-coral text-surface' : 'bg-surface text-ink',
              )}
            >
              {s}
            </li>
          ))}
        </ol>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => player.toggle('selection', sequence)}
            className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-ink transition-colors hover:bg-surface"
          >
            {playingSelection ? <Pause className="h-4 w-4 text-coral" /> : <Play className="h-4 w-4 text-coral" />}
            {playingSelection ? 'Stop' : 'Play scale'}
          </button>
          <button
            type="button"
            onClick={() => onChange(['S'])}
            className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-muted transition-colors hover:bg-surface hover:text-ink"
          >
            <RotateCcw className="h-4 w-4" />
            Clear
          </button>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-7">
        {SWARA_GROUPS.map((group) => (
          <fieldset key={group.family} className="rounded-2xl border border-ink/[0.06] bg-canvas/40 p-2">
            <legend className="sr-only">{group.family}</legend>
            <p className="px-1 pb-2 pt-1 text-[0.625rem] font-medium uppercase tracking-eyebrow text-faint" aria-hidden>
              {group.family}
            </p>
            <div className="flex flex-col gap-1.5">
              {group.variants.map((v) => {
                const on = selected.includes(v.symbol);
                const locked = v.symbol === 'S';
                return (
                  <button
                    key={v.symbol}
                    type="button"
                    onClick={() => press(v.symbol)}
                    aria-pressed={on}
                    aria-label={`${v.symbol}, ${v.name} ${group.family}${locked ? ', always included' : ''}`}
                    className={cn(
                      'relative flex select-none items-center justify-between overflow-hidden rounded-xl px-3 py-2.5 text-left transition-all duration-200 active:scale-[0.97]',
                      on ? 'bg-espresso text-surface shadow-card' : 'bg-surface text-ink hover:bg-sand/60',
                      sounding === v.symbol && 'is-sounding ring-2 ring-coral',
                    )}
                  >
                    {strikes[v.symbol] ? (
                      <span key={strikes[v.symbol]} className="pointer-events-none absolute inset-0 m-auto h-16 w-16 rounded-full bg-coral/30 animate-strike" aria-hidden />
                    ) : null}
                    <span className="relative">
                      <span className="block font-mono text-base font-medium">{v.symbol}</span>
                      <span className={cn('block text-[0.6875rem]', on ? 'text-surface/60' : 'text-muted')}>{v.name}</span>
                    </span>
                    <span className={cn('relative h-1.5 w-1.5 rounded-full transition-colors', on ? 'bg-coral' : 'bg-ink/10')} aria-hidden />
                  </button>
                );
              })}
            </div>
          </fieldset>
        ))}
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-2">
        <span className="mr-1 text-sm text-muted">Try a scale:</span>
        {PRESETS.map((p) => (
          <button key={p.name} type="button" onClick={() => applyPreset(p.swaras)} className="chip">
            {p.name}
          </button>
        ))}
      </div>
    </div>
  );
}
