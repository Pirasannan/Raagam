'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ExternalLink, Search } from 'lucide-react';
import playlists from '@/data/updates_playlists.json';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/cn';

interface Playlist {
  id: string;
  title: string;
  tagline: string;
  category: string;
  description: string;
  thumbnail: string;
  tags: string[];
}

const PLAYLISTS = playlists as Playlist[];
const CATEGORIES = ['All', ...new Set(PLAYLISTS.map((p) => p.category))];

/** Curated Spotify playlists of new Malayalam film music, with a quick raga lookup. */
export function NewSongs() {
  const router = useRouter();
  const [activeId, setActiveId] = useState(PLAYLISTS[0].id);
  const [category, setCategory] = useState('All');
  const [song, setSong] = useState('');
  const active = PLAYLISTS.find((p) => p.id === activeId) ?? PLAYLISTS[0];
  const visible = useMemo(() => PLAYLISTS.filter((p) => category === 'All' || p.category === category), [category]);

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.25fr)]">
      <div className="min-w-0">
        <div className="no-scrollbar -mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1">
          {CATEGORIES.map((c) => (
            <button key={c} type="button" onClick={() => setCategory(c)} aria-pressed={category === c} className={cn('chip shrink-0', category === c && 'border-espresso bg-espresso text-surface hover:text-surface')}>
              {c}
            </button>
          ))}
        </div>
        <ul className="mt-4 space-y-2">
          {visible.map((p) => {
            const selected = p.id === active.id;
            return (
              <li key={p.id}>
                <button
                  type="button"
                  onClick={() => setActiveId(p.id)}
                  aria-pressed={selected}
                  className={cn(
                    'flex w-full items-center gap-4 rounded-3xl border p-3 text-left transition-all',
                    selected ? 'border-espresso bg-espresso text-surface shadow-card' : 'border-ink/[0.06] bg-surface hover:border-ink/15',
                  )}
                >
                  <img src={p.thumbnail} alt="" loading="lazy" className="h-16 w-16 shrink-0 rounded-2xl bg-sand object-cover" />
                  <span className="min-w-0">
                    <span className="block truncate text-lg tracking-[-0.02em]">{p.title}</span>
                    <span className={cn('block truncate text-sm', selected ? 'text-surface/60' : 'text-muted')}>{p.tagline}</span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="min-w-0 space-y-4 lg:sticky lg:top-24 lg:h-fit">
        <div className="card overflow-hidden p-2">
          <iframe
            key={active.id}
            src={`https://open.spotify.com/embed/playlist/${active.id}?theme=0`}
            title={`${active.title} on Spotify`}
            height={480}
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            loading="lazy"
            className="w-full rounded-[1.6rem] border-0"
          />
          <div className="flex flex-wrap items-center justify-between gap-3 px-4 pb-3 pt-4">
            <p className="max-w-md text-sm text-muted">{active.description}</p>
            <a href={`https://open.spotify.com/playlist/${active.id}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-sm text-ink">
              Open in Spotify <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (song.trim()) router.push(`/?song=${encodeURIComponent(song.trim())}#finder`);
          }}
          className="rounded-4xl bg-espresso p-6 text-surface"
        >
          <label htmlFor="new-song" className="text-xl tracking-[-0.02em]">
            Heard something you like?
          </label>
          <p className="mt-1 text-sm text-surface/60">Type the song title to look up its raga.</p>
          <div className="mt-4 flex flex-col gap-2 sm:flex-row">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-faint" />
              <input id="new-song" value={song} onChange={(e) => setSong(e.target.value)} className="field pl-10" placeholder="Song title" maxLength={300} />
            </div>
            <Button type="submit" variant="coral" disabled={!song.trim()}>
              Find raga
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
