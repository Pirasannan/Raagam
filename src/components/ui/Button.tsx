import Link from 'next/link';
import { ArrowUpRight, type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/cn';

type Variant = 'dark' | 'light' | 'coral' | 'ghost';

const SURFACE: Record<Variant, string> = {
  dark: 'bg-espresso text-surface hover:bg-ink',
  light: 'bg-surface text-ink border border-ink/10 hover:border-ink/25',
  coral: 'bg-coral text-surface hover:bg-coral-dark',
  ghost: 'bg-surface/5 text-surface border border-surface/20 hover:bg-surface/10',
};

const TILE: Record<Variant, string> = {
  dark: 'bg-coral text-surface',
  light: 'bg-espresso text-surface',
  coral: 'bg-espresso text-surface',
  ghost: 'bg-surface text-ink',
};

interface CommonProps {
  variant?: Variant;
  icon?: LucideIcon;
  size?: 'md' | 'sm';
  className?: string;
  children: React.ReactNode;
}

function classes(variant: Variant, size: 'md' | 'sm', className?: string) {
  return cn(
    'group inline-flex shrink-0 items-center gap-3 rounded-2xl font-medium transition-all duration-300 disabled:pointer-events-none disabled:opacity-45',
    size === 'md' ? 'py-1.5 pl-5 pr-1.5 text-[0.9375rem]' : 'py-1 pl-4 pr-1 text-sm',
    SURFACE[variant],
    className,
  );
}

function Tile({ variant, size, icon: Icon = ArrowUpRight }: { variant: Variant; size: 'md' | 'sm'; icon?: LucideIcon }) {
  return (
    <span
      className={cn(
        'flex items-center justify-center rounded-xl transition-transform duration-300 group-hover:rotate-[8deg] group-hover:scale-105',
        size === 'md' ? 'h-9 w-9' : 'h-7 w-7',
        TILE[variant],
      )}
      aria-hidden
    >
      <Icon className={size === 'md' ? 'h-4 w-4' : 'h-3.5 w-3.5'} />
    </span>
  );
}

/** Serova-style call to action: a label followed by an icon tile. */
export function ButtonLink({ href, variant = 'dark', icon, size = 'md', className, children, ...rest }: CommonProps & { href: string; target?: string; rel?: string }) {
  const external = /^https?:/.test(href) || href.startsWith('/downloads/');
  const content = (
    <>
      <span>{children}</span>
      <Tile variant={variant} size={size} icon={icon} />
    </>
  );
  if (external) {
    return (
      <a href={href} className={classes(variant, size, className)} {...rest}>
        {content}
      </a>
    );
  }
  return (
    <Link href={href} className={classes(variant, size, className)} {...rest}>
      {content}
    </Link>
  );
}

export function Button({
  variant = 'dark',
  icon,
  size = 'md',
  className,
  children,
  type = 'button',
  ...rest
}: CommonProps & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button type={type} className={classes(variant, size, className)} {...rest}>
      <span>{children}</span>
      <Tile variant={variant} size={size} icon={icon} />
    </button>
  );
}
