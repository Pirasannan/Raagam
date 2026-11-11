import Link from 'next/link';
import { NAV, SITE } from '@/lib/site';
import { Logo } from './Logo';
import { Marquee } from './Marquee';

const LEARN = [
  { href: '/melakarta', label: '72 melakartas' },
  { href: '/ragas', label: '908 janya ragas' },
  { href: '/practice', label: 'Tanpura drone' },
  { href: '/practice?tool=pairs', label: 'Look-alike ragas' },
];

export function Footer() {
  return (
    <footer className="mt-auto">
      <Marquee />
      <div className="bg-canvas">
        <div className="container-page grid gap-12 pb-10 pt-16 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div className="max-w-xs">
            <Logo />
            <p className="mt-5 text-lg leading-snug tracking-[-0.02em] text-ink">
              A quiet place to hear, name and learn Indian classical ragas.
            </p>
            <p className="mt-3 text-sm text-muted">Free to use. No account, no sign-in.</p>
          </div>

          <FooterColumn title="Explore" links={NAV.slice(0, 5)} />
          <FooterColumn title="Learn" links={LEARN} />
          <FooterColumn
            title="About"
            links={[
              { href: '/downloads', label: 'Open datasets' },
              { href: '/privacy', label: 'Privacy policy' },
              { href: `${SITE.repo}/issues`, label: 'Report an issue' },
            ]}
          />
        </div>

        <div className="overflow-hidden px-2 pb-[4vw]" aria-hidden>
          <p className="select-none text-center text-[23vw] font-medium leading-[0.78] tracking-[-0.07em] text-espresso">
            raagam
          </p>
        </div>

        <div className="container-page flex flex-col gap-3 border-t border-ink/10 py-6 text-sm text-muted sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Raagam. Made for musicians, students and listeners.</p>
          <p>Scales are played with just-intonation ratios in your browser.</p>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({ title, links }: { title: string; links: Array<{ href: string; label: string }> }) {
  return (
    <div>
      <h2 className="text-[0.6875rem] font-medium uppercase tracking-eyebrow text-faint">{title}</h2>
      <ul className="mt-4 space-y-2.5">
        {links.map((link) => (
          <li key={link.href}>
            {link.href.startsWith('http') ? (
              <a href={link.href} className="link-underline text-[0.9375rem] text-muted hover:text-ink">
                {link.label}
              </a>
            ) : (
              <Link href={link.href} className="link-underline text-[0.9375rem] text-muted hover:text-ink">
                {link.label}
              </Link>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
