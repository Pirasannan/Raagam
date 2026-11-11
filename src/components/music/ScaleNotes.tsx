'use client';

import { Pause, Play } from 'lucide-react';
import { parseScale } from '@/lib/music/swaras';
import { cn } from '@/lib/cn';
import type { useScalePlayer } from '@/hooks/useScalePlayer';
import { Equalizer } from '@/components/ui/Equalizer';

type Player = ReturnType<typeof useScalePlayer>;

interface ScaleNotesProps {
  id: string;
  label?: string;
  scale: string;
  /** Explicit notes to play and show, when the scale string cannot express them (e.g. lower-octave N,). */
  notes?: string[];
  player: Player;
  tone?: 'light' | 'dark';
  size?: 'md' | 'sm';
  className?: string;
}

/**
 * A playable scale. Each note is shown as a chip and lights up in time with
 * the audio as the scale plays.
 */
export function ScaleNotes({ id, label, scale, notes: explicitNotes, player, tone = 'light', size = 'md', className }: ScaleNotesProps) {
  const notes = explicitNotes ?? parseScale(scale);
  const playing = player.playingId === id;
  if (notes.length === 0) return null;

  return (
    <div className={cn('flex items-start gap-3', className)}>
      <button
        type="button"
        onClick={() => player.toggle(id, notes)}
        aria-label={`${playing ? 'Stop' : 'Play'} ${label ?? 'scale'}`}
        className={cn(
          'relative flex shrink-0 items-center justify-center rounded-full transition-colors',
          size === 'md' ? 'h-10 w-10' : 'h-8 w-8',
          playing ? 'bg-coral text-surface' : tone === 'light' ? 'bg-espresso text-surface hover:bg-ink' : 'bg-surface text-ink hover:bg-canvas',
        )}
      >
        {playing && <span className="absolute inset-0 rounded-full bg-coral/40 animate-ripple" aria-hidden />}
        {playing ? <Pause className="relative h-3.5 w-3.5" /> : <Play className="relative ml-0.5 h-3.5 w-3.5" />}
      </button>
      <div className="min-w-0">
        {label && (
          <p className={cn('mb-1.5 flex items-center gap-2 text-[0.6875rem] font-medium uppercase tracking-eyebrow', tone === 'light' ? 'text-muted' : 'text-surface/55')}>
            {label}
            {playing && <Equalizer className="text-coral" height={10} bars={3} />}
          </p>
        )}
        <ol className="flex flex-wrap gap-1" aria-label={label}>
          {notes.map((note, i) => {
            const sounding = playing && player.noteIndex === i;
            return (
              <li
                key={`${note}-${i}`}
                className={cn(
                  'rounded-lg font-mono tabular-nums transition-all duration-200',
                  size === 'md' ? 'px-2 py-1 text-sm' : 'px-1.5 py-0.5 text-xs',
                  sounding
                    ? 'is-sounding -translate-y-0.5 bg-coral text-surface'
                    : tone === 'light'
                      ? 'bg-canvas text-ink'
                      : 'bg-surface/10 text-surface/90',
                )}
              >
                {note}
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}
