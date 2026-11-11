import type { AdminRule, IdentifyMiss, IdentifyRequest, IdentifyResponse, RagaAlternative, RagaProfile } from '@/types/raga';
import { getAdminRules } from '@/lib/storage';
import { findRagasBySwaras, type RagaMatch } from '@/lib/music/catalog';
import { ordinal } from '@/lib/music/melakarta';
import { parseScale, scaleSwaraSet, westernNotesToSwaras } from '@/lib/music/swaras';
import { aiConfig, identifyWithAI } from './ai';
import { findCuratedSong } from './curatedSongs';
import { lookupSongOnMSIDB } from './msidb';
import { findSongInDatabase, resolveRagaProfile } from './songSearch';

export type IdentifyResult = IdentifyResponse | IdentifyMiss;

/**
 * Identifies a raga. Deterministic sources are tried first; AI is used only
 * when they cannot answer and a provider is configured on the server.
 *
 * - swaras:      admin rule → exact scale match → AI → closest scale match
 * - song:        song archive → MSIDB → curated notes → AI
 * - description: parse notes/swaras → scale search; otherwise song archive → AI
 */
export async function identifyRaga(request: IdentifyRequest): Promise<IdentifyResult> {
  const rules = (await getAdminRules()).filter((r) => r.active);

  if (request.mode === 'swaras') return identifyBySwaras(request, request.swaras ?? [], rules);
  if (request.mode === 'song') return identifySong(request, rules);
  return identifyDescription(request, rules);
}

function ruleSummary(rule?: AdminRule) {
  return rule ? { id: rule.id, title: rule.title, reason: rule.ruleInstruction } : undefined;
}

function miss(request: IdentifyRequest, message: string): IdentifyMiss {
  return { success: false, notFound: true, message, rawQuery: request };
}

async function tryAI(request: IdentifyRequest, rules: AdminRule[], rule?: AdminRule): Promise<IdentifyResponse | null> {
  if (!aiConfig()) return null;
  try {
    return await identifyWithAI(request, rules, rule);
  } catch (error) {
    console.error('[identify] AI lookup failed:', error);
    return null;
  }
}

/* ------------------------------------------------------------------ swaras */

function sameSet(a: string[], b: string[]) {
  return a.length === b.length && a.every((x) => b.includes(x));
}

/** Rich library profile when it describes the same scale, otherwise one built from the match. */
function profileFor(match: RagaMatch): RagaProfile {
  const library = resolveRagaProfile(match.name) as RagaProfile | null;
  if (library?.arohana && sameSet(scaleSwaraSet(library.arohana, library.avarohana), match.swaras)) {
    return { ...library, melakartaNumber: library.melakartaNumber ?? match.melakartaNumber };
  }
  const isMela = match.kind === 'melakarta';
  return {
    name: match.name,
    alternateNames: [],
    tradition: 'Carnatic',
    melakartaNumber: match.melakartaNumber,
    parentRaga: isMela ? `Melakarta ${match.melakartaNumber}` : `${match.melakartaName} (melakarta ${match.melakartaNumber})`,
    arohana: match.arohana,
    avarohana: match.avarohana,
    swarasCarnatic: match.swaras,
    swarasHindustani: [],
    rasaOrMood: '',
    timeOfDay: '',
    famousSongs: library?.famousSongs ?? [],
    explanation: isMela
      ? `${match.name} is the ${ordinal(match.melakartaNumber)} melakarta, a complete seven-note parent scale.`
      : `${match.name} is a janya raga derived from ${match.melakartaName}, the ${ordinal(match.melakartaNumber)} melakarta.`,
  };
}


function toAlternative(match: RagaMatch, exact: boolean): RagaAlternative {
  return {
    name: match.name,
    kind: match.kind,
    melakartaNumber: match.melakartaNumber,
    melakartaName: match.melakartaName,
    arohana: match.arohana,
    avarohana: match.avarohana,
    exact,
  };
}

