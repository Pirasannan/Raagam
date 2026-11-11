import { parseScale, sortSwaras, type SwaraSymbol } from './swaras';

export interface Chakra {
  number: number;
  name: string;
  meaning: string;
  madhyamam: 'M1' | 'M2';
}

export interface Melakarta {
  number: number;
  name: string;
  chakra: Chakra;
  /** Full sampurna scale, e.g. "S R1 G3 M1 P D1 N3 S'". */
  arohana: string;
  avarohana: string;
  swaras: SwaraSymbol[];
}

export const CHAKRAS: Chakra[] = [
  { number: 1, name: 'Indu', meaning: 'Moon', madhyamam: 'M1' },
  { number: 2, name: 'Netra', meaning: 'Eyes', madhyamam: 'M1' },
  { number: 3, name: 'Agni', meaning: 'Fire', madhyamam: 'M1' },
  { number: 4, name: 'Veda', meaning: 'Scriptures', madhyamam: 'M1' },
  { number: 5, name: 'Bana', meaning: 'Arrows', madhyamam: 'M1' },
  { number: 6, name: 'Ritu', meaning: 'Seasons', madhyamam: 'M1' },
  { number: 7, name: 'Rishi', meaning: 'Sages', madhyamam: 'M2' },
  { number: 8, name: 'Vasu', meaning: 'Gods', madhyamam: 'M2' },
  { number: 9, name: 'Brahma', meaning: 'Creator', madhyamam: 'M2' },
  { number: 10, name: 'Disi', meaning: 'Directions', madhyamam: 'M2' },
  { number: 11, name: 'Rudra', meaning: 'Shiva', madhyamam: 'M2' },
  { number: 12, name: 'Aditya', meaning: 'Suns', madhyamam: 'M2' },
];

const NAMES = [
  'Kanakangi', 'Ratnangi', 'Ganamurti', 'Vanaspati', 'Manavati', 'Tanarupi',
  'Senavati', 'Hanumatodi', 'Dhenuka', 'Natakapriya', 'Kokilapriya', 'Rupavati',
  'Gayakapriya', 'Vakulabharanam', 'Mayamalavagowla', 'Chakravakam', 'Suryakantam', 'Hatakambari',
  'Jhankaradhwani', 'Natabhairavi', 'Keeravani', 'Kharaharapriya', 'Gourimanohari', 'Varunapriya',
  'Mararanjani', 'Charukesi', 'Sarasangi', 'Harikambhoji', 'Dheerasankarabharanam', 'Naganandini',
  'Yagapriya', 'Ragavardhini', 'Gangeyabhushani', 'Vagadheeswari', 'Sulini', 'Chalanata',
  'Salagam', 'Jalarnavam', 'Jhalavarali', 'Navaneetam', 'Pavani', 'Raghupriya',
  'Gavambodhi', 'Bhavapriya', 'Subhapantuvarali', 'Shadvidhamargini', 'Suvarnangi', 'Divyamani',
  'Dhavalambari', 'Namanarayani', 'Kamavardhini', 'Ramapriya', 'Gamanashrama', 'Viswambhari',
  'Syamalangi', 'Shanmukhapriya', 'Simhendramadhyamam', 'Hemavati', 'Dharmavati', 'Neetimati',
  'Kantamani', 'Rishabhapriya', 'Latangi', 'Vachaspati', 'Mechakalyani', 'Chitrambari',
  'Sucharitra', 'Jyotiswarupini', 'Dhatuvardhani', 'Nasikabhushani', 'Kosalam', 'Rasikapriya',
];

/** The six R–G combinations, in chakra order. */
const RG: Array<[SwaraSymbol, SwaraSymbol]> = [
  ['R1', 'G1'], ['R1', 'G2'], ['R1', 'G3'], ['R2', 'G2'], ['R2', 'G3'], ['R3', 'G3'],
];
/** The six D–N combinations, in order within a chakra. */
const DN: Array<[SwaraSymbol, SwaraSymbol]> = [
  ['D1', 'N1'], ['D1', 'N2'], ['D1', 'N3'], ['D2', 'N2'], ['D2', 'N3'], ['D3', 'N3'],
];

/** The 72 melakartas, derived from the systematic chakra scheme rather than typed by hand. */
export const MELAKARTAS: Melakarta[] = NAMES.map((name, index) => {
  const chakra = CHAKRAS[Math.floor(index / 6)];
  const [r, g] = RG[Math.floor(index / 6) % 6];
  const [d, n] = DN[index % 6];
  const swaras: SwaraSymbol[] = ['S', r, g, chakra.madhyamam, 'P', d, n];
  return {
    number: index + 1,
    name,
    chakra,
    swaras,
    arohana: `${swaras.join(' ')} S'`,
    avarohana: `S' ${[...swaras].reverse().join(' ')}`,
  };
});

export function melakartaByNumber(number: number): Melakarta | undefined {
  return MELAKARTAS[number - 1];
}

/** Swara set (including S) for any scale pair, sorted by pitch. */
export function swaraSetOf(arohana: string, avarohana: string): SwaraSymbol[] {
  const set = new Set<SwaraSymbol>();
  for (const note of [...parseScale(arohana), ...parseScale(avarohana)]) {
    set.add(note.replace(/['’,]/g, '') as SwaraSymbol);
  }
  return sortSwaras([...set]);
}

/** 1 → "1st", 22 → "22nd", 13 → "13th". */
export function ordinal(n: number): string {
  const teen = n % 100 >= 11 && n % 100 <= 13;
  const suffix = teen ? 'th' : ({ 1: 'st', 2: 'nd', 3: 'rd' } as Record<number, string>)[n % 10] ?? 'th';
  return `${n}${suffix}`;
}
