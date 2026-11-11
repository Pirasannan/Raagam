'use client';

import { useState } from 'react';
import { ShieldCheck, Sparkles } from 'lucide-react';
import type { IdentifyResponse, IdentifySource } from '@/types/raga';
import { useScalePlayer } from '@/hooks/useScalePlayer';
import { ScaleNotes } from '@/components/music/ScaleNotes';
import { Segmented } from '@/components/ui/Segmented';
import { cn } from '@/lib/cn';
import { ReportMistake } from './ReportMistake';

const SOURCE_LABEL: Record<IdentifySource, string> = {
  song_archive: 'From the song archive',
  curated: 'From curated song notes',
  scale_match: 'Matched by scale',
  admin_rule: 'Verified correction',
  ai: 'Suggested by AI',
};

function Fact({ label, value }: { label: string; value?: string }) {
  if (!value) return null;
  return (
    <div className="rounded-2xl bg-canvas/70 p-4">
      <dt className="text-[0.6875rem] font-medium uppercase tracking-eyebrow text-faint">{label}</dt>
      <dd className="mt-1.5 text-[0.95rem] leading-snug text-ink">{value}</dd>
    </div>
  );
}

export function RagaResult({ result }: { result: IdentifyResponse }) {
  const player = useScalePlayer();
  const ragas = result.isMultiRaga && result.ragas && result.ragas.length > 1 ? result.ragas : [result.raga];
  const [index, setIndex] = useState(0);
  const [reporting, setReporting] = useState(false);
  const raga = ragas[Math.min(index, ragas.length - 1)];
  const song = result.matchedSong;
  const exactAlternatives = result.alternatives?.filter((a) => a.exact) ?? [];
  const closeAlternatives = result.alternatives?.filter((a) => !a.exact) ?? [];
  const songs = raga.famousSongs?.filter((s) => s.title) ?? [];

  return (
    <article className="card overflow-hidden animate-fade-up" aria-live="polite">
      <header className="relative overflow-hidden bg-espresso px-6 pb-7 pt-6 text-surface sm:px-10 sm:pb-10 sm:pt-9">
        <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-coral/20 blur-3xl" aria-hidden />
        <div className="relative flex flex-wrap items-center gap-2 text-xs">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-surface/10 px-3 py-1">
            {result.source === 'ai' ? <Sparkles className="h-3 w-3 text-coral" /> : <ShieldCheck className="h-3 w-3 text-coral" />}
            {SOURCE_LABEL[result.source]}
            {result.aiProvider && ` · ${result.aiProvider === 'gemini' ? 'Gemini' : 'OpenAI'}`}
          </span>
          <span className="rounded-full bg-surface/10 px-3 py-1">{result.confidence}</span>
          {raga.tradition && <span className="rounded-full bg-surface/10 px-3 py-1">{raga.tradition === 'Both' ? 'Carnatic & Hindustani' : raga.tradition}</span>}
        </div>

        <div className="relative mt-5 flex flex-wrap items-end justify-between gap-6">
          <div className="min-w-0">
            <h2 className="display break-words text-[2.6rem] sm:text-6xl">{raga.name}</h2>
            {raga.alternateNames && raga.alternateNames.length > 0 && (
              <p className="mt-2 text-surface/60">
                Also known as <span className="font-serif text-lg italic text-surface/85">{raga.alternateNames.join(', ')}</span>
              </p>
            )}
          </div>
          {(raga.melakartaNumber || raga.thaat) && (
            <dl className="flex gap-2">
              {raga.melakartaNumber && (
                <div className="rounded-2xl bg-surface/10 px-4 py-3 text-center">
                  <dt className="text-[0.625rem] uppercase tracking-eyebrow text-surface/55">Melakarta</dt>
                  <dd className="text-2xl tracking-display">{raga.melakartaNumber}</dd>
                </div>
              )}
              {raga.thaat && (
                <div className="rounded-2xl bg-surface/10 px-4 py-3 text-center">
                  <dt className="text-[0.625rem] uppercase tracking-eyebrow text-surface/55">Thaat</dt>
                  <dd className="text-lg tracking-[-0.02em]">{raga.thaat}</dd>
                </div>
              )}
            </dl>
          )}
        </div>

        {song && (
          <div className="relative mt-6 rounded-3xl border border-surface/10 bg-surface/5 p-4 sm:p-5">
            <p className="text-[0.6875rem] uppercase tracking-eyebrow text-surface/55">Song</p>
            <p className="mt-1 text-xl tracking-[-0.02em]">{song.title}</p>
            <dl className="mt-3 grid gap-x-6 gap-y-1 text-sm text-surface/70 sm:grid-cols-2">
              {song.filmOrAlbum && <div><dt className="inline text-surface/45">Film / album · </dt><dd className="inline">{song.filmOrAlbum}</dd></div>}
              {song.composer && <div><dt className="inline text-surface/45">Music · </dt><dd className="inline">{song.composer}</dd></div>}
              {song.singers && <div><dt className="inline text-surface/45">Singers · </dt><dd className="inline">{song.singers}</dd></div>}
              {song.lyricist && <div><dt className="inline text-surface/45">Lyrics · </dt><dd className="inline">{song.lyricist}</dd></div>}
              {song.language && <div><dt className="inline text-surface/45">Language · </dt><dd className="inline">{song.language}</dd></div>}
            </dl>
          </div>
        )}

        {ragas.length > 1 && (
          <div className="relative mt-6">
            <p className="mb-2 text-sm text-surface/60">This song moves through {ragas.length} ragas (ragamalika):</p>
            <Segmented
              tone="dark"
              label="Ragas in this song"
              value={String(index)}
              onChange={(v) => setIndex(Number(v))}
              options={ragas.map((r, i) => ({ value: String(i), label: `${i + 1}. ${r.name}` }))}
            />
          </div>
        )}

        {result.appliedAdminRule && (
          <p className="relative mt-5 flex items-start gap-2 text-sm text-surface/70">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-coral" />
            <span>
              <span className="text-surface">{result.appliedAdminRule.title}.</span> {result.appliedAdminRule.reason}
            </span>
          </p>
        )}
      </header>

      <div className="space-y-8 px-6 py-7 sm:px-10 sm:py-10">
        {(raga.arohana || raga.avarohana) && (
          <div className="grid gap-6 md:grid-cols-2">
            <ScaleNotes id={`${raga.name}-aro`} label="Arohana · ascent" scale={raga.arohana} player={player} />
            <ScaleNotes id={`${raga.name}-ava`} label="Avarohana · descent" scale={raga.avarohana} player={player} />
            {raga.pakadOrSignature && (
              <ScaleNotes id={`${raga.name}-pakad`} label="Signature phrase" scale={raga.pakadOrSignature} player={player} className="md:col-span-2" />
            )}
          </div>
        )}

        <dl className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
          <Fact label="Parent scale" value={raga.parentRaga} />
          <Fact label="Mood" value={raga.rasaOrMood} />
          <Fact label="Time of day" value={raga.timeOfDay} />
          <Fact label="Vadi · Samvadi" value={raga.vadi ? `${raga.vadi}${raga.samvadi ? ` · ${raga.samvadi}` : ''}` : undefined} />
        </dl>

        {raga.explanation && <p className="max-w-3xl text-[1.05rem] leading-relaxed text-muted">{raga.explanation}</p>}
        {result.source === 'ai' && (
          <p className="text-sm text-faint">AI answers can be wrong, especially for film songs. Check the scale by ear before relying on it.</p>
        )}

        {exactAlternatives.length > 0 && (
          <Alternatives title="Other ragas with exactly these swaras" items={exactAlternatives} player={player} />
        )}
        {closeAlternatives.length > 0 && <Alternatives title="Close matches" items={closeAlternatives} player={player} />}

        {songs.length > 0 && (
          <section>
            <h3 className="text-[0.6875rem] font-medium uppercase tracking-eyebrow text-faint">Songs in {raga.name}</h3>
            <ul className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {songs.map((s, i) => (
                <li key={`${s.title}-${i}`} className="rounded-2xl border border-ink/[0.06] p-4">
                  <p className="truncate text-ink">{s.title}</p>
                  <p className="mt-0.5 truncate text-sm text-muted">{s.composerOrFilm || s.type}</p>
                </li>
              ))}
            </ul>
          </section>
        )}

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-ink/[0.08] pt-6">
          <p className="text-sm text-muted">Does this sound wrong to you?</p>
          <button type="button" onClick={() => setReporting(true)} className="link-underline text-sm text-ink">
            Suggest a correction
          </button>
        </div>
      </div>

      <ReportMistake open={reporting} onClose={() => setReporting(false)} query={result.rawQuery} raga={raga} />
    </article>
  );
}

function Alternatives({ title, items, player }: { title: string; items: NonNullable<IdentifyResponse['alternatives']>; player: ReturnType<typeof useScalePlayer> }) {
  return (
    <section>
      <h3 className="text-[0.6875rem] font-medium uppercase tracking-eyebrow text-faint">{title}</h3>
      <ul className="mt-3 grid gap-2 md:grid-cols-2">
        {items.map((alt) => (
          <li key={`${alt.kind}-${alt.name}`} className={cn('rounded-2xl border border-ink/[0.06] p-4')}>
            <p className="text-ink">
              {alt.name}{' '}
              <span className="text-sm text-muted">
                · {alt.kind === 'melakarta' ? `melakarta ${alt.melakartaNumber}` : `from ${alt.melakartaName}`}
              </span>
            </p>
            <ScaleNotes id={`alt-${alt.name}`} scale={`${alt.arohana}`} player={player} size="sm" className="mt-3" />
          </li>
        ))}
      </ul>
    </section>
  );
}
