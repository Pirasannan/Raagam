import { NextRequest, NextResponse } from 'next/server';
import radioChannelsData from '@/data/raga_radio_90.json';
import type { RagaRadioChannel } from '@/types/radio';

const CHANNELS = radioChannelsData as RagaRadioChannel[];
const VIDEO_ID = /^[a-zA-Z0-9_-]{11}$/;
const cache = new Map<string, string | null>();

/** Songs whose video was resolved ahead of time, keyed by cleaned title. */
const knownVideos = new Map<string, string>();
for (const channel of CHANNELS) {
  for (const song of channel.songs) {
    if (song.videoId) knownVideos.set(clean(song.title), song.videoId);
  }
}

function clean(text: string) {
  return text.toLowerCase().replace(/\([^)]*\)/g, '').replace(/\s+/g, ' ').trim();
}

/** First video result from YouTube's public search endpoint, or null. */
async function searchYouTube(query: string): Promise<string | null> {
  try {
    const res = await fetch('https://www.youtube.com/youtubei/v1/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept-Language': 'en-US,en;q=0.9' },
      body: JSON.stringify({ context: { client: { clientName: 'WEB', clientVersion: '2.20240101.00.00' } }, query }),
      signal: AbortSignal.timeout(6000),
    });
    if (!res.ok) return null;
    const match = (await res.text()).match(/"videoId":\s*"([a-zA-Z0-9_-]{11})"/);
    return match?.[1] ?? null;
  } catch {
    return null;
  }
}

export async function GET(req: NextRequest) {
  const title = (req.nextUrl.searchParams.get('title') ?? '').trim().slice(0, 150);
  const movie = (req.nextUrl.searchParams.get('movie') ?? '').trim().slice(0, 150);
  const channelId = (req.nextUrl.searchParams.get('channel') ?? '').trim().toLowerCase();
  if (!title) return NextResponse.json({ error: 'Missing title' }, { status: 400 });

  const known = knownVideos.get(clean(title));
  if (known) return NextResponse.json({ videoId: known, fallback: false });

  const key = `${clean(title)}|${clean(movie)}`;
  let videoId = cache.get(key);
  if (videoId === undefined) {
    videoId = (await searchYouTube(`${clean(title)} ${clean(movie)} Malayalam song`)) ?? (await searchYouTube(`${clean(title)} song`));
    cache.set(key, videoId);
  }
  if (videoId && VIDEO_ID.test(videoId)) return NextResponse.json({ videoId, fallback: false });

  // Could not find this exact song: offer the channel's featured track, clearly marked.
  const channel = CHANNELS.find((c) => c.id === channelId);
  return NextResponse.json({ videoId: channel?.defaultVideoId ?? null, fallback: true });
}
