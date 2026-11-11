import { swaraRatio } from './swaras';

/** Middle Sa for swara playback (C4). */
export const DEFAULT_SA_HZ = 261.63;

let context: AudioContext | null = null;
let master: GainNode | null = null;
let pluckWave: PeriodicWave | null = null;
let droneWave: PeriodicWave | null = null;

function audio(): { ctx: AudioContext; out: GainNode } | null {
  if (typeof window === 'undefined') return null;
  if (!context) {
    const Ctor =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return null;
    context = new Ctor();

    // A gentle compressor keeps overlapping notes and the drone from clipping.
    const compressor = context.createDynamicsCompressor();
    compressor.threshold.value = -18;
    compressor.ratio.value = 3;
    master = context.createGain();
    master.gain.value = 0.9;
    master.connect(compressor);
    compressor.connect(context.destination);
  }
  if (context.state === 'suspended') void context.resume();
  return { ctx: context, out: master! };
}

function harmonicWave(ctx: AudioContext, amplitudes: number[]): PeriodicWave {
  const real = new Float32Array(amplitudes.length + 1);
  const imag = new Float32Array(amplitudes.length + 1);
  amplitudes.forEach((a, i) => {
    imag[i + 1] = a;
  });
  return ctx.createPeriodicWave(real, imag);
}

/**
 * A plucked string voice: bright attack that mellows as it decays, with a
 * short upward glide into the note like a light Carnatic gamaka.
 */
function pluck(ctx: AudioContext, out: AudioNode, frequency: number, start: number, duration: number, level = 0.32) {
  pluckWave ??= harmonicWave(ctx, [1, 0.62, 0.38, 0.26, 0.16, 0.11, 0.07, 0.05, 0.03]);

  const osc = ctx.createOscillator();
  osc.setPeriodicWave(pluckWave);
  osc.frequency.setValueAtTime(frequency * 0.985, start);
  osc.frequency.exponentialRampToValueAtTime(frequency, start + 0.06);

  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.Q.value = 0.8;
  filter.frequency.setValueAtTime(Math.min(frequency * 10, 12000), start);
  filter.frequency.exponentialRampToValueAtTime(Math.max(frequency * 2.2, 400), start + duration);

  const gain = ctx.createGain();
  const tail = duration * 1.5;
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(level, start + 0.008);
  gain.gain.exponentialRampToValueAtTime(level * 0.45, start + duration * 0.4);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + tail);

  osc.connect(filter).connect(gain).connect(out);
  osc.start(start);
  osc.stop(start + tail + 0.05);
}

/** Plays one swara immediately. Unknown notes are ignored. */
export function playSwara(note: string, { duration = 0.6, saHz = DEFAULT_SA_HZ } = {}): void {
  const a = audio();
  const ratio = swaraRatio(note);
  if (!a || ratio === null) return;
  pluck(a.ctx, a.out, saHz * ratio, a.ctx.currentTime, duration);
}

export interface SequenceOptions {
  noteDuration?: number;
  saHz?: number;
  /** Called as each note starts, with its index in the sequence. */
  onNote?: (index: number) => void;
}

let activeSequence = 0;

/** Stops any sequence currently playing. */
export function stopSequence(): void {
  activeSequence += 1;
}

/**
 * Plays notes one after another. Starting a new sequence stops the previous
 * one, so two scales never play over each other. Resolves when finished or
 * interrupted.
 */
export function playSequence(notes: string[], { noteDuration = 0.42, saHz = DEFAULT_SA_HZ, onNote }: SequenceOptions = {}): Promise<void> {
  const id = ++activeSequence;

  return new Promise((resolve) => {
    let index = 0;
    const next = () => {
      while (index < notes.length && swaraRatio(notes[index]) === null) index += 1;
      if (id !== activeSequence || index >= notes.length) {
        resolve();
        return;
      }
      playSwara(notes[index], { duration: noteDuration * 1.4, saHz });
      onNote?.(index);
      index += 1;
      window.setTimeout(next, noteDuration * 1000);
    };
    next();
  });
}

export type TanpuraTuning = 'Pa' | 'Ma' | 'Ni';

/** Ratio of the first (mandra) string for each tuning. */
const FIRST_STRING: Record<TanpuraTuning, number> = { Pa: 3 / 4, Ma: 2 / 3, Ni: 15 / 16 };

