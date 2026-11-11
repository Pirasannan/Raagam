import OpenAI from 'openai';
import type { AdminRule, IdentifyRequest, IdentifyResponse, RagaProfile, SongRagaEntry, Tradition } from '@/types/raga';

type Provider = 'gemini' | 'openai';

interface AIConfig {
  provider: Provider;
  model: string;
  apiKey: string;
}

function usable(key: string | undefined): key is string {
  return Boolean(key && key.trim().length > 10 && !key.includes('your_'));
}

/** AI provider configured on the server, or null. Gemini wins if both are set. */
export function aiConfig(): AIConfig | null {
  const gemini = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  if (usable(gemini)) {
    return { provider: 'gemini', model: process.env.GEMINI_MODEL || 'gemini-2.0-flash', apiKey: gemini.trim() };
  }
  const openai = process.env.OPENAI_API_KEY;
  if (usable(openai)) {
    return { provider: 'openai', model: process.env.OPENAI_MODEL || 'gpt-4o-mini', apiKey: openai.trim() };
  }
  return null;
}

function rulesBlock(rules: AdminRule[]): string {
  if (rules.length === 0) return '';
  const lines = rules.map(
    (r, i) =>
      `${i + 1}. ${r.title}\n   Pattern (${r.patternType}): ${r.swaraPattern?.join(' ') || r.triggerKeywords?.join(', ') || '—'}\n   Correct raga: ${r.correctRaga} (${r.tradition})\n   Instruction: ${r.ruleInstruction}\n   Severity: ${r.severity}`,
  );
  return `\nVerified corrections from the site's musicologist. Follow them whenever they apply:\n${lines.join('\n')}\n`;
}

function systemPrompt(rules: AdminRule[]): string {
  return `You are an expert in Carnatic and Hindustani classical music and Indian film music.
Identify the raga for the user's query. Be accurate; if unsure, say so in the explanation rather than inventing details.
Use Carnatic notation S R1 R2 R3 G1 G2 G3 M1 M2 P D1 D2 D3 N1 N2 N3, with ' for the upper octave.
For a ragamalika, give the main raga and mention the others in the explanation.
${rulesBlock(rules)}
Reply with JSON only, matching this shape:
{
  "name": string, "alternateNames": string[], "tradition": "Carnatic" | "Hindustani" | "Both",
  "melakartaNumber": number | null, "thaat": string | null, "parentRaga": string | null,
  "arohana": string, "avarohana": string, "swarasCarnatic": string[], "swarasHindustani": string[],
  "vadi": string | null, "samvadi": string | null, "pakadOrSignature": string | null,
  "rasaOrMood": string, "timeOfDay": string,
  "filmOrAlbum": string | null, "composer": string | null, "singers": string | null, "language": string | null,
  "famousSongs": [{ "title": string, "composerOrFilm": string, "type": string }],
  "closelyRelatedRagas": string[], "explanation": string
}`;
}

function userPrompt(request: IdentifyRequest): string {
  const tradition = `Preferred tradition: ${request.traditionPreference || 'Both'}`;
  if (request.mode === 'song') return `Which raga is this song or composition in?\n"${request.songQuery}"\n${tradition}`;
  if (request.mode === 'swaras') return `Which raga uses exactly these swaras?\n${request.swaras?.join(' ')}\n${tradition}`;
  return `Identify the raga from this description or set of notes:\n"${request.description}"\n${tradition}`;
}

async function callGemini({ apiKey, model }: AIConfig, system: string, user: string): Promise<string> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
    body: JSON.stringify({
      contents: [{ role: 'user', parts: [{ text: user }] }],
      systemInstruction: { parts: [{ text: system }] },
      generationConfig: { temperature: 0.1, responseMimeType: 'application/json' },
    }),
    signal: AbortSignal.timeout(25_000),
  });
  if (!res.ok) throw new Error(`Gemini request failed (${res.status})`);
  const data = await res.json();
  const text: string | undefined = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error('Gemini returned an empty response');
  return text;
}

