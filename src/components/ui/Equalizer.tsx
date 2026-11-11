import { cn } from '@/lib/cn';

interface EqualizerProps {
  active?: boolean;
  bars?: number;
  /** Height in pixels. */
  height?: number;
  /** Bar width in pixels. */
  barWidth?: number;
  gap?: number;
  className?: string;
}

/** Animated equaliser bars shown while something is sounding. */
export function Equalizer({ active = true, bars = 4, height = 14, barWidth = 3, gap = 2, className }: EqualizerProps) {
  return (
    <span className={cn('inline-flex shrink-0 items-end', className)} style={{ height, gap }} aria-hidden>
      {Array.from({ length: bars }, (_, i) => (
        <span
          key={i}
          className={cn('h-full rounded-full bg-current', active ? 'animate-eq' : 'opacity-50')}
          style={{
            width: barWidth,
            ...(active ? { animationDelay: `${(i * 0.17) % 0.6}s`, animationDuration: `${0.9 + (i % 3) * 0.2}s` } : { transform: 'scaleY(0.25)' }),
          }}
        />
      ))}
    </span>
  );
}
