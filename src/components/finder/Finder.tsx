'use client';

import { useRef, useState } from 'react';
import { Search } from 'lucide-react';
import type { IdentifyMiss, IdentifyMode, IdentifyRequest, IdentifyResponse, Tradition } from '@/types/raga';
import { Segmented } from '@/components/ui/Segmented';
import { Button } from '@/components/ui/Button';
import { Equalizer } from '@/components/ui/Equalizer';
import { SwaraKeyboard } from './SwaraKeyboard';
import { RagaResult } from './RagaResult';

const SONG_EXAMPLES = ['Vatapi Ganapatim', 'Pramadavanam', 'Samaja Vara Gamana', 'Harivarasanam', 'Aadiparaashakthi', 'Albela Sajan'];
const NOTE_EXAMPLES = ['C D E F# G A B', 'D E F# A B', 'S R1 G2 M1 P D1 N2', 'C Eb F Ab Bb'];

interface FinderProps {
  initialSwaras?: string[];
  initialSong?: string;
}

export function Finder({ initialSwaras, initialSong }: FinderProps) {
  const [mode, setMode] = useState<IdentifyMode>(initialSong ? 'song' : 'swaras');
  const [swaras, setSwaras] = useState<string[]>(initialSwaras?.length ? initialSwaras : ['S', 'R1', 'G3', 'M1', 'P', 'D1', 'N3']);
  const [song, setSong] = useState(initialSong ?? '');
  const [description, setDescription] = useState('');
  const [tradition, setTradition] = useState<Tradition>('Both');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<IdentifyResponse | null>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  const canSubmit =
    !loading && (mode === 'swaras' ? swaras.filter((s) => s !== 'S').length >= 2 : (mode === 'song' ? song : description).trim().length >= 2);

  const identify = async (event?: React.FormEvent) => {
    event?.preventDefault();
    if (!canSubmit) return;
    setLoading(true);
    setError('');
    const payload: IdentifyRequest = { mode, traditionPreference: tradition };
    if (mode === 'swaras') payload.swaras = swaras;
    if (mode === 'song') payload.songQuery = song.trim();
    if (mode === 'description') payload.description = description.trim();

    try {
      const res = await fetch('/api/identify-raga', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = (await res.json()) as IdentifyResponse | IdentifyMiss | { error: string };
      if (!res.ok || 'error' in data) throw new Error('error' in data ? data.error : 'Request failed');
      if ('notFound' in data) {
        setResult(null);
        setError(data.message);
        return;
      }
      setResult(data);
      requestAnimationFrame(() => resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
    } catch (err) {
      setResult(null);
      setError(err instanceof Error && err.message !== 'Failed to fetch' ? err.message : 'Could not reach Raagam. Check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <form onSubmit={identify} className="card p-4 sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Segmented
            label="Search by"
            value={mode}
            onChange={(m) => {
              setMode(m);
              setError('');
            }}
            options={[
              { value: 'swaras', label: 'Swaras' },
              { value: 'song', label: 'Song or kriti' },
              { value: 'description', label: 'Notes' },
            ]}
          />
          <label className="flex items-center gap-2 text-sm text-muted">
            Tradition
            <select value={tradition} onChange={(e) => setTradition(e.target.value as Tradition)} className="field w-auto py-2 pr-8 text-sm">
              <option value="Both">Both</option>
              <option value="Carnatic">Carnatic</option>
              <option value="Hindustani">Hindustani</option>
            </select>
          </label>
        </div>

        <div className="mt-6">
          {mode === 'swaras' && <SwaraKeyboard value={swaras} onChange={setSwaras} />}

          {mode === 'song' && (
            <div>
              <label htmlFor="song" className="field-label">
                Song, kriti or film title
              </label>
              <div className="relative">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-faint" />
                <input
                  id="song"
                  value={song}
                  onChange={(e) => setSong(e.target.value)}
                  placeholder="e.g. Vatapi Ganapatim"
                  className="field py-4 pl-12 text-lg"
                  autoComplete="off"
                  maxLength={300}
                />
              </div>
              <Examples items={SONG_EXAMPLES} onPick={setSong} />
            </div>
          )}

          {mode === 'description' && (
            <div>
              <label htmlFor="notes" className="field-label">
                Notes or a description
              </label>
              <textarea
                id="notes"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Write the notes in order, starting from Sa — C D E F# G A B — or swaras like S R2 G3 P D2"
                className="field resize-none font-mono text-base"
                maxLength={300}
              />
              <p className="mt-2 text-sm text-muted">
                The first western note is taken as Sa. Describing a raga in words, like its mood, needs the AI service.
              </p>
              <Examples items={NOTE_EXAMPLES} onPick={setDescription} />
            </div>
          )}
        </div>

        <div className="mt-7 flex flex-col-reverse items-stretch justify-between gap-4 border-t border-ink/[0.08] pt-6 sm:flex-row sm:items-center">
          <p className="text-sm text-muted" role="status">
            {loading ? (
              <span className="inline-flex items-center gap-2 text-coral-dark">
                <Equalizer /> Listening…
              </span>
            ) : mode === 'swaras' ? (
              'Select at least three swaras, including Sa.'
            ) : (
              'Press Enter or the button to search.'
            )}
          </p>
          <Button type="submit" disabled={!canSubmit} className="justify-between sm:justify-start">
            {loading ? 'Identifying…' : 'Identify raga'}
          </Button>
        </div>

        {error && (
          <div className="mt-5 rounded-2xl border border-coral/25 bg-coral-soft/40 px-4 py-3 text-sm text-ink animate-fade-up" role="alert">
            {error}
          </div>
        )}
      </form>

      <div ref={resultRef} className="scroll-mt-24">
        {result && (
          <div className="mt-8">
            <RagaResult key={JSON.stringify(result.rawQuery)} result={result} />
          </div>
        )}
      </div>
    </div>
  );
}

function Examples({ items, onPick }: { items: string[]; onPick: (value: string) => void }) {
  return (
    <div className="mt-4 flex flex-wrap items-center gap-2">
      <span className="mr-1 text-sm text-muted">Try:</span>
      {items.map((item) => (
        <button key={item} type="button" onClick={() => onPick(item)} className="chip">
          {item}
        </button>
      ))}
    </div>
  );
}