/** Gap after each of the four strings, in seconds: an even pulse with a breath at the end. */
const STRING_GAPS = [1.05, 1.05, 1.05, 1.65];

export interface TanpuraOptions {
  saHz: number;
  tuning: TanpuraTuning;
  volume: number;
  onPluck?: (stringIndex: number) => void;
}

/**
 * A four-string tanpura drone (first string, Sa, Sa, mandra Sa). Each string is
 * rich in upper harmonics with a slowly closing filter, imitating the jawari buzz.
 */
export class Tanpura {
  private timer: number | null = null;
  private gain: GainNode | null = null;
  private stringIndex = 0;
  private options: TanpuraOptions;

  constructor(options: TanpuraOptions) {
    this.options = options;
  }

  get playing(): boolean {
    return this.timer !== null;
  }

  update(options: Partial<TanpuraOptions>): void {
    this.options = { ...this.options, ...options };
    if (this.gain && options.volume !== undefined && context) {
      this.gain.gain.setTargetAtTime(options.volume, context.currentTime, 0.1);
    }
  }

  start(): void {
    const a = audio();
    if (!a || this.playing) return;
    this.gain = a.ctx.createGain();
    this.gain.gain.value = this.options.volume;
    this.gain.connect(a.out);
    this.stringIndex = 0;
    this.pluckNext();
  }

  stop(): void {
    if (this.timer !== null) window.clearTimeout(this.timer);
    this.timer = null;
    if (this.gain && context) {
      const g = this.gain;
      g.gain.setTargetAtTime(0.0001, context.currentTime, 0.4);
      window.setTimeout(() => g.disconnect(), 2500);
    }
    this.gain = null;
  }

  private pluckNext = () => {
    const a = audio();
    if (!a || !this.gain) return;
    const { saHz, tuning, onPluck } = this.options;
    const ratios = [FIRST_STRING[tuning], 1, 1, 0.5];
    const i = this.stringIndex;
    this.drone(a.ctx, saHz * ratios[i], a.ctx.currentTime);
    onPluck?.(i);
    this.stringIndex = (i + 1) % 4;
    // Slight human variation in timing keeps the drone from sounding mechanical.
    const gap = STRING_GAPS[i] * (0.97 + Math.random() * 0.06);
    this.timer = window.setTimeout(this.pluckNext, gap * 1000);
  };

  private drone(ctx: AudioContext, frequency: number, start: number) {
    droneWave ??= harmonicWave(ctx, [1, 0.8, 0.7, 0.55, 0.5, 0.42, 0.36, 0.3, 0.25, 0.2, 0.16, 0.12, 0.09, 0.07]);
    const length = 4.2;

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.Q.value = 4;
    filter.frequency.setValueAtTime(frequency * 12, start);
    filter.frequency.exponentialRampToValueAtTime(frequency * 3, start + length);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(0.18, start + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + length);

    // Two slightly detuned voices give the string its shimmering beat.
    for (const detune of [-3, 4]) {
      const osc = ctx.createOscillator();
      osc.setPeriodicWave(droneWave);
      osc.frequency.value = frequency;
      osc.detune.value = detune;
      osc.connect(filter);
      osc.start(start);
      osc.stop(start + length + 0.1);
    }
    filter.connect(gain).connect(this.gain!);
  }
}

/** Shruti (pitch of Sa) options, with the traditional kattai numbering. */
export const SHRUTI_KEYS = [
  { key: 'C', kattai: '1', hz: 261.63 },
  { key: 'C#', kattai: '1½', hz: 277.18 },
  { key: 'D', kattai: '2', hz: 293.66 },
  { key: 'D#', kattai: '2½', hz: 311.13 },
  { key: 'E', kattai: '3', hz: 329.63 },
  { key: 'F', kattai: '4', hz: 349.23 },
  { key: 'F#', kattai: '4½', hz: 369.99 },
  { key: 'G', kattai: '5', hz: 392.0 },
  { key: 'G#', kattai: '5½', hz: 415.3 },
  { key: 'A', kattai: '6', hz: 440.0 },
  { key: 'A#', kattai: '6½', hz: 466.16 },
  { key: 'B', kattai: '7', hz: 493.88 },
] as const;
