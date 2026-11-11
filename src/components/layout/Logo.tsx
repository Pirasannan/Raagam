import Link from 'next/link';
import { cn } from '@/lib/cn';

/** Raagam mark: a resonating gourd (outer ring) with a bindu, and a coral note. */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={cn('h-8 w-8', className)} aria-hidden>
      <circle cx="15" cy="17" r="12" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="15" cy="17" r="5" fill="currentColor" />
      <circle cx="26" cy="6" r="3.6" fill="#e0583e" />
    </svg>
  );
}

export function Logo({ tone = 'dark', className }: { tone?: 'dark' | 'light'; className?: string }) {
  return (
    <Link
      href="/"
      aria-label="Raagam home"
      className={cn('flex items-center gap-2.5', tone === 'dark' ? 'text-ink' : 'text-surface', className)}
    >
      <LogoMark />
      <span className="text-[0.95rem] font-semibold uppercase tracking-[0.18em]">Raagam</span>
    </Link>
  );
}
