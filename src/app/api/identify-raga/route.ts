import { NextRequest, NextResponse } from 'next/server';
import { identifyRaga } from '@/lib/identify';
import type { IdentifyMode, IdentifyRequest, Tradition } from '@/types/raga';

const MODES: IdentifyMode[] = ['swaras', 'song', 'description'];
const TRADITIONS: Tradition[] = ['Both', 'Carnatic', 'Hindustani'];
const MAX_TEXT = 300;

function bad(message: string) {
  return NextResponse.json({ success: false, error: message }, { status: 400 });
}

export async function POST(req: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return bad('Request body must be JSON.');
  }

  const mode = body.mode as IdentifyMode;
  if (!MODES.includes(mode)) return bad('"mode" must be swaras, song or description.');

  const tradition = TRADITIONS.includes(body.traditionPreference as Tradition) ? (body.traditionPreference as Tradition) : 'Both';
  const request: IdentifyRequest = { mode, traditionPreference: tradition };

  if (mode === 'swaras') {
    const swaras = Array.isArray(body.swaras) ? body.swaras.filter((s): s is string => typeof s === 'string' && /^[SRGMPDN][123]?$/.test(s)) : [];
    if (swaras.length < 3) return bad('Select at least three swaras.');
    request.swaras = [...new Set(swaras)];
  } else {
    const text = typeof (mode === 'song' ? body.songQuery : body.description) === 'string' ? String(mode === 'song' ? body.songQuery : body.description).trim() : '';
    if (text.length < 2) return bad(mode === 'song' ? 'Type a song or composition name.' : 'Describe the scale or type its notes.');
    if (text.length > MAX_TEXT) return bad(`Keep it under ${MAX_TEXT} characters.`);
    if (mode === 'song') request.songQuery = text;
    else request.description = text;
  }

  try {
    return NextResponse.json(await identifyRaga(request));
  } catch (error) {
    console.error('[identify-raga]', error);
    return NextResponse.json({ success: false, error: 'Something went wrong while identifying the raga.' }, { status: 500 });
  }
}
