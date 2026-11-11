'use client';

import { useEffect, useRef, useState } from 'react';
import { Pause, Play } from 'lucide-react';
import { SHRUTI_KEYS, Tanpura, type TanpuraTuning } from '@/lib/music/audio';
import { BreathingOrb } from '@/components/music/BreathingOrb';
import { Segmented } from '@/components/ui/Segmented';
import { cn } from '@/lib/cn';

const STRING_LABEL: Record<TanpuraTuning, string> = { Pa: 'Pa', Ma: 'Ma', Ni: 'Ni' };

/** Full tanpura with shruti, tuning and volume. Strings vibrate on every real pluck. */
export function TanpuraPanel() {
  const tanpura = useRef<Tanpura | null>(null);
  const [key, setKey] = useState<string>('C');
  const [tuning, setTuning] = useState<TanpuraTuning>('Pa');
  const [volume, setVolume] = useState(0.6);
  const [playing, setPlaying] = useState(false);
  const [pluck, setPluck] = useState<{ index: number; count: number } | null>(null);
  const shruti = SHRUTI_KEYS.find((k) => k.key === key) ?? SHRUTI_KEYS[0];

  useEffect(() => () => tanpura.current?.stop(), []);

  useEffect(() => {
    tanpura.current?.update({ saHz: shruti.hz, tuning, volume });
  }, [shruti.hz, tuning, volume]);

  const toggle = () => {
    if (playing) {
      tanpura.current?.stop();
      setPlaying(false);
      setPluck(null);
      return;
    }
    tanpura.current ??= new Tanpura({
      saHz: shruti.hz,
      tuning,
      volume,
      onPluck: (index) => setPluck((p) => ({ index, count: (p?.count ?? 0) + 1 })),
    });
    tanpura.current.update({ saHz: shruti.hz, tuning, volume });
    tanpura.current.start();
    setPlaying(true);
  };

  const labels = [STRING_LABEL[tuning], 'Sa', 'Sa', 'Sa'];
  const sublabels = ['mandra', 'madhya', 'madhya', 'mandra'];

  return (
    <div className="grid gap-6 lg:grid-cols-[1.15fr_1fr]">
      <div className="relative overflow-hidden rounded-4xl bg-espresso p-6 text-surface sm:p-10">
        <div className="pointer-events-none absolute -left-20 -top-20 h-72 w-72 rounded-full bg-coral/20 blur-3xl" aria-hidden />
        <div className="relative flex items-center justify-between">
          <p className="text-[0.6875rem] uppercase tracking-eyebrow text-surface/55">Tanpura · Sa = {shruti.key}</p>
          <p className="font-mono text-xs text-surface/55">{shruti.hz.toFixed(1)} Hz</p>
        </div>

        <div className="relative mt-8 flex h-64 items-stretch justify-center gap-8 sm:h-80 sm:gap-12" aria-hidden>
          {labels.map((label, i) => {
            const struck = playing && pluck?.index === i;
            return (
              <div key={i} className="flex flex-col items-center">
                <div className="relative flex-1">
                  <span
                    key={struck ? pluck!.count : 'idle'}
                    className={cn('absolute inset-y-0 left-1/2 -ml-px w-0.5 bg-surface/70', struck && 'animate-pluck-once')}
                  />
                  <span
                    key={struck ? `g${pluck!.count}` : 'gidle'}
                    className={cn('absolute inset-y-0 left-1/2 -ml-[3px] w-1.5 rounded-full bg-coral/80 opacity-0 blur-[3px]', struck && 'animate-string-glow-once')}
                  />
                </div>
                <span className={cn('mt-3 font-mono text-sm transition-colors', struck ? 'text-coral' : 'text-surface/70')}>{label}</span>
                <span className="text-[0.625rem] uppercase tracking-eyebrow text-surface/35">{sublabels[i]}</span>
              </div>
            );
          })}
        </div>

        <div className="relative mt-8 flex items-center gap-5">
          <button
            type="button"
            onClick={toggle}
            aria-pressed={playing}
            className="relative flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-coral text-surface transition-transform hover:scale-105"
            aria-label={playing ? 'Stop tanpura' : 'Start tanpura'}
          >
            {playing && <span className="absolute inset-0 rounded-full bg-coral/40 animate-ripple" aria-hidden />}
            {playing ? <Pause className="relative h-6 w-6" /> : <Play className="relative ml-1 h-6 w-6" />}
          </button>
          <div>
            <p className="text-xl tracking-[-0.02em]">{playing ? 'Drone is playing' : 'Start the drone'}</p>
            <p className="text-sm text-surface/55">Settings change on the next stroke, without stopping.</p>
          </div>
        </div>
      </div>

      <div className="card flex flex-col gap-7 p-6 sm:p-8">
        <div>
          <p className="field-label">Shruti (key of Sa)</p>
          <div className="grid grid-cols-4 gap-1.5 sm:grid-cols-6">
            {SHRUTI_KEYS.map((k) => (
              <button
                key={k.key}
                type="button"
                onClick={() => setKey(k.key)}
                aria-pressed={k.key === key}
                className={cn(
                  'rounded-xl border px-2 py-2 text-center transition-colors',
                  k.key === key ? 'border-espresso bg-espresso text-surface' : 'border-ink/10 bg-surface hover:border-coral/40',
                )}
              >
                <span className="block font-mono text-sm">{k.key}</span>
                <span className={cn('block text-[0.625rem]', k.key === key ? 'text-surface/60' : 'text-faint')}>{k.kattai} kattai</span>
              </button>
            ))}
          </div>
        </div>
        <div>
          <p className="field-label">First string</p>
          <Segmented
            label="Tuning"
            value={tuning}
            onChange={setTuning}
            options={[
              { value: 'Pa', label: 'Pa — most ragas' },
              { value: 'Ma', label: 'Ma — no Pa' },
              { value: 'Ni', label: 'Ni' },
            ]}
          />
        </div>
        <div>
          <label htmlFor="volume" className="field-label">
            Volume
          </label>
          <input id="volume" type="range" min={0.1} max={1} step={0.05} value={volume} onChange={(e) => setVolume(Number(e.target.value))} className="w-full accent-coral" />
        </div>
        <div className="mt-auto flex items-center gap-4 rounded-3xl bg-canvas/70 p-4">
          <BreathingOrb active={playing} className="w-20 shrink-0" />
          <p className="text-sm leading-relaxed text-muted">
            Sing a long Sa against the drone. When your voice and the strings stop beating against each other, you are in tune.
          </p>
        </div>
      </div>
    </div>
  );
}
