'use client';

import { cn } from '@/lib/cn';

interface Option<T extends string> {
  value: T;
  label: string;
  count?: string | number;
}

interface SegmentedProps<T extends string> {
  options: Option<T>[];
  value: T;
  onChange: (value: T) => void;
  label: string;
  tone?: 'light' | 'dark';
  className?: string;
}

/** Pill-shaped tab switcher. Scrolls horizontally on narrow screens. */
export function Segmented<T extends string>({ options, value, onChange, label, tone = 'light', className }: SegmentedProps<T>) {
  return (
    <div className={cn('no-scrollbar -mx-1 overflow-x-auto px-1', className)}>
      <div
        role="tablist"
        aria-label={label}
        className={cn(
          'inline-flex gap-1 rounded-2xl p-1',
          tone === 'light' ? 'border border-ink/10 bg-surface' : 'border border-surface/15 bg-surface/5',
        )}
      >
        {options.map((option) => {
          const selected = option.value === value;
          return (
            <button
              key={option.value}
              type="button"
              role="tab"
              aria-selected={selected}
              onClick={() => onChange(option.value)}
              className={cn(
                'flex shrink-0 items-center gap-2 whitespace-nowrap rounded-xl px-4 py-2 text-sm font-medium transition-all duration-300',
                selected
                  ? tone === 'light'
                    ? 'bg-espresso text-surface shadow-card'
                    : 'bg-surface text-ink'
                  : tone === 'light'
                    ? 'text-muted hover:text-ink'
                    : 'text-surface/65 hover:text-surface',
              )}
            >
              {option.label}
              {option.count !== undefined && (
                <span
                  className={cn(
                    'rounded-full px-1.5 py-px text-[0.6875rem] tabular-nums',
                    selected ? 'bg-coral text-surface' : tone === 'light' ? 'bg-sand text-muted' : 'bg-surface/10 text-surface/70',
                  )}
                >
                  {option.count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
