'use client';

import { useEffect, useState } from 'react';
import { Pause, Play, RotateCcw } from 'lucide-react';
import { playSequence, stopSequence } from '@/lib/music/audio';
import { Eyebrow } from '@/components/ui/Eyebrow';
import { BreathingOrb } from '@/components/music/BreathingOrb';
import { cn } from '@/lib/cn';

interface Scene {
  title: string;
  caption: string;
  narration: string;
  notes?: string[];
}

/** Narrated walkthrough, intended to be screen-recorded for a promo video. Not linked from navigation. */
const SCENES: Scene[] = [
  {
    title: 'Hear a raga. Know its name.',
    caption: 'Raagam is a free guide to Carnatic and Hindustani ragas.',
    narration: 'Indian classical music has hundreds of ragas, and many sound alike. Raagam helps you find, hear and learn them.',
  },
  {
    title: 'Tap the swaras you hear',
    caption: 'Sixteen swara keys, played with just-intonation ratios.',
    narration: 'Choose Sa, chatushruti Ri, antara Ga, Pa and chatushruti Dha. Each note sounds as you tap it.',
    notes: ['S', 'R2', 'G3', 'P', 'D2', "S'"],
  },
  {
    title: 'Mohanam',
    caption: 'An exact match from the library of 908 janya ragas and 72 melakartas.',
    narration: 'Those five notes are Mohanam, a janya of Harikambhoji. Raagam shows its ascent, its descent and songs composed in it.',
    notes: ['S', 'R2', 'G3', 'P', 'D2', "S'", 'D2', 'P', 'G3', 'R2', 'S'],
  },
  {
    title: 'Or search by song',
    caption: 'More than five thousand songs and kritis are mapped to their ragas.',
    narration: 'Type a film song or a kriti, and Raagam looks it up in its song archive.',
  },
  {
    title: 'Seventy-two melakartas',
    caption: 'An interactive wheel of the twelve chakras.',
    narration: 'Every Carnatic raga descends from one of seventy-two parent scales. Choose any of them on the wheel to hear it.',
    notes: ['S', 'R1', 'G3', 'M1', 'P', 'D1', 'N3', "S'"],
  },
  {
    title: 'Practise with a tanpura',
    caption: 'A drone in any shruti, and comparisons of look-alike ragas.',
    narration: 'Sing against the tanpura, and learn to tell apart ragas that share the same notes. Raagam is free, with no sign-in.',
  },
];

const SCENE_MS = 11000;

export default function VideoDemoPage() {
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const scene = SCENES[index];

  useEffect(() => {
    if (!playing) return;
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(scene.narration);
      utterance.rate = 0.95;
      window.speechSynthesis.speak(utterance);
    }
    if (scene.notes) void playSequence(scene.notes, { noteDuration: 0.4 });
    const timer = window.setTimeout(() => {
      if (index < SCENES.length - 1) setIndex(index + 1);
      else setPlaying(false);
    }, SCENE_MS);
    return () => {
      window.clearTimeout(timer);
      stopSequence();
      if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    };
  }, [playing, index, scene]);

  return (
    <div className="container-page py-14">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <Eyebrow>Presentation mode</Eyebrow>
          <h1 className="display mt-4 text-4xl sm:text-5xl">Narrated walkthrough</h1>
          <p className="mt-2 text-muted">Press play and screen-record this page for a short demo video.</p>
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={() => setPlaying(!playing)} className="flex items-center gap-2 rounded-xl bg-espresso px-5 py-3 text-sm text-surface">
            {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            {playing ? 'Pause' : 'Play'}
          </button>
          <button
            type="button"
            onClick={() => {
              setPlaying(false);
              setIndex(0);
            }}
            className="rounded-xl border border-ink/10 bg-surface p-3"
            aria-label="Restart"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
        </div>
      </div>

      <section className="relative mt-8 flex aspect-video flex-col items-center justify-center overflow-hidden rounded-5xl bg-espresso px-8 text-center text-surface" aria-live="polite">
        <div className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-coral/20 blur-3xl" aria-hidden />
        <BreathingOrb active={playing} className="w-28 sm:w-40" />
        <h2 key={index} className="display mt-6 text-3xl animate-fade-up sm:text-6xl">
          {scene.title}
        </h2>
        <p key={`c${index}`} className="mt-4 max-w-2xl font-serif text-xl italic text-surface/75 animate-fade-up sm:text-3xl">
          {scene.caption}
        </p>
        {scene.notes && (
          <p className="mt-6 font-mono text-sm text-coral sm:text-base">{scene.notes.join('  ')}</p>
        )}
        <div className="absolute inset-x-8 bottom-6 flex gap-1.5">
          {SCENES.map((_, i) => (
            <button key={i} type="button" onClick={() => setIndex(i)} aria-label={`Scene ${i + 1}`} className={cn('h-1 flex-1 rounded-full transition-colors', i <= index ? 'bg-coral' : 'bg-surface/20')} />
          ))}
        </div>
      </section>
      <p className="mt-4 text-sm text-muted">Narration: {scene.narration}</p>
    </div>
  );
}
