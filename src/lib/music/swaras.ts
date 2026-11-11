/**
 * Swara notation and just-intonation ratios.
 *
 * Carnatic notation uses the 16-swara names (R1, G3, …). A trailing `'` raises
 * a note by an octave (tara sthayi) and a trailing `,` lowers it (mandra).
 */

export type SwaraSymbol =
  | 'S'
  | 'R1' | 'R2' | 'R3'
  | 'G1' | 'G2' | 'G3'
  | 'M1' | 'M2'
  | 'P'
  | 'D1' | 'D2' | 'D3'
  | 'N1' | 'N2' | 'N3';

/** Frequency ratio of each swara relative to Sa (5-limit just intonation). */
const RATIOS: Record<string, number> = {
  S: 1,
  R1: 16 / 15,
  R2: 9 / 8,
  R3: 6 / 5,
  G1: 9 / 8,
  G2: 6 / 5,
  G3: 5 / 4,
  M1: 4 / 3,
  M2: 45 / 32,
  P: 3 / 2,
  D1: 8 / 5,
  D2: 5 / 3,
  D3: 9 / 5,
  N1: 5 / 3,
  N2: 9 / 5,
  N3: 15 / 8,
  // Unnumbered shorthand defaults to the most common variant.
  R: 9 / 8,
  G: 5 / 4,
  M: 4 / 3,
  D: 5 / 3,
  N: 15 / 8,
};

/** Hindustani sargam (lowercase = komal, `Ma` = teevra). */
const HINDUSTANI: Record<string, string> = {
  Sa: 'S',
  re: 'R1',
  Re: 'R2',
  ga: 'G2',
  Ga: 'G3',
  ma: 'M1',
  Ma: 'M2',
  Pa: 'P',
  dha: 'D1',
  Dha: 'D2',
  ni: 'N2',
  Ni: 'N3',
};

export interface SwaraVariant {
  symbol: SwaraSymbol;
  name: string;
}

export interface SwaraGroup {
  family: string;
  variants: SwaraVariant[];
}

/** The 16 Carnatic swaras grouped by their seven families. */
export const SWARA_GROUPS: SwaraGroup[] = [
  { family: 'Shadjam', variants: [{ symbol: 'S', name: 'Shadjam' }] },
  {
    family: 'Rishabham',
    variants: [
      { symbol: 'R1', name: 'Shuddha' },
      { symbol: 'R2', name: 'Chatushruti' },
      { symbol: 'R3', name: 'Shatshruti' },
    ],
  },
  {
    family: 'Gandharam',
    variants: [
      { symbol: 'G1', name: 'Shuddha' },
      { symbol: 'G2', name: 'Sadharana' },
      { symbol: 'G3', name: 'Antara' },
    ],
  },
  {
    family: 'Madhyamam',
    variants: [
      { symbol: 'M1', name: 'Shuddha' },
      { symbol: 'M2', name: 'Prati' },
    ],
  },
  { family: 'Panchamam', variants: [{ symbol: 'P', name: 'Panchamam' }] },
  {
    family: 'Dhaivatam',
    variants: [
      { symbol: 'D1', name: 'Shuddha' },
      { symbol: 'D2', name: 'Chatushruti' },
      { symbol: 'D3', name: 'Shatshruti' },
    ],
  },
  {
    family: 'Nishadam',
    variants: [
      { symbol: 'N1', name: 'Shuddha' },
      { symbol: 'N2', name: 'Kaisiki' },
      { symbol: 'N3', name: 'Kakali' },
    ],
  },
];

const ORDER: string[] = SWARA_GROUPS.flatMap((group) => group.variants.map((v) => v.symbol));

/** Sorts swaras in ascending pitch order (S, R1, R2 … N3). */
export function sortSwaras<T extends string>(swaras: T[]): T[] {
  return [...swaras].sort((a, b) => ORDER.indexOf(a) - ORDER.indexOf(b));
}

/** Ratio of a note to middle Sa, honouring octave markers. Unknown notes return null. */
export function swaraRatio(note: string): number | null {
  let token = note.trim();
  let octave = 1;
  while (token.endsWith("'") || token.endsWith('’')) {
    octave *= 2;
    token = token.slice(0, -1);
  }
  while (token.endsWith(',')) {
    octave /= 2;
    token = token.slice(0, -1);
  }
  const symbol = HINDUSTANI[token] ?? token.toUpperCase();
  const ratio = RATIOS[symbol];
  return ratio === undefined ? null : ratio * octave;
}

/**
 * Extracts playable notes from a scale string such as "S R2 G3 M1 P D2 N3 S'".
 * Annotations in parentheses are ignored and commas are treated as separators.
 */
export function parseScale(scale: string | undefined | null): string[] {
  if (!scale) return [];
  const cleaned = scale.replace(/\([^)]*\)/g, ' ');
  const notes = cleaned.match(/\b[SRGMPDNsrgmpdn][123]?['’]?(?![A-Za-z0-9])/g) ?? [];
  return notes
    .map((n) => n.charAt(0).toUpperCase() + n.slice(1).replace('’', "'"))
    .filter((n) => swaraRatio(n) !== null);
}

/** Distinct swara symbols (without octave markers) used by a scale, in pitch order. */
export function scaleSwaraSet(...scales: Array<string | undefined>): SwaraSymbol[] {
  const set = new Set<string>();
  for (const scale of scales) {
    for (const note of parseScale(scale)) set.add(note.replace(/['’,]/g, ''));
  }
  return sortSwaras([...set].filter((s): s is SwaraSymbol => ORDER.includes(s)));
}

/**
 * Converts a western note name relative to a tonic into a swara, e.g. with tonic C,
 * "E" becomes G3. Returns null for unrecognised names.
 */
const PITCH_CLASS: Record<string, number> = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
const SEMITONE_TO_SWARA: SwaraSymbol[] = ['S', 'R1', 'R2', 'G2', 'G3', 'M1', 'M2', 'P', 'D1', 'D2', 'N2', 'N3'];

function pitchClass(name: string): number | null {
  const match = name.trim().match(/^([A-G])(#|♯|b|♭)?$/);
  if (!match) return null;
  let value = PITCH_CLASS[match[1]];
  if (match[2] === '#' || match[2] === '♯') value += 1;
  if (match[2] === 'b' || match[2] === '♭') value -= 1;
  return (value + 12) % 12;
}

/** Parses "C D E F# G A B" into swaras, treating the first note as Sa. */
export function westernNotesToSwaras(text: string): SwaraSymbol[] | null {
  const tokens = text.match(/\b[A-G](?:#|♯|b|♭)?(?=[\s,;.\-]|$)/g);
  if (!tokens || tokens.length < 3) return null;
  const classes = tokens.map(pitchClass).filter((v): v is number => v !== null);
  if (classes.length < 3) return null;
  const tonic = classes[0];
  const swaras = new Set<SwaraSymbol>();
  for (const pc of classes) swaras.add(SEMITONE_TO_SWARA[(pc - tonic + 12) % 12]);
  return sortSwaras([...swaras]);
}
