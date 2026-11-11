import { NextResponse } from 'next/server';
import { aiConfig } from '@/lib/identify/ai';

export const dynamic = 'force-dynamic';

/** Whether server-side AI is configured. Never exposes keys. */
export function GET() {
  const config = aiConfig();
  return NextResponse.json({ enabled: Boolean(config), provider: config?.provider ?? null });
}
