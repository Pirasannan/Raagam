import { cn } from '@/lib/cn';
import { Eyebrow } from './Eyebrow';

interface SectionHeadingProps {
  eyebrow: string;
  title: React.ReactNode;
  /** Second line, shown in a softer tone like the reference design. */
  accent?: React.ReactNode;
  description?: React.ReactNode;
  tone?: 'light' | 'dark';
  align?: 'left' | 'center';
  as?: 'h1' | 'h2';
  className?: string;
}

export function SectionHeading({ eyebrow, title, accent, description, tone = 'light', align = 'left', as: Heading = 'h2', className }: SectionHeadingProps) {
  const centered = align === 'center';
  return (
    <div className={cn(centered && 'mx-auto text-center', 'max-w-3xl', className)}>
      <Eyebrow tone={tone}>{eyebrow}</Eyebrow>
      <Heading
        className={cn(
          'display mt-5',
          Heading === 'h1' ? 'text-[2.6rem] sm:text-6xl lg:text-7xl' : 'text-[2.15rem] sm:text-5xl',
          tone === 'light' ? 'text-ink' : 'text-surface',
        )}
      >
        {title}
        {accent && (
          <>
            <br />
            <span className={tone === 'light' ? 'text-faint' : 'text-surface/45'}>{accent}</span>
          </>
        )}
      </Heading>
      {description && (
        <p
          className={cn(
            'mt-5 text-base leading-relaxed sm:text-lg',
            centered && 'mx-auto max-w-2xl',
            tone === 'light' ? 'text-muted' : 'text-surface/65',
          )}
        >
          {description}
        </p>
      )}
    </div>
  );
}
