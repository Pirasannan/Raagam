import janyaData from '@/data/carnatic_janya_ragas.json';
import type { JanyaRaga } from '@/types/raga';
import { MELAKARTAS, swaraSetOf } from './melakarta';
import { parseScale, swaraRatio, type SwaraSymbol } from './swaras';

/**
 * True when a scale zig-zags instead of moving steadily up (arohana) or down
 * (avarohana). Notes written before the first Sa of an arohana are read as
 * the lower octave.
 */
function isMonotonic(scale: string, direction: 1 | -1): boolean {
  const notes = parseScale(scale);
  const firstSa = notes.indexOf('S');
  const ratios = notes.map((n, i) => (swaraRatio(n) ?? 0) / (direction === 1 && firstSa > 0 && i < firstSa ? 2 : 1));
  return ratios.every((r, i) => i === 0 || (r - ratios[i - 1]) * direction > 0);
}

export function isVakra(arohana: string, avarohana: string): boolean {
  return !isMonotonic(arohana, 1) || !isMonotonic(avarohana, -1);
}

/**
 * The 908 janya ragas. The source data's vakra flag is unreliable (it marks
 * almost every raga), so it is recomputed from the scales.
 */
export const JANYA_RAGAS: JanyaRaga[] = (janyaData as JanyaRaga[]).map((j) => ({ ...j, isVakra: isVakra(j.arohana, j.avarohana) }));

export interface RagaMatch {
  name: string;
  kind: 'melakarta' | 'janya';
  melakartaNumber: number;
  melakartaName: string;
  arohana: string;
  avarohana: string;
  swaras: SwaraSymbol[];
  /** Jaccard similarity between the query and this raga's swaras, 0–1. */
  similarity: number;
}

type Candidate = Omit<RagaMatch, 'similarity'>;

let candidates: Candidate[] | null = null;

function allCandidates(): Candidate[] {
  if (candidates) return candidates;
  const melas: Candidate[] = MELAKARTAS.map((m) => ({
    name: m.name,
    kind: 'melakarta',
    melakartaNumber: m.number,
    melakartaName: m.name,
    arohana: m.arohana,
    avarohana: m.avarohana,
    swaras: m.swaras,
  }));
  const janyas: Candidate[] = JANYA_RAGAS.map((j) => ({
    name: j.name,
    kind: 'janya',
    melakartaNumber: j.parentMelakartaNo,
    melakartaName: j.parentMelakartaName,
    arohana: j.arohana,
    avarohana: j.avarohana,
    swaras: swaraSetOf(j.arohana, j.avarohana),
  }));
  candidates = [...melas, ...janyas];
  return candidates;
}

export interface SwaraSearchResult {
  exact: RagaMatch[];
  close: RagaMatch[];
}

/**
 * Finds ragas whose combined arohana/avarohana use exactly the given swaras,
 * plus the nearest alternatives. Sa is always assumed present.
 */
export function findRagasBySwaras(input: string[], closeLimit = 6): SwaraSearchResult {
  const query = new Set(input.map((s) => s.trim().toUpperCase()).filter(Boolean));
  query.add('S');

  const scored = allCandidates().map((candidate) => {
    const set = new Set<string>(candidate.swaras);
    let shared = 0;
    for (const s of query) if (set.has(s)) shared += 1;
    const union = query.size + set.size - shared;
    return { ...candidate, similarity: union === 0 ? 0 : shared / union };
  });

  const exact = scored
    .filter((m) => m.similarity === 1)
    .sort((a, b) => (a.kind === b.kind ? a.melakartaNumber - b.melakartaNumber : a.kind === 'melakarta' ? -1 : 1));

  const close = scored
    .filter((m) => m.similarity < 1 && m.similarity >= 0.6)
    .sort((a, b) => b.similarity - a.similarity || a.melakartaNumber - b.melakartaNumber)
    .slice(0, closeLimit);

  return { exact, close };
}