async function identifyBySwaras(request: IdentifyRequest, swaras: string[], rules: AdminRule[]): Promise<IdentifyResult> {
  const input = new Set(swaras.map((s) => s.trim().toUpperCase()));
  input.add('S');

  const rule = rules.find(
    (r) => r.patternType === 'swaras' && r.swaraPattern?.length && sameSet(r.swaraPattern.map((s) => s.trim().toUpperCase()), [...input]),
  );
  if (rule) {
    const profile = resolveRagaProfile(rule.correctRaga) as RagaProfile | null;
    if (profile?.arohana) {
      return { success: true, source: 'admin_rule', confidence: 'Exact Match', raga: profile, appliedAdminRule: ruleSummary(rule), rawQuery: request };
    }
  }

  const { exact, close } = findRagasBySwaras([...input]);

  if (exact.length > 0) {
    const [primary, ...others] = exact;
    return {
      success: true,
      source: 'scale_match',
      confidence: others.length === 0 ? 'Exact Match' : 'High',
      raga: profileFor(primary),
      alternatives: [...others.slice(0, 8).map((m) => toAlternative(m, true)), ...close.slice(0, 3).map((m) => toAlternative(m, false))],
      appliedAdminRule: ruleSummary(rule),
      rawQuery: request,
    };
  }

  const ai = await tryAI({ ...request, swaras: [...input] }, rules, rule);
  if (ai) return ai;

  if (close.length > 0) {
    const [primary, ...others] = close;
    const raga = profileFor(primary);
    raga.explanation = `No raga in the library uses exactly these swaras. ${primary.name} is the closest: ${describeDifference([...input], primary.swaras)} ${raga.explanation}`;
    return {
      success: true,
      source: 'scale_match',
      confidence: primary.similarity >= 0.8 ? 'Moderate' : 'Low',
      raga,
      alternatives: others.map((m) => toAlternative(m, false)),
      rawQuery: request,
    };
  }

  return miss(request, 'No raga in the library is close to these swaras. Check the selection, or try fewer notes.');
}

function describeDifference(input: string[], target: string[]): string {
  const missing = target.filter((s) => !input.includes(s));
  const extra = input.filter((s) => !target.includes(s));
  const parts: string[] = [];
  if (missing.length) parts.push(`it also uses ${missing.join(', ')}`);
  if (extra.length) parts.push(`it does not use ${extra.join(', ')}`);
  return parts.length ? `${parts.join(', and ')}.` : '';
}

/* -------------------------------------------------------------------- song */

async function identifySong(request: IdentifyRequest, rules: AdminRule[]): Promise<IdentifyResult> {
  const query = request.songQuery?.trim() ?? '';
  const lower = query.toLowerCase();
  const rule = rules.find((r) => r.triggerKeywords?.some((k) => k && lower.includes(k.toLowerCase())));

  const archive = findSongInDatabase(query);
  if (archive) {
    return {
      success: true,
      source: 'song_archive',
      confidence: 'Exact Match',
      raga: archive.ragaProfile,
      isMultiRaga: archive.isMultiRaga,
      ragas: archive.allRagaProfiles,
      matchedSong: archive.matchedSong,
      appliedAdminRule: ruleSummary(rule),
      rawQuery: request,
    };
  }

  const msidb = await lookupSongOnMSIDB(query);
  if (msidb) {
    return {
      success: true,
      source: 'song_archive',
      confidence: 'High',
      raga: msidb.ragaProfile,
      matchedSong: msidb.matchedSong,
      appliedAdminRule: ruleSummary(rule),
      rawQuery: request,
    };
  }

  const curated = findCuratedSong(query);
  if (curated) return { ...curated, rawQuery: request, appliedAdminRule: ruleSummary(rule) };

  const ai = await tryAI(request, rules, rule);
  if (ai) return ai;

  return miss(
    request,
    `We couldn't find "${query}" in the song archive. Try another spelling, add the film or composer, or search by swaras instead.`,
  );
}

/* ------------------------------------------------------------- description */

async function identifyDescription(request: IdentifyRequest, rules: AdminRule[]): Promise<IdentifyResult> {
  const text = request.description?.trim() ?? '';

  // Notes written out explicitly are answered from the scale library, not guessed.
  const fromWestern = westernNotesToSwaras(text);
  const fromSwaras = scaleSwaraSet(parseScale(text).join(' '));
  const swaras = fromWestern ?? (fromSwaras.length >= 3 ? fromSwaras : null);
  if (swaras) return identifyBySwaras(request, swaras, rules);

  const archive = findSongInDatabase(text);
  if (archive?.isDirectRaga) {
    return { success: true, source: 'song_archive', confidence: 'High', raga: archive.ragaProfile, rawQuery: request };
  }

  const ai = await tryAI(request, rules);
  if (ai) return ai;

  return miss(
    request,
    'Describing a raga in words needs the AI service, which is not switched on for this site. Write the notes instead, like "C D E F# G A B" or "S R2 G3 P D2".',
  );
}
