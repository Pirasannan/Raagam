'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Disc3, ExternalLink, Play, Search, SkipBack, SkipForward, Square } from 'lucide-react';
import type { RadioSong } from '@/types/radio';
import type { ChannelSummary } from '@/lib/radio';
import { Equalizer } from '@/components/ui/Equalizer';
import { cn } from '@/lib/cn';

const PAGE = 60;

type Stream = { status: 'idle' } | { status: 'loading' } | { status: 'ready'; videoId: string; substitute: boolean } | { status: 'missing' };

interface RagaRadioProps {
  channels: ChannelSummary[];
  initialChannelId: string;
  initialSongs: RadioSong[];
}

export function RagaRadio({ channels: allChannels, initialChannelId, initialSongs }: RagaRadioProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [channelId, setChannelId] = useState(initialChannelId);
  const [songsById, setSongsById] = useState<Record<string, RadioSong[]>>({ [initialChannelId]: initialSongs });
  const [channelQuery, setChannelQuery] = useState('');
  const [songQuery, setSongQuery] = useState('');
  const [limit, setLimit] = useState(PAGE);
  const [song, setSong] = useState<RadioSong | null>(null);
  const [stream, setStream] = useState<Stream>({ status: 'idle' });
  const request = useRef(0);

  const channel = allChannels.find((c) => c.id === channelId) ?? allChannels[0];
  const channelSongs = songsById[channel.id];
  const loadingSongs = channelSongs === undefined;
  const visibleChannels = useMemo(() => {
    const q = channelQuery.trim().toLowerCase();
    return q ? allChannels.filter((c) => c.name.toLowerCase().includes(q)) : allChannels;
  }, [allChannels, channelQuery]);
  const songs = useMemo(() => {
    const q = songQuery.trim().toLowerCase();
    const list = channelSongs ?? [];
    if (!q) return list;
    return list.filter((s) => [s.title, s.movie, s.musicDirector, s.singers, s.year].some((f) => f?.toLowerCase().includes(q)));
  }, [channelSongs, songQuery]);

  useEffect(() => {
    setLimit(PAGE);
  }, [channelId, songQuery]);

  useEffect(() => {
    if (songsById[channelId]) return;
    let cancelled = false;
    fetch(`/api/radio/channel?id=${encodeURIComponent(channelId)}`)
      .then((res) => (res.ok ? res.json() : { songs: [] }))
      .then((data: { songs: RadioSong[] }) => {
        if (!cancelled) setSongsById((prev) => ({ ...prev, [channelId]: data.songs }));
      })
      .catch(() => {
        if (!cancelled) setSongsById((prev) => ({ ...prev, [channelId]: [] }));
      });
    return () => {
      cancelled = true;
    };
  }, [channelId, songsById]);

  const selectChannel = (id: string) => {
    setChannelId(id);
    setSongQuery('');
    router.replace(`${pathname}?raga=${id}`, { scroll: false });
  };

  const play = async (next: RadioSong) => {
    const token = ++request.current;
    setSong(next);
    if (next.videoId) {
      setStream({ status: 'ready', videoId: next.videoId, substitute: false });
      return;
    }
    setStream({ status: 'loading' });
    try {
      const params = new URLSearchParams({ title: next.title, movie: next.movie, channel: channel.id });
      const res = await fetch(`/api/radio/stream?${params}`);
      const data = (await res.json()) as { videoId: string | null; fallback: boolean };
      if (token !== request.current) return;
      setStream(data.videoId ? { status: 'ready', videoId: data.videoId, substitute: data.fallback } : { status: 'missing' });
    } catch {
      if (token === request.current) setStream({ status: 'missing' });
    }
  };

  const step = (direction: 1 | -1) => {
    const list = channelSongs ?? [];
    if (list.length === 0) return;
    const index = song ? list.findIndex((s) => s.id === song.id) : -1;
    void play(list[(index + direction + list.length) % list.length]);
  };

  const stepChannel = (direction: 1 | -1) => {
    const index = allChannels.findIndex((c) => c.id === channel.id);
    selectChannel(allChannels[(index + direction + allChannels.length) % allChannels.length].id);
  };

  const stop = () => {
    request.current += 1;
    setStream({ status: 'idle' });
  };

  const onAir = stream.status === 'ready' || stream.status === 'loading';
  const youtubeLink = song && (stream.status === 'ready' && !stream.substitute ? `https://www.youtube.com/watch?v=${stream.videoId}` : song.youtubeUrl);

  return (
    <div className="grid gap-6 lg:grid-cols-[18rem_minmax(0,1fr)]">
      {/* Channels */}
      <aside className="lg:sticky lg:top-24 lg:h-[calc(100vh-8rem)]">
        <div className="lg:hidden">
          <label htmlFor="channel" className="field-label">
            Channel
          </label>
          <select id="channel" value={channel.id} onChange={(e) => selectChannel(e.target.value)} className="field">
            {allChannels.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.songCount} songs)
              </option>
            ))}
          </select>
        </div>
        <div className="card hidden h-full flex-col overflow-hidden rounded-3xl lg:flex">
          <div className="border-b border-ink/[0.06] p-3">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-faint" />
              <input value={channelQuery} onChange={(e) => setChannelQuery(e.target.value)} placeholder="Find a raga" className="field py-2 pl-9 text-sm" aria-label="Find a channel" />
            </div>
          </div>
          <ul className="flex-1 overflow-y-auto p-2" aria-label="Raga channels">
            {visibleChannels.map((c) => {
              const active = c.id === channel.id;
              return (
                <li key={c.id}>
                  <button
                    type="button"
                    onClick={() => selectChannel(c.id)}
                    aria-current={active}
                    className={cn('flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm transition-colors', active ? 'bg-espresso text-surface' : 'text-ink hover:bg-canvas')}
                  >
                    <span className="flex items-center gap-2">
                      {active && onAir && <Equalizer className="text-coral" height={12} bars={3} />}
                      {c.name}
                    </span>
                    <span className={cn('tabular-nums text-xs', active ? 'text-surface/60' : 'text-faint')}>{c.songCount}</span>
                  </button>
                </li>
              );
            })}
            {visibleChannels.length === 0 && <li className="p-4 text-center text-sm text-muted">No channel found.</li>}
          </ul>
        </div>
      </aside>

      <div className="min-w-0 space-y-6">
        {/* Now playing */}
        <section className="overflow-hidden rounded-4xl bg-espresso text-surface" aria-label="Now playing">
          <div className="grid gap-0 md:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
            <div className="relative aspect-video bg-deep">
              {stream.status === 'ready' ? (
                <iframe
                  key={stream.videoId}
                  src={`https://www.youtube-nocookie.com/embed/${stream.videoId}?autoplay=1&playsinline=1&rel=0`}
                  title={`Playing ${song?.title ?? channel.name}`}
                  allow="autoplay; encrypted-media; picture-in-picture"
                  allowFullScreen
                  className="absolute inset-0 h-full w-full"
                />
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
                  <Disc3 className={cn('h-20 w-20 text-surface/30', stream.status === 'loading' && 'animate-spin text-coral')} style={{ animationDuration: '2.4s' }} strokeWidth={1} />
                  <p className="px-6 text-center text-sm text-surface/55">
                    {stream.status === 'loading' ? 'Finding the song…' : stream.status === 'missing' ? 'This song is not available to stream here.' : `Press play to start ${channel.name}.`}
                  </p>
                </div>
              )}
            </div>
            <div className="flex flex-col justify-between gap-6 p-6 sm:p-8">
              <div>
                <p className="flex items-center gap-2 text-[0.6875rem] uppercase tracking-eyebrow text-surface/55">
                  {onAir ? <Equalizer className="text-coral" height={12} bars={4} /> : <span className="h-1.5 w-1.5 rounded-full bg-surface/40" />}
                  {onAir ? 'On air' : 'Raga radio'} · {channel.name}
                </p>
                <h2 className="mt-3 text-3xl tracking-display">{song?.title ?? channel.name}</h2>
                <p className="mt-2 text-sm text-surface/60">
                  {song ? [song.movie, song.musicDirector, song.year].filter(Boolean).join(' · ') : `${channel.songCount} songs composed in ${channel.name}.`}
                </p>
                {stream.status === 'ready' && stream.substitute && (
                  <p className="mt-3 rounded-2xl bg-surface/10 px-3 py-2 text-sm text-surface/75">
                    We couldn&apos;t find this exact recording, so a featured {channel.name} song is playing instead.
                  </p>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button type="button" onClick={() => step(-1)} className="rounded-xl bg-surface/10 p-3 hover:bg-surface/15" aria-label="Previous song">
                  <SkipBack className="h-4 w-4" />
                </button>
                {onAir ? (
                  <button type="button" onClick={stop} className="flex items-center gap-2 rounded-xl bg-surface px-5 py-3 text-sm text-ink">
                    <Square className="h-4 w-4" /> Stop
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      const first = song ?? channelSongs?.[0];
                      if (first) void play(first);
                    }}
                    disabled={!song && !channelSongs?.length}
                    className="flex items-center gap-2 rounded-xl bg-coral px-5 py-3 text-sm text-surface hover:bg-coral-dark"
                  >
                    <Play className="h-4 w-4" /> Play
                  </button>
                )}
                <button type="button" onClick={() => step(1)} className="rounded-xl bg-surface/10 p-3 hover:bg-surface/15" aria-label="Next song">
                  <SkipForward className="h-4 w-4" />
                </button>
                <span className="mx-1 h-6 w-px bg-surface/15" aria-hidden />
                <button type="button" onClick={() => stepChannel(-1)} className="rounded-xl px-3 py-3 text-sm text-surface/70 hover:bg-surface/10">
                  ← Raga
                </button>
                <button type="button" onClick={() => stepChannel(1)} className="rounded-xl px-3 py-3 text-sm text-surface/70 hover:bg-surface/10">
                  Raga →
                </button>
                {youtubeLink && (
                  <a href={youtubeLink} target="_blank" rel="noopener noreferrer" className="ml-auto flex items-center gap-1.5 text-sm text-surface/60 hover:text-surface">
                    YouTube <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Songs */}
        <section aria-labelledby="songs-heading">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <h2 id="songs-heading" className="text-3xl tracking-display">
              Songs in {channel.name}
            </h2>
            <div className="relative sm:w-72">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-faint" />
              <input value={songQuery} onChange={(e) => setSongQuery(e.target.value)} placeholder="Song, film, composer, year" className="field pl-10" aria-label="Search songs" />
            </div>
          </div>
          <ul className="mt-5 divide-y divide-ink/[0.07] rounded-3xl border border-ink/[0.06] bg-surface">
            {songs.slice(0, limit).map((s, i) => {
              const current = song?.id === s.id && onAir;
              return (
                <li key={s.id}>
                  <button
                    type="button"
                    onClick={() => void play(s)}
                    className={cn('grid w-full grid-cols-[2.5rem_minmax(0,1fr)_auto] items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-canvas/60 sm:px-5', current && 'bg-canvas/80')}
                  >
                    <span className={cn('flex h-9 w-9 items-center justify-center rounded-full', current ? 'bg-coral text-surface' : 'bg-canvas text-muted')}>
                      {current ? <Equalizer bars={3} height={12} /> : <span className="font-mono text-xs">{i + 1}</span>}
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-ink">{s.title}</span>
                      <span className="block truncate text-sm text-muted">{[s.movie, s.singers].filter(Boolean).join(' · ')}</span>
                    </span>
                    <span className="hidden text-right text-sm text-muted sm:block">
                      {s.musicDirector}
                      <span className="block text-xs text-faint">{s.year}</span>
                    </span>
                  </button>
                </li>
              );
            })}
            {loadingSongs && <li className="p-10 text-center text-muted">Loading songs…</li>}
            {!loadingSongs && songs.length === 0 && (
              <li className="p-10 text-center text-muted">{songQuery ? `No song matches “${songQuery}”.` : 'No songs in this channel yet.'}</li>
            )}
          </ul>
          {songs.length > limit && (
            <button type="button" onClick={() => setLimit((l) => l + PAGE)} className="chip mx-auto mt-5 flex">
              Show more ({songs.length - limit} left)
            </button>
          )}
        </section>
      </div>
    </div>
  );
}
