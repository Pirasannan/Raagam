export const SITE = {
  name: 'Raagam',
  url: 'https://raagam-jet.vercel.app',
  description:
    'Find Carnatic and Hindustani ragas by swaras, song title or notes. Explore 908 janya ragas, the 72 melakartas, raga radio and a tanpura drone. Free, no sign-in.',
  repo: 'https://github.com/Pirasannan/Raagam',
};

export interface NavItem {
  href: string;
  label: string;
  description: string;
}

/** Primary navigation, in display order. */
export const NAV: NavItem[] = [
  { href: '/', label: 'Find', description: 'Identify a raga by swaras, song or notes' },
  { href: '/ragas', label: 'Ragas', description: '908 janya ragas with playable scales' },
  { href: '/melakarta', label: 'Melakarta', description: 'The 72 parent scales in 12 chakras' },
  { href: '/radio', label: 'Radio', description: '90 raga channels of film songs' },
  { href: '/practice', label: 'Practice', description: 'Tanpura drone and ear-training tools' },
  { href: '/updates', label: 'New songs', description: 'Latest Malayalam film playlists' },
  { href: '/downloads', label: 'Downloads', description: 'Open datasets in CSV and JSON' },
];

/** Raga names used in the scrolling marquee. */
export const MARQUEE_RAGAS = [
  'Mohanam', 'Kalyani', 'Todi', 'Bhairavi', 'Kharaharapriya', 'Hamsadhwani', 'Shankarabharanam',
  'Keeravani', 'Charukesi', 'Hindolam', 'Madhyamavati', 'Shanmukhapriya', 'Abhogi', 'Kapi',
];
