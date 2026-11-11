'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ArrowUpRight, Menu, X } from 'lucide-react';
import { NAV } from '@/lib/site';
import { cn } from '@/lib/cn';
import { ButtonLink } from '@/components/ui/Button';
import { Logo } from './Logo';

function isActive(pathname: string, href: string) {
  return href === '/' ? pathname === '/' : pathname === href || pathname.startsWith(`${href}/`);
}

export function Navbar() {
  const pathname = usePathname() ?? '/';
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open]);

  const links = NAV.filter((item) => item.href !== '/');

  return (
    <header className="sticky top-0 z-50 px-3 pt-[max(0.75rem,env(safe-area-inset-top))] sm:px-5">
      <div
        className={cn(
          'mx-auto flex h-14 max-w-page items-center justify-between rounded-2xl border pl-4 pr-2 transition-all duration-500 sm:pl-5',
          scrolled ? 'border-ink/10 bg-surface/85 shadow-card backdrop-blur-xl' : 'border-ink/[0.06] bg-surface/70 backdrop-blur-md',
        )}
      >
        <Logo />

        <nav aria-label="Main" className="hidden items-center gap-0.5 lg:flex">
          {links.map((item) => {
            const active = isActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'relative rounded-xl px-3 py-2 text-sm transition-colors',
                  active ? 'text-ink' : 'text-muted hover:text-ink',
                )}
              >
                {item.label}
                {active && <span className="absolute inset-x-3 -bottom-0.5 h-px bg-coral" aria-hidden />}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <ButtonLink href="/#finder" size="sm" className="hidden sm:inline-flex">
            Find a raga
          </ButtonLink>
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-espresso text-surface lg:hidden"
            aria-label="Open menu"
            aria-expanded={open}
            aria-controls="mobile-menu"
          >
            <Menu className="h-[18px] w-[18px]" />
          </button>
        </div>
      </div>

      {open && (
        <div
          id="mobile-menu"
          role="dialog"
          aria-modal="true"
          aria-label="Menu"
          className="fixed inset-0 z-50 flex flex-col overflow-y-auto bg-espresso px-6 pb-[max(2rem,env(safe-area-inset-bottom))] pt-[max(1rem,env(safe-area-inset-top))] text-surface animate-fade-up lg:hidden"
        >
          <div className="flex h-14 items-center justify-between">
            <Logo tone="light" />
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-surface/10"
              aria-label="Close menu"
            >
              <X className="h-[18px] w-[18px]" />
            </button>
          </div>
          <nav aria-label="Mobile" className="mt-8 flex flex-col">
            {NAV.map((item, i) => {
              const active = isActive(pathname, item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? 'page' : undefined}
                  className="group flex items-center justify-between border-b border-surface/10 py-4 animate-fade-up"
                  style={{ animationDelay: `${60 + i * 40}ms` }}
                >
                  <span>
                    <span className={cn('block text-3xl tracking-display', active ? 'text-coral' : 'text-surface')}>
                      {item.label}
                    </span>
                    <span className="mt-1 block text-sm text-surface/50">{item.description}</span>
                  </span>
                  <ArrowUpRight className="h-5 w-5 text-surface/40 transition-colors group-hover:text-coral" />
                </Link>
              );
            })}
          </nav>
          <p className="mt-auto pt-10 font-serif text-2xl italic text-surface/60">Listen first. Name it later.</p>
        </div>
      )}
    </header>
  );
}
