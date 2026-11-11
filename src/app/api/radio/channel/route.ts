import { NextRequest, NextResponse } from 'next/server';
import { findChannel } from '@/lib/radio';

/** Songs for one radio channel. Static data, so it can be cached for a day. */
export function GET(req: NextRequest) {
  const channel = findChannel(req.nextUrl.searchParams.get('id'));
  if (!channel) return NextResponse.json({ error: 'Unknown channel' }, { status: 404 });
  return NextResponse.json({ songs: channel.songs }, { headers: { 'Cache-Control': 'public, max-age=86400, s-maxage=86400' } });
}
