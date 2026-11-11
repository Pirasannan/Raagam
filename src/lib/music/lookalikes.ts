export interface LookalikeSide {
  name: string;
  tradition: 'Carnatic' | 'Hindustani';
  scale: string;
  /** Notes played for comparison. `,` marks the lower octave. */
  play: string[];
  about: string;
}

export interface LookalikePair {
  id: string;
  a: LookalikeSide;
  b: LookalikeSide;
  difference: string;
}

/** Pairs of ragas that are easy to confuse, and what tells them apart. */
export const LOOKALIKES: LookalikePair[] = [
  {
    id: 'keeravani-simhendramadhyamam',
    a: {
      name: 'Keeravani',
      tradition: 'Carnatic',
      scale: "S R2 G2 M1 P D1 N3 S'",
      play: ['S', 'R2', 'G2', 'M1', 'P', 'D1', 'N3', "S'"],
      about: 'Melakarta 21. Tender and longing; close to the western harmonic minor.',
    },
    b: {
      name: 'Simhendramadhyamam',
      tradition: 'Carnatic',
      scale: "S R2 G2 M2 P D1 N3 S'",
      play: ['S', 'R2', 'G2', 'M2', 'P', 'D1', 'N3', "S'"],
      about: 'Melakarta 57. The raised Ma gives it a brighter, more mysterious intensity.',
    },
    difference: 'Only the madhyamam changes: Keeravani uses shuddha Ma (M1), Simhendramadhyamam uses prati Ma (M2). Listen to the fourth note.',
  },
  {
    id: 'hamsadhwani-mohanam',
    a: {
      name: 'Hamsadhwani',
      tradition: 'Carnatic',
      scale: "S R2 G3 P N3 S'",
      play: ['S', 'R2', 'G3', 'P', 'N3', "S'", 'N3', 'P', 'G3', 'R2', 'S'],
      about: 'Five notes, no Ma or Dha. Bright and auspicious; often opens a concert.',
    },
    b: {
      name: 'Mohanam',
      tradition: 'Carnatic',
      scale: "S R2 G3 P D2 S'",
      play: ['S', 'R2', 'G3', 'P', 'D2', "S'", 'D2', 'P', 'G3', 'R2', 'S'],
      about: 'Five notes, no Ma or Ni. Broad, warm and serene.',
    },
    difference: 'The fifth note gives it away: Hamsadhwani climbs to Ni (N3) and skips Dha; Mohanam rests on Dha (D2) and skips Ni.',
  },
  {
    id: 'charukesi-natabhairavi',
    a: {
      name: 'Charukesi',
      tradition: 'Carnatic',
      scale: "S R2 G3 M1 P D1 N2 S'",
      play: ['S', 'R2', 'G3', 'M1', 'P', 'D1', 'N2', "S'"],
      about: 'Melakarta 26. A major lower half meets a minor upper half, which makes it bittersweet.',
    },
    b: {
      name: 'Natabhairavi',
      tradition: 'Carnatic',
      scale: "S R2 G2 M1 P D1 N2 S'",
      play: ['S', 'R2', 'G2', 'M1', 'P', 'D1', 'N2', "S'"],
      about: 'Melakarta 20. The natural minor scale; reflective throughout.',
    },
    difference: 'Listen to the third note. Charukesi has the bright antara Ga (G3); Natabhairavi has the softer sadharana Ga (G2).',
  },
  {
    id: 'kalyani-yaman',
    a: {
      name: 'Kalyani',
      tradition: 'Carnatic',
      scale: "S R2 G3 M2 P D2 N3 S'",
      play: ['S', 'R2', 'G3', 'M2', 'P', 'D2', 'N3', "S'"],
      about: 'Melakarta 65. Moves straight up and down through every note, Sa and Pa included.',
    },
    b: {
      name: 'Yaman',
      tradition: 'Hindustani',
      scale: "N, R2 G3 M2 D2 N3 S'",
      play: ['N3,', 'R2', 'G3', 'M2', 'D2', 'N3', "S'", 'N3', 'D2', 'P', 'M2', 'G3', 'R2', 'S'],
      about: 'Kalyan thaat. Phrases usually start from the lower Ni and pass over Sa and Pa while ascending.',
    },
    difference: 'Same notes, different movement. Yaman typically begins "Ni Re Ga" from below and skips Pa going up; Kalyani walks through Sa and Pa directly.',
  },
  {
    id: 'mohanam-bhupali',
    a: {
      name: 'Mohanam',
      tradition: 'Carnatic',
      scale: "S R2 G3 P D2 S'",
      play: ['S', 'R2', 'G3', 'P', 'D2', "S'", 'D2', 'P', 'G3', 'R2', 'S'],
      about: 'Sung with oscillating gamakas on Ga and Dha.',
    },
    b: {
      name: 'Bhupali',
      tradition: 'Hindustani',
      scale: "S R2 G3 P D2 S'",
      play: ['S', 'R2', 'G3', 'P', 'D2', "S'", 'D2', 'P', 'G3', 'R2', 'S'],
      about: 'Sung with calm glides (meend) that rest on Ga and Dha without shaking them.',
    },
    difference: 'The notes are identical. Mohanam shakes Ga and Dha with kampita gamakas; Bhupali glides between them and holds them still.',
  },
  {
    id: 'mayamalavagowla-bhairav',
    a: {
      name: 'Mayamalavagowla',
      tradition: 'Carnatic',
      scale: "S R1 G3 M1 P D1 N3 S'",
      play: ['S', 'R1', 'G3', 'M1', 'P', 'D1', 'N3', "S'"],
      about: 'Melakarta 15. Two matching halves; the first raga most Carnatic students learn.',
    },
    b: {
      name: 'Bhairav',
      tradition: 'Hindustani',
      scale: "S R1 G3 M1 P D1 N3 S'",
      play: ['S', 'R1', 'G3', 'M1', 'P', 'D1', 'N3', "S'"],
      about: 'A dawn raga with a slow, heavy oscillation (andolan) on komal Re and komal Dha.',
    },
    difference: 'The notes are identical. Bhairav sways slowly and solemnly on Re and Dha; Mayamalavagowla uses quicker Carnatic gamakas.',
  },
  {
    id: 'hindolam-malkauns',
    a: {
      name: 'Hindolam',
      tradition: 'Carnatic',
      scale: "S G2 M1 D1 N2 S'",
      play: ['S', 'G2', 'M1', 'D1', 'N2', "S'", 'N2', 'D1', 'M1', 'G2', 'S'],
      about: 'Five notes without Ri or Pa. Often sung briskly, with flowing gamakas.',
    },
    b: {
      name: 'Malkauns',
      tradition: 'Hindustani',
      scale: "S G2 M1 D1 N2 S'",
      play: ['S', 'G2', 'M1', 'D1', 'N2', "S'", 'N2', 'D1', 'M1', 'G2', 'S'],
      about: 'A midnight raga of great depth, sung slowly with heavy glides around Ma.',
    },
    difference: 'The notes are identical. Malkauns is slow and grave and centres on Ma; Hindolam is lighter and moves more quickly.',
  },
];
