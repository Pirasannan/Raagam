import { NextRequest, NextResponse } from 'next/server';
import { isAdminKey } from '@/lib/adminAuth';

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const authorized = isAdminKey(typeof body?.secretKey === 'string' ? body.secretKey : null);
  return NextResponse.json({ authorized }, { status: authorized ? 200 : 401 });
}
