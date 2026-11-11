'use client';

import { Fragment, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, Download, Search } from 'lucide-react';
import { JANYA_RAGAS } from '@/lib/music/catalog';
import { CHAKRAS, MELAKARTAS, swaraSetOf } from '@/lib/music/melakarta';
import { useScalePlayer } from '@/hooks/useScalePlayer';
import { ScaleNotes } from '@/components/music/ScaleNotes';
import { finderLink } from '@/lib/finderLink';
import { cn } from '@/lib/cn';
import type { JanyaRaga } from '@/types/raga';

type Filter = 'all' | 'audava' | 'shadava' | 'sampurna' | 'vakra' | 'bhashanga' | 'hindustani';
type Sort = 'melakarta' | 'name' | 'type';

const FILTERS: Array<{ value: Filter; label: string; test: (j: JanyaRaga) => boolean }> = [
  { value: 'all', label: 'All', test: () => true },
  { value: 'audava', label: 'Audava (5)', test: (j) => j.scaleType.includes('Audava') },
  { value: 'shadava', label: 'Shadava (6)', test: (j) => j.scaleType.includes('Shadava') },
  { value: 'sampurna', label: 'Sampurna (7)', test: (j) => j.scaleType.includes('Sampurna') },
  { value: 'vakra', label: 'Vakra', test: (j) => j.isVakra },
  { value: 'bhashanga', label: 'Bhashanga', test: (j) => j.isBhashanga },
  { value: 'hindustani', label: 'Hindustani link', test: (j) => Boolean(j.extraNote?.toLowerCase().includes('hindustani')) },
];

const PAGE_SIZES = [25, 50, 100];

function download(filename: string, content: string, type: string) {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const a = Object.assign(document.createElement('a'), { href: url, download: filename });
  a.click();
  URL.revokeObjectURL(url);
}

const csvCell = (v: unknown) => `"${String(v ?? '').replace(/"/g, '""')}"`;

