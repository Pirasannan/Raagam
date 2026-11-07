import type { Metadata, Viewport } from 'next';
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  viewportFit: 'cover',
  themeColor: '#faf5eb',
};

export const metadata: Metadata = {
  title: 'Raagam - Discover Carnatic & Hindustani Ragas',
  description:
    'Discover Indian classical ragas by swaras, song titles, or notes. Explore Carnatic and Hindustani music with audio previews. No sign-in required.',
  keywords: [
    'Raagam',
    'Carnatic Ragas',
    'Hindustani Ragas',
    'OpenAI Raga Identification',
    '72 Melakarta',
    'Swaras',
    'Arohana Avarohana',
    'Indian Classical Music',
  ],
  manifest: '/manifest.json',
  icons: {
    icon: '/icon-192.png',
    apple: '/icon-192.png',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Raagam',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen flex flex-col bg-music-pattern text-stone-900 selection:bg-amber-200 selection:text-amber-900 pb-20 lg:pb-0">
        <Navbar />
        <div className="flex-1">{children}</div>
        <Footer />
      </body>
    </html>
  );
}
