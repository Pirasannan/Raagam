import { NextRequest, NextResponse } from 'next/server';
import { addMistakeReport } from '@/lib/storage';
import { MistakeReport } from '@/types/raga';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (!body || !body.aiSuggestedRaga || !body.userCorrection?.correctRaga) {
      return NextResponse.json(
        { success: false, error: 'aiSuggestedRaga and userCorrection.correctRaga are required' },
        { status: 400 }
      );
    }

    const text = (v: unknown, max: number) => (typeof v === 'string' ? v.trim().slice(0, max) : '');
    const newReport: MistakeReport = {
      id: `report-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      timestamp: new Date().toISOString(),
      query: {
        mode: ['swaras', 'song', 'description'].includes(body.query?.mode) ? body.query.mode : undefined,
        swaras: Array.isArray(body.query?.swaras) ? body.query.swaras.filter((x: unknown) => typeof x === 'string').slice(0, 16) : undefined,
        songQuery: text(body.query?.songQuery, 300) || undefined,
        description: text(body.query?.description, 300) || undefined,
      },
      aiSuggestedRaga: text(body.aiSuggestedRaga, 120),
      userCorrection: {
        correctRaga: text(body.userCorrection.correctRaga, 120),
        correctSwaras: text(body.userCorrection.correctSwaras, 200),
        notesOrExplanation: text(body.userCorrection.notesOrExplanation, 1000),
        reporterName: text(body.userCorrection.reporterName, 80) || 'Anonymous',
      },
      status: 'pending',
    };

    const saved = await addMistakeReport(newReport);
    return NextResponse.json({ success: true, report: saved });
  } catch (error) {
    console.error('Error submitting mistake report:', error);
    return NextResponse.json({ success: false, error: 'Failed to submit the correction' }, { status: 500 });
  }
}
