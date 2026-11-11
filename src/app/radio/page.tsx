import type { Metadata } from 'next';
import { PageHeader } from '@/components/layout/PageHeader';
import { RagaRadio } from '@/components/radio/RagaRadio';
import { CHANNEL_SUMMARIES, DEFAULT_CHANNEL, findChannel } from '@/lib/radio';

export const metadata: Metadata = {
  title: 'Raga radio',
  description: 'Ninety raga channels with 3,274 Malayalam film songs composed in them. Learn a raga by listening.',
};

export default async function RadioPage({ searchParams }: { searchParams: Promise<{ raga?: string; channel?: string }> }) {
  const params = await searchParams;
  const channel = findChannel(params.raga ?? params.channel) ?? DEFAULT_CHANNEL;
  return (
    <>
      <PageHeader
        eyebrow="Raga radio"
        title="Ninety ragas."
        accent="Three thousand songs."
        description="Each channel plays Malayalam film songs composed in one raga. Pick a raga and let it settle in your ear before you learn its scale."
      />
      <div className="container-page pb-24">
        <RagaRadio channels={CHANNEL_SUMMARIES} initialChannelId={channel.id} initialSongs={channel.songs} />
      </div>
    </>
  );
}
