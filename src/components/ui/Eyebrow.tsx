import { cn } from '@/lib/cn';

interface EyebrowProps {
  children: React.ReactNode;
  tone?: 'light' | 'dark';
  className?: string;
}

/** Small uppercase pill with a pulsing coral dot, used above section headings. */
export function Eyebrow({ children, tone = 'light', className }: EyebrowProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[0.6875rem] font-medium uppercase tracking-eyebrow',
        tone === 'light' ? 'border-ink/10 bg-surface text-ink' : 'border-surface/15 bg-surface/5 text-surface/85',
        className,
      )}
    >
      <span className="relative flex h-2 w-2 items-center justify-center" aria-hidden>
        <span className="absolute h-2 w-2 rounded-full bg-coral/40 animate-ripple" />
        <span className="h-1.5 w-1.5 rounded-full bg-coral" />
      </span>
      {children}
    </span>
  );
}