/** Searchable, filterable list of the 908 janya ragas with playable scales. */
export function JanyaTable() {
  const player = useScalePlayer();
  const [query, setQuery] = useState('');
  const [chakra, setChakra] = useState<number | null>(null);
  const [melakarta, setMelakarta] = useState<number | null>(null);
  const [filter, setFilter] = useState<Filter>('all');
  const [sort, setSort] = useState<Sort>('melakarta');
  const [pageSize, setPageSize] = useState(25);
  const [page, setPage] = useState(1);

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    const test = FILTERS.find((f) => f.value === filter)!.test;
    const list = JANYA_RAGAS.filter(
      (j) =>
        (chakra === null || j.chakraNo === chakra) &&
        (melakarta === null || j.parentMelakartaNo === melakarta) &&
        test(j) &&
        (!q ||
          j.name.toLowerCase().includes(q) ||
          j.originalName.toLowerCase().includes(q) ||
          j.parentMelakartaName.toLowerCase().includes(q) ||
          String(j.parentMelakartaNo) === q.replace('#', '') ||
          j.arohana.toLowerCase().includes(q) ||
          j.avarohana.toLowerCase().includes(q)),
    );
    return list.sort((a, b) =>
      sort === 'name'
        ? a.name.localeCompare(b.name)
        : sort === 'type'
          ? a.scaleType.localeCompare(b.scaleType) || a.name.localeCompare(b.name)
          : a.parentMelakartaNo - b.parentMelakartaNo || a.name.localeCompare(b.name),
    );
  }, [query, chakra, melakarta, filter, sort]);

  useEffect(() => setPage(1), [query, chakra, melakarta, filter, sort, pageSize]);

  const pages = Math.max(1, Math.ceil(rows.length / pageSize));
  const current = Math.min(page, pages);
  const visible = rows.slice((current - 1) * pageSize, current * pageSize);
  const melakartaOptions = chakra === null ? MELAKARTAS : MELAKARTAS.filter((m) => m.chakra.number === chakra);

  const exportCsv = () => {
    const header = ['Name', 'Original name', 'Melakarta no', 'Melakarta', 'Chakra', 'Arohana', 'Avarohana', 'Type', 'Vakra', 'Bhashanga', 'Anya swaras', 'Note'];
    const lines = rows.map((r) =>
      [r.name, r.originalName, r.parentMelakartaNo, r.parentMelakartaName, r.chakraName, r.arohana, r.avarohana, r.scaleType, r.isVakra ? 'Yes' : 'No', r.isBhashanga ? 'Yes' : 'No', r.anyaSwaras, r.extraNote]
        .map(csvCell)
        .join(','),
    );
    download('janya_ragas.csv', [header.map(csvCell).join(','), ...lines].join('\n'), 'text/csv;charset=utf-8');
  };

  return (
    <div>
      <div className="card rounded-3xl p-4 sm:p-5">
        <div className="grid gap-3 lg:grid-cols-[1.4fr_1fr_1fr_auto]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-faint" />
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Raga, parent or notes (e.g. R2 G3)" className="field pl-10" aria-label="Search janya ragas" />
          </div>
          <select
            value={chakra ?? ''}
            onChange={(e) => {
              setChakra(e.target.value ? Number(e.target.value) : null);
              setMelakarta(null);
            }}
            className="field"
            aria-label="Chakra"
          >
            <option value="">All chakras</option>
            {CHAKRAS.map((c) => (
              <option key={c.number} value={c.number}>
                {c.number}. {c.name} ({c.meaning})
              </option>
            ))}
          </select>
          <select value={melakarta ?? ''} onChange={(e) => setMelakarta(e.target.value ? Number(e.target.value) : null)} className="field" aria-label="Parent melakarta">
            <option value="">All melakartas</option>
            {melakartaOptions.map((m) => (
              <option key={m.number} value={m.number}>
                {m.number}. {m.name}
              </option>
            ))}
          </select>
          <select value={sort} onChange={(e) => setSort(e.target.value as Sort)} className="field" aria-label="Sort by">
            <option value="melakarta">By melakarta</option>
            <option value="name">By name</option>
            <option value="type">By type</option>
          </select>
        </div>
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
          <div className="no-scrollbar -mx-1 flex gap-1.5 overflow-x-auto px-1">
            {FILTERS.map((f) => (
              <button
                key={f.value}
                type="button"
                onClick={() => setFilter(f.value)}
                aria-pressed={filter === f.value}
                className={cn('chip shrink-0 py-1 text-[0.8125rem]', filter === f.value && 'border-espresso bg-espresso text-surface hover:text-surface')}
              >
                {f.label}
              </button>
            ))}
          </div>
          <button type="button" onClick={exportCsv} className="flex items-center gap-2 text-sm text-muted hover:text-ink">
            <Download className="h-4 w-4" /> Export {rows.length} as CSV
          </button>
        </div>
      </div>

      <p className="mt-6 text-sm text-muted" role="status">
        {rows.length === JANYA_RAGAS.length ? `All ${rows.length} janya ragas` : `${rows.length} of ${JANYA_RAGAS.length} ragas`}
      </p>

      {rows.length === 0 ? (
        <p className="py-20 text-center text-muted">No raga matches these filters.</p>
      ) : (
        <ul className="mt-3 divide-y divide-ink/[0.08] rounded-3xl border border-ink/[0.06] bg-surface">
          {visible.map((raga, i) => {
            const prev = visible[i - 1];
            const showGroup = sort === 'melakarta' && (!prev || prev.parentMelakartaNo !== raga.parentMelakartaNo);
            return (
              <Fragment key={raga.id}>
                {showGroup && (
                  <li className="bg-canvas/60 px-5 py-2.5 text-[0.6875rem] font-medium uppercase tracking-eyebrow text-muted first:rounded-t-3xl">
                    Melakarta {raga.parentMelakartaNo} · {raga.parentMelakartaName}
                  </li>
                )}
                <li className="grid gap-4 px-5 py-5 lg:grid-cols-[minmax(0,15rem)_minmax(0,1fr)_auto] lg:items-center">
                  <div className="min-w-0">
                    <p className="text-lg tracking-[-0.02em] text-ink">{raga.name}</p>
                    <p className="text-sm text-muted">
                      {raga.originalName !== raga.name && <span className="font-serif italic">{raga.originalName} · </span>}
                      from {raga.parentMelakartaName} ({raga.parentMelakartaNo})
                    </p>
                    <div className="mt-2 flex flex-wrap gap-1">
                      <Tag>{raga.scaleType}</Tag>
                      {raga.isVakra && <Tag>Vakra</Tag>}
                      {raga.isBhashanga && <Tag tone="coral">Bhashanga{raga.anyaSwaras ? ` · ${raga.anyaSwaras}` : ''}</Tag>}
                    </div>
                    {raga.extraNote && <p className="mt-2 text-xs text-faint">{raga.extraNote}</p>}
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <ScaleNotes id={`${raga.id}-aro`} label="Arohana" scale={raga.arohana} player={player} size="sm" />
                    <ScaleNotes id={`${raga.id}-ava`} label="Avarohana" scale={raga.avarohana} player={player} size="sm" />
                  </div>
                  <Link href={finderLink(swaraSetOf(raga.arohana, raga.avarohana))} className="link-underline justify-self-start text-sm text-muted hover:text-ink lg:justify-self-end">
                    Open in finder
                  </Link>
                </li>
              </Fragment>
            );
          })}
        </ul>
      )}

      {rows.length > 0 && (
        <nav className="mt-6 flex flex-wrap items-center justify-between gap-4" aria-label="Pagination">
          <label className="flex items-center gap-2 text-sm text-muted">
            Show
            <select value={pageSize} onChange={(e) => setPageSize(Number(e.target.value))} className="field w-auto py-1.5">
              {PAGE_SIZES.map((n) => (
                <option key={n}>{n}</option>
              ))}
            </select>
          </label>
          <div className="flex items-center gap-2">
            <button type="button" onClick={() => setPage(current - 1)} disabled={current === 1} className="rounded-xl border border-ink/10 bg-surface p-2 disabled:opacity-40" aria-label="Previous page">
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="min-w-24 text-center text-sm tabular-nums text-muted">
              Page {current} of {pages}
            </span>
            <button type="button" onClick={() => setPage(current + 1)} disabled={current === pages} className="rounded-xl border border-ink/10 bg-surface p-2 disabled:opacity-40" aria-label="Next page">
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </nav>
      )}
    </div>
  );
}

function Tag({ children, tone = 'plain' }: { children: React.ReactNode; tone?: 'plain' | 'coral' }) {
  return <span className={cn('rounded-full px-2 py-0.5 text-xs', tone === 'coral' ? 'bg-coral-soft text-coral-dark' : 'bg-canvas text-muted')}>{children}</span>;
}
