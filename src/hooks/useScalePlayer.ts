'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { playSequence, stopSequence, type SequenceOptions } from '@/lib/music/audio';

/**
 * Tracks which scale is playing and which note is sounding, so the UI can
 * light up notes in time with the audio. Only one scale plays app-wide.
 */
export function useScalePlayer() {
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [noteIndex, setNoteIndex] = useState(-1);
  const run = useRef(0);

  const play = useCallback(async (id: string, notes: string[], options: Omit<SequenceOptions, 'onNote'> = {}) => {
    const token = ++run.current;
    setPlayingId(id);
    setNoteIndex(-1);
    await playSequence(notes, {
      ...options,
      onNote: (i) => {
        if (run.current === token) setNoteIndex(i);
      },
    });
    if (run.current === token) {
      setPlayingId(null);
      setNoteIndex(-1);
    }
  }, []);

  const stop = useCallback(() => {
    run.current += 1;
    stopSequence();
    setPlayingId(null);
    setNoteIndex(-1);
  }, []);

  const toggle = useCallback(
    (id: string, notes: string[], options?: Omit<SequenceOptions, 'onNote'>) => {
      if (playingId === id) stop();
      else void play(id, notes, options);
    },
    [play, playingId, stop],
  );

  useEffect(() => () => {
    run.current += 1;
  }, []);

  return { playingId, noteIndex, play, stop, toggle };
}
