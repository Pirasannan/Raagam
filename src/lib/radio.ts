import radioData from '@/data/raga_radio_90.json';
import type { RagaRadioChannel } from '@/types/radio';

const CHANNELS = radioData as RagaRadioChannel[];

export type ChannelSummary = Pick<RagaRadioChannel, 'id' | 'name' | 'songCount'>;

/** All channels without their song lists, for the channel picker. */
export const CHANNEL_SUMMARIES: ChannelSummary[] = CHANNELS.map(({ id, name, songCount }) => ({ id, name, songCount }));

/** Finds a channel by id or raga name, case-insensitively. */
export function findChannel(idOrName?: string | null): RagaRadioChannel | undefined {
  if (!idOrName) return undefined;
  const key = idOrName.toLowerCase();
  return CHANNELS.find((c) => c.id === key || c.name.toLowerCase() === key);
}

export const DEFAULT_CHANNEL = CHANNELS[0];
