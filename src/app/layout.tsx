import type { Metadata, Viewport } from 'next';
import { Inter_Tight, Instrument_Serif } from 'next/font/google';
import './globals.css';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { SITE } from '@/lib/site';

const sans = Inter_Tight({ subsets: ['latin'], variable: '--font-sans', display: 'swap' });
const serif = Instrument_Serif({
  subsets: ['latin'],
  weight: '400',
  style: ['normal', 'italic'],
  variable: '--font-serif',
  display: 'swap',
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#f0eae2',
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: { default: 'Raagam — Find and learn Indian classical ragas', template: '%s · Raagam' },
  description: SITE.description,
  keywords: ['Raagam', 'Carnatic ragas', 'Hindustani ragas', 'raga finder', '72 melakarta', 'janya ragas', 'swaras', 'tanpura'],
  manifest: '/manifest.json',
  icons: { icon: '/icon-192.png', apple: '/icon-192.png' },
  appleWebApp: { capable: true, statusBarStyle: 'default', title: 'Raagam' },
  openGraph: { title: 'Raagam', description: SITE.description, url: SITE.url, siteName: 'Raagam', type: 'website' },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${sans.variable} ${serif.variable}`}>
      <body className="flex min-h-screen flex-col">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-xl focus:bg-espresso focus:px-4 focus:py-2 focus:text-surface"
        >
          Skip to content
        </a>
        <Navbar />
        <main id="main" className="flex-1">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
