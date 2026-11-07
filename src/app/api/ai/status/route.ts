import { NextResponse } from 'next/server';
import { getAIAvailability } from '@/lib/aiEngine';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const availability = getAIAvailability();
    return NextResponse.json({
      serverHasKey: availability.available && availability.source === 'server',
      provider: availability.provider,
      model: availability.model,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
