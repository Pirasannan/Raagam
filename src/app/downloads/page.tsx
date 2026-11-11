import fs from 'node:fs';
import path from 'node:path';
import type { Metadata } from 'next';
import { Download, ExternalLink } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Reveal } from '@/components/ui/Reveal';

export const metadata: Metadata = {
  title: 'Open datasets',
  description: 'Download the Raagam datasets: 908 janya ragas, 3,467 songs with their ragas, the 72 melakartas and a swara notation guide.',
};

interface Dataset {
  file: string;
  title: string;
  format: string;
  records: string;
  description: string;
  open?: boolean;
}

const DATASETS: Dataset[] = [
  {
    file: 'carnatic_janya_ragas_908.csv',
    title: 'Janya ragas',
    format: 'CSV',
    records: '908 ragas',
    description: 'Every janya raga with its parent melakarta, chakra, arohana, avarohana, scale type and bhashanga notes. Opens in any spreadsheet.',
  },
  {
    file: 'carnatic_janya_ragas_908.json',
    title: 'Janya ragas',
    format: 'JSON',
    records: '908 ragas',
    description: 'The same janya data as structured JSON, with swara arrays and flags, ready for apps and scripts.',
  },
  {
    file: 'classical_cinema_songs_with_raga.csv',
    title: 'Songs and their ragas',
    format: 'CSV',
    records: '3,467 songs',
    description: 'Malayalam film songs with film, year, raga, music director, lyricist and singers.',
  },
  {
    file: 'classical_cinema_songs_with_raga.json',
    title: 'Songs and their ragas',
    format: 'JSON',
    records: '3,467 songs',
    description: 'The song list as JSON, including song and film identifiers from the source archive.',
  },
  {
    file: 'offline_searchable_songs_ragas_portal.html',
    title: 'Offline song finder',
    format: 'HTML',
    records: 'Single file',
    description: 'A self-contained page that searches the song list without an internet connection. Save it and open it in any browser.',
    open: true,
  },
  {
    file: '72_melakartas_carnatic_guide.json',
    title: 'The 72 melakartas',
    format: 'JSON',
    records: '72 scales',
    description: 'All melakartas grouped into their twelve chakras, with full arohana and avarohana.',
  },
  {
    file: 'swara_frequency_notation_guide.txt',
    title: 'Swara notation guide',
    format: 'TXT',
    records: 'Reference',
    description: 'The 16 Carnatic and 12 Hindustani swara positions with their western equivalents and frequency ratios.',
    open: true,
  },
];

function size(file: string): string {
  try {
    const bytes = fs.statSync(path.join(process.cwd(), 'public', 'downloads', file)).size;
    return bytes >= 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`;
  } catch {
    return '';
  }
}

export default function DownloadsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Open data"
        title="Take the library"
        accent="with you."
        description="The data behind Raagam, free to download for study, teaching or your own projects."
      />
      <div className="container-page pb-24">
        <ul className="grid gap-4 md:grid-cols-2">
          {DATASETS.map((d, i) => {
            const href = `/downloads/${d.file}`;
            const bytes = size(d.file);
            return (
              <Reveal as="li" key={d.file} delay={(i % 2) * 100} className="card flex flex-col p-6 sm:p-7">
                <div className="flex items-center justify-between gap-3">
                  <span className="rounded-full bg-espresso px-3 py-1 font-mono text-xs text-surface">{d.format}</span>
                  <span className="text-sm text-muted">
                    {d.records}
                    {bytes && ` · ${bytes}`}
                  </span>
                </div>
                <h2 className="mt-5 text-2xl tracking-display">{d.title}</h2>
                <p className="mt-2 flex-1 leading-relaxed text-muted">{d.description}</p>
                <p className="mt-4 truncate font-mono text-xs text-faint">{d.file}</p>
                <div className="mt-5 flex flex-wrap items-center gap-4 border-t border-ink/[0.08] pt-5">
                  <a href={href} download className="flex items-center gap-2 rounded-xl bg-espresso px-4 py-2.5 text-sm text-surface transition-colors hover:bg-ink">
                    <Download className="h-4 w-4" /> Download
                  </a>
                  {d.open && (
                    <a href={href} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-sm text-muted hover:text-ink">
                      Open in browser <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  )}
                </div>
              </Reveal>
            );
          })}
        </ul>
        <p className="mx-auto mt-12 max-w-2xl text-center text-sm text-muted">
          Song and raga data was compiled from public archives including the Malayalam Song Info Database. Please credit your sources if you
          publish work based on it.
        </p>
      </div>
    </>
  );
}
