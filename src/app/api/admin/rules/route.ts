import { NextRequest, NextResponse } from 'next/server';
import { deleteAdminRule, getAdminRules, importRules, saveAdminRule } from '@/lib/storage';
import { isAdminRequest } from '@/lib/adminAuth';
import type { AdminRule, Tradition } from '@/types/raga';

const unauthorized = () => NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
const strings = (v: unknown) => (Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string' && x.trim() !== '').map((x) => x.trim()) : []);

/** Validates and normalises a rule from untrusted JSON. Returns null when required fields are missing. */
function toRule(body: Record<string, unknown>): AdminRule | null {
  const title = typeof body.title === 'string' ? body.title.trim() : '';
  const correctRaga = typeof body.correctRaga === 'string' ? body.correctRaga.trim() : '';
  const ruleInstruction = typeof body.ruleInstruction === 'string' ? body.ruleInstruction.trim() : '';
  if (!title || !correctRaga || !ruleInstruction) return null;
  const patternTypes: AdminRule['patternType'][] = ['swaras', 'song', 'phrase', 'correction'];
  const traditions: Tradition[] = ['Both', 'Carnatic', 'Hindustani'];
  return {
    id: typeof body.id === 'string' && body.id ? body.id : `rule-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    createdAt: typeof body.createdAt === 'string' ? body.createdAt : new Date().toISOString(),
    title,
    patternType: patternTypes.includes(body.patternType as AdminRule['patternType']) ? (body.patternType as AdminRule['patternType']) : 'swaras',
    swaraPattern: strings(body.swaraPattern).map((s) => s.toUpperCase()),
    triggerKeywords: strings(body.triggerKeywords),
    correctRaga,
    tradition: traditions.includes(body.tradition as Tradition) ? (body.tradition as Tradition) : 'Both',
    ruleInstruction,
    severity: body.severity === 'disambiguation_hint' ? 'disambiguation_hint' : 'strict_override',
    active: body.active !== false,
  };
}

export async function GET(req: NextRequest) {
  if (!isAdminRequest(req)) return unauthorized();
  return NextResponse.json({ success: true, rules: await getAdminRules() });
}

export async function POST(req: NextRequest) {
  if (!isAdminRequest(req)) return unauthorized();
  const body = await req.json().catch(() => null);
  if (!body || typeof body !== 'object') return NextResponse.json({ error: 'Body must be JSON' }, { status: 400 });

  if (body.bulk === true) {
    if (!Array.isArray(body.rules)) return NextResponse.json({ error: 'rules must be an array' }, { status: 400 });
    const rules = body.rules.map((r: Record<string, unknown>) => toRule(r ?? {}));
    if (rules.some((r: AdminRule | null) => r === null)) {
      return NextResponse.json({ error: 'Every rule needs a title, correctRaga and ruleInstruction' }, { status: 400 });
    }
    return NextResponse.json({ success: true, imported: await importRules(rules) });
  }

  const rule = toRule(body);
  if (!rule) return NextResponse.json({ error: 'title, correctRaga and ruleInstruction are required' }, { status: 400 });
  return NextResponse.json({ success: true, rule: await saveAdminRule(rule) });
}

export async function DELETE(req: NextRequest) {
  if (!isAdminRequest(req)) return unauthorized();
  const id = req.nextUrl.searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'Rule id is required' }, { status: 400 });
  await deleteAdminRule(id);
  return NextResponse.json({ success: true, deletedId: id });
}