async function callOpenAI({ apiKey, model }: AIConfig, system: string, user: string): Promise<string> {
  const client = new OpenAI({ apiKey, timeout: 25_000 });
  const completion = await client.chat.completions.create({
    model,
    temperature: 0.1,
    response_format: { type: 'json_object' },
    messages: [
      { role: 'system', content: system },
      { role: 'user', content: user },
    ],
  });
  const text = completion.choices[0]?.message?.content;
  if (!text) throw new Error('OpenAI returned an empty response');
  return text;
}

const str = (v: unknown): string => (typeof v === 'string' ? v.trim() : '');
const strOrUndef = (v: unknown): string | undefined => str(v) || undefined;
const strList = (v: unknown): string[] => (Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string') : []);

/** Asks the configured AI provider. Throws if none is configured or the call fails. */
export async function identifyWithAI(request: IdentifyRequest, rules: AdminRule[], appliedRule?: AdminRule): Promise<IdentifyResponse> {
  const config = aiConfig();
  if (!config) throw new Error('No AI provider is configured');

  const system = systemPrompt(rules);
  const user = userPrompt(request);
  const text = config.provider === 'gemini' ? await callGemini(config, system, user) : await callOpenAI(config, system, user);
  const parsed = JSON.parse(text) as Record<string, unknown>;

  const name = str(parsed.name);
  if (!name) throw new Error('AI response did not name a raga');
  const tradition = ['Carnatic', 'Hindustani', 'Both'].includes(str(parsed.tradition)) ? (str(parsed.tradition) as Tradition) : 'Both';
  const melakarta = Number(parsed.melakartaNumber);

  const raga: RagaProfile = {
    name,
    alternateNames: strList(parsed.alternateNames),
    tradition,
    melakartaNumber: Number.isInteger(melakarta) && melakarta >= 1 && melakarta <= 72 ? melakarta : undefined,
    thaat: strOrUndef(parsed.thaat),
    parentRaga: strOrUndef(parsed.parentRaga),
    arohana: str(parsed.arohana),
    avarohana: str(parsed.avarohana),
    swarasCarnatic: strList(parsed.swarasCarnatic),
    swarasHindustani: strList(parsed.swarasHindustani),
    vadi: strOrUndef(parsed.vadi),
    samvadi: strOrUndef(parsed.samvadi),
    pakadOrSignature: strOrUndef(parsed.pakadOrSignature),
    rasaOrMood: str(parsed.rasaOrMood),
    timeOfDay: str(parsed.timeOfDay),
    famousSongs: Array.isArray(parsed.famousSongs)
      ? (parsed.famousSongs as Array<Record<string, unknown>>)
          .filter((s) => str(s?.title))
          .map((s) => ({ title: str(s.title), composerOrFilm: strOrUndef(s.composerOrFilm), type: str(s.type) || 'Song' }))
      : [],
    closelyRelatedRagas: strList(parsed.closelyRelatedRagas),
    explanation: str(parsed.explanation),
  };

  let matchedSong: SongRagaEntry | undefined;
  if (request.mode === 'song' && request.songQuery) {
    matchedSong = {
      title: request.songQuery,
      filmOrAlbum: strOrUndef(parsed.filmOrAlbum),
      composer: strOrUndef(parsed.composer),
      singers: strOrUndef(parsed.singers),
      language: str(parsed.language),
      raga: name,
      source: 'AI',
    };
  }

  return {
    success: true,
    source: 'ai',
    confidence: appliedRule ? 'Exact Match' : 'Moderate',
    raga,
    matchedSong,
    appliedAdminRule: appliedRule && { id: appliedRule.id, title: appliedRule.title, reason: appliedRule.ruleInstruction },
    rawQuery: request,
    aiProvider: config.provider,
  };
}
