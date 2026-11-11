import type { Metadata } from 'next';
import { PageHeader } from '@/components/layout/PageHeader';
import { NewSongs } from '@/components/updates/NewSongs';

export const metadata: Metadata = {
  title: 'New Malayalam songs',
  description: 'Spotify playlists of new Malayalam film songs, with a quick way to look up the raga of any song.',
};

export default function UpdatesPage() {
  return (
    <>
      <PageHeader
        eyebrow="New songs"
        title="New Malayalam songs,"
        accent="as they are released."
        description="Spotify's Malayalam playlists, gathered in one place. When a melody catches you, look up its raga."
      />
      <div className="container-page pb-24">
        <NewSongs />
      </div>
    </>
  );
}
