'use client';

import { useCallback, useEffect, useState } from 'react';
import { LogOut, Pencil, Plus, Trash2 } from 'lucide-react';
import type { AdminRule, IdentifyMiss, IdentifyMode, IdentifyResponse, MistakeReport } from '@/types/raga';
import { Button } from '@/components/ui/Button';
import { Segmented } from '@/components/ui/Segmented';
import { RagaResult } from '@/components/finder/RagaResult';
import { cn } from '@/lib/cn';

type Tab = 'rules' | 'reports' | 'playground' | 'backup';
type Draft = Partial<AdminRule> & { swaraText?: string; keywordText?: string };

const KEY_STORAGE = 'raagam_admin_key';

export function AdminConsole() {
  const [key, setKey] = useState('');
  const [authed, setAuthed] = useState(false);
  const [authError, setAuthError] = useState('');
  const [tab, setTab] = useState<Tab>('rules');
  const [rules, setRules] = useState<AdminRule[]>([]);
  const [reports, setReports] = useState<MistakeReport[]>([]);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [toast, setToast] = useState('');

  const notify = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(''), 3500);
  };

  const api = useCallback(
    async (path: string, init: RequestInit = {}, adminKey = key) => {
      const res = await fetch(path, { ...init, headers: { 'Content-Type': 'application/json', 'x-admin-key': adminKey, ...init.headers } });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
      return data;
    },
    [key],
  );

  const load = useCallback(
    async (adminKey = key) => {
      const [r, m] = await Promise.all([api('/api/admin/rules', {}, adminKey), api('/api/admin/reports', {}, adminKey)]);
      setRules(r.rules ?? []);
      setReports(m.reports ?? []);
    },
    [api, key],
  );

  const signIn = useCallback(
    async (candidate: string) => {
      setAuthError('');
      const res = await fetch('/api/admin/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ secretKey: candidate }),
      });
      if (!res.ok) {
        sessionStorage.removeItem(KEY_STORAGE);
        setAuthError('That key is not valid, or the console is disabled on this deployment.');
        return;
      }
      sessionStorage.setItem(KEY_STORAGE, candidate);
      setKey(candidate);
      setAuthed(true);
      await load(candidate).catch((e) => notify(e.message));
    },
    [load],
  );

  useEffect(() => {
    const saved = sessionStorage.getItem(KEY_STORAGE);
    if (saved) void signIn(saved);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- run once on mount
  }, []);

  const signOut = () => {
    sessionStorage.removeItem(KEY_STORAGE);
    setAuthed(false);
    setKey('');
  };

  const saveDraft = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft) return;
    const { swaraText, keywordText, ...rule } = draft;
    try {
      await api('/api/admin/rules', {
        method: 'POST',
        body: JSON.stringify({
          ...rule,
          swaraPattern: (swaraText ?? '').split(/[\s,]+/).filter(Boolean),
          triggerKeywords: (keywordText ?? '').split(',').map((k) => k.trim()).filter(Boolean),
        }),
      });
      setDraft(null);
      notify(`Saved “${rule.title}”.`);
      await load();
    } catch (err) {
      notify(err instanceof Error ? err.message : 'Could not save the rule.');
    }
  };

  const removeRule = async (rule: AdminRule) => {
    if (!window.confirm(`Delete “${rule.title}”?`)) return;
    await api(`/api/admin/rules?id=${encodeURIComponent(rule.id)}`, { method: 'DELETE' }).catch((e) => notify(e.message));
    await load();
  };

  const resolveReport = async (report: MistakeReport, approve: boolean) => {
    const swaras = (report.userCorrection.correctSwaras ?? '').split(/[\s,]+/).filter(Boolean);
    const body = approve
      ? {
          reportId: report.id,
          action: 'approve_as_rule',
          convertToRule: {
            title: `Correction: ${report.userCorrection.correctRaga}`,
            patternType: swaras.length ? 'swaras' : 'correction',
            swaraPattern: swaras,
            triggerKeywords: [report.query?.songQuery].filter(Boolean),
            correctRaga: report.userCorrection.correctRaga,
            tradition: 'Both',
            ruleInstruction: `Identify this as ${report.userCorrection.correctRaga}, not ${report.aiSuggestedRaga}. ${report.userCorrection.notesOrExplanation ?? ''}`.trim(),
          },
        }
      : { reportId: report.id, action: 'dismiss' };
    try {
      await api('/api/admin/reports', { method: 'POST', body: JSON.stringify(body) });
      notify(approve ? 'Report turned into a rule.' : 'Report dismissed.');
      await load();
    } catch (err) {
      notify(err instanceof Error ? err.message : 'Could not update the report.');
    }
  };

  if (!authed) {
    return (
      <form
        onSubmit={(e) => {
          e.preventDefault();
          void signIn(key);
        }}
        className="card mx-auto max-w-md p-8"
      >
        <h2 className="text-2xl tracking-display">Sign in</h2>
        <p className="mt-2 text-sm text-muted">Enter the ADMIN_SECRET_KEY configured for this deployment.</p>
        <label htmlFor="admin-key" className="field-label mt-6">
          Admin key
        </label>
        <input id="admin-key" type="password" value={key} onChange={(e) => setKey(e.target.value)} className="field" autoComplete="current-password" />
        {authError && <p className="mt-3 text-sm text-coral-dark">{authError}</p>}
        <Button type="submit" disabled={!key} className="mt-6 w-full justify-between">
          Open console
        </Button>
      </form>
    );
  }

  const pending = reports.filter((r) => r.status === 'pending');

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Segmented
          label="Console section"
          value={tab}
          onChange={setTab}
          options={[
            { value: 'rules', label: 'Rules', count: rules.length },
            { value: 'reports', label: 'Reports', count: pending.length },
            { value: 'playground', label: 'Test' },
            { value: 'backup', label: 'Backup' },
          ]}
        />
        <button type="button" onClick={signOut} className="flex items-center gap-2 text-sm text-muted hover:text-ink">
          <LogOut className="h-4 w-4" /> Sign out
        </button>
      </div>

      <p className="mt-4 text-sm text-faint">Rules and reports are stored on the server&apos;s disk, which serverless hosts reset on redeploy. Export a backup regularly.</p>

      <div className="mt-8">
        {tab === 'rules' &&
          (draft ? (
            <RuleForm draft={draft} setDraft={setDraft} onSubmit={saveDraft} />
          ) : (
            <div>
              <Button icon={Plus} onClick={() => setDraft({ patternType: 'swaras', tradition: 'Both', severity: 'strict_override', active: true })}>
                New rule
              </Button>
              <ul className="mt-6 space-y-3">
                {rules.map((rule) => (
                  <li key={rule.id} className="card flex flex-col gap-4 rounded-3xl p-5 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <p className="text-lg tracking-[-0.02em]">
                        {rule.title} {!rule.active && <span className="text-sm text-faint">(inactive)</span>}
                      </p>
                      <p className="mt-1 text-sm text-muted">
                        → {rule.correctRaga} · {rule.patternType} · {rule.severity === 'strict_override' ? 'strict' : 'hint'}
                        {rule.swaraPattern?.length ? ` · ${rule.swaraPattern.join(' ')}` : ''}
                      </p>
                      <p className="mt-2 text-sm leading-relaxed text-ink/80">{rule.ruleInstruction}</p>
                    </div>
                    <div className="flex shrink-0 gap-1">
                      <button
                        type="button"
                        onClick={() => setDraft({ ...rule, swaraText: rule.swaraPattern?.join(' '), keywordText: rule.triggerKeywords?.join(', ') })}
                        className="rounded-xl p-2 text-muted hover:bg-canvas hover:text-ink"
                        aria-label={`Edit ${rule.title}`}
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button type="button" onClick={() => void removeRule(rule)} className="rounded-xl p-2 text-muted hover:bg-canvas hover:text-coral-dark" aria-label={`Delete ${rule.title}`}>
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </li>
                ))}
                {rules.length === 0 && <li className="py-12 text-center text-muted">No rules yet.</li>}
              </ul>
            </div>
          ))}

        {tab === 'reports' && (
          <ul className="space-y-3">
            {reports.map((r) => (
              <li key={r.id} className="card rounded-3xl p-5">
                <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-muted">
                  <span>{new Date(r.timestamp).toLocaleString()} · {r.userCorrection.reporterName}</span>
                  <span className={cn('rounded-full px-2.5 py-0.5 text-xs', r.status === 'pending' ? 'bg-coral-soft text-coral-dark' : 'bg-canvas')}>{r.status}</span>
                </div>
                <p className="mt-3 text-lg tracking-[-0.02em]">
                  {r.aiSuggestedRaga} <span className="text-faint">→</span> {r.userCorrection.correctRaga}
                </p>
                <p className="mt-1 text-sm text-muted">
                  Query: {r.query?.songQuery ?? r.query?.description ?? r.query?.swaras?.join(' ') ?? '—'}
                  {r.userCorrection.correctSwaras && ` · Swaras: ${r.userCorrection.correctSwaras}`}
                </p>
                {r.userCorrection.notesOrExplanation && <p className="mt-2 text-sm text-ink/80">{r.userCorrection.notesOrExplanation}</p>}
                {r.status === 'pending' && (
                  <div className="mt-4 flex gap-2">
                    <Button size="sm" onClick={() => void resolveReport(r, true)}>
                      Approve as rule
                    </Button>
                    <button type="button" onClick={() => void resolveReport(r, false)} className="rounded-xl px-3 text-sm text-muted hover:bg-canvas">
                      Dismiss
                    </button>
                  </div>
                )}
              </li>
            ))}
            {reports.length === 0 && <li className="py-12 text-center text-muted">No reports.</li>}
          </ul>
        )}

        {tab === 'playground' && <Playground />}

        {tab === 'backup' && (
          <Backup
            rules={rules}
            onImport={async (imported) => {
              try {
                const res = await api('/api/admin/rules', { method: 'POST', body: JSON.stringify({ bulk: true, rules: imported }) });
                notify(`Imported ${res.imported} rules.`);
                await load();
              } catch (err) {
                notify(err instanceof Error ? err.message : 'Import failed.');
              }
            }}
          />
        )}
      </div>

      {toast && (
        <div role="status" className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-2xl bg-espresso px-5 py-3 text-sm text-surface shadow-lift animate-fade-up">
          {toast}
        </div>
      )}
    </div>
  );
}

function RuleForm({ draft, setDraft, onSubmit }: { draft: Draft; setDraft: (d: Draft | null) => void; onSubmit: (e: React.FormEvent) => void }) {
  const set = (patch: Partial<Draft>) => setDraft({ ...draft, ...patch });
  return (
    <form onSubmit={onSubmit} className="card grid gap-5 p-6 sm:grid-cols-2 sm:p-8">
      <div className="sm:col-span-2">
        <label htmlFor="r-title" className="field-label">Title</label>
        <input id="r-title" required value={draft.title ?? ''} onChange={(e) => set({ title: e.target.value })} className="field" />
      </div>
      <div>
        <label htmlFor="r-raga" className="field-label">Correct raga</label>
        <input id="r-raga" required value={draft.correctRaga ?? ''} onChange={(e) => set({ correctRaga: e.target.value })} className="field" />
      </div>
      <div>
        <label htmlFor="r-type" className="field-label">Applies to</label>
        <select id="r-type" value={draft.patternType} onChange={(e) => set({ patternType: e.target.value as AdminRule['patternType'] })} className="field">
          <option value="swaras">Exact swaras</option>
          <option value="song">Song titles</option>
          <option value="phrase">Phrase</option>
          <option value="correction">General correction</option>
        </select>
      </div>
      <div>
        <label htmlFor="r-swaras" className="field-label">Swaras (for swara rules)</label>
        <input id="r-swaras" value={draft.swaraText ?? ''} onChange={(e) => set({ swaraText: e.target.value })} className="field font-mono" placeholder="S R2 G2 M2 P D1 N3" />
      </div>
      <div>
        <label htmlFor="r-keywords" className="field-label">Trigger keywords (comma separated)</label>
        <input id="r-keywords" value={draft.keywordText ?? ''} onChange={(e) => set({ keywordText: e.target.value })} className="field" />
      </div>
      <div>
        <label htmlFor="r-tradition" className="field-label">Tradition</label>
        <select id="r-tradition" value={draft.tradition} onChange={(e) => set({ tradition: e.target.value as AdminRule['tradition'] })} className="field">
          <option value="Both">Both</option>
          <option value="Carnatic">Carnatic</option>
          <option value="Hindustani">Hindustani</option>
        </select>
      </div>
      <div>
        <label htmlFor="r-severity" className="field-label">Strength</label>
        <select id="r-severity" value={draft.severity} onChange={(e) => set({ severity: e.target.value as AdminRule['severity'] })} className="field">
          <option value="strict_override">Strict — always applies</option>
          <option value="disambiguation_hint">Hint — guidance for AI</option>
        </select>
      </div>
      <div className="sm:col-span-2">
        <label htmlFor="r-instruction" className="field-label">Instruction</label>
        <textarea id="r-instruction" required rows={4} value={draft.ruleInstruction ?? ''} onChange={(e) => set({ ruleInstruction: e.target.value })} className="field resize-y" />
      </div>
      <label className="flex items-center gap-2 text-sm text-ink">
        <input type="checkbox" checked={draft.active !== false} onChange={(e) => set({ active: e.target.checked })} className="h-4 w-4 accent-coral" />
        Active
      </label>
      <div className="flex justify-end gap-2 sm:col-span-2">
        <button type="button" onClick={() => setDraft(null)} className="rounded-xl px-4 text-sm text-muted hover:bg-canvas">
          Cancel
        </button>
        <Button type="submit">Save rule</Button>
      </div>
    </form>
  );
}

function Playground() {
  const [mode, setMode] = useState<IdentifyMode>('swaras');
  const [query, setQuery] = useState('S R2 G3 P D2');
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<IdentifyResponse | null>(null);
  const [message, setMessage] = useState('');

  const run = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setResult(null);
    setMessage('');
    const body =
      mode === 'swaras'
        ? { mode, swaras: query.split(/[\s,]+/).filter(Boolean).map((s) => s.replace(/['’,]/g, '').toUpperCase()) }
        : mode === 'song'
          ? { mode, songQuery: query }
          : { mode, description: query };
    try {
      const res = await fetch('/api/identify-raga', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      const data = (await res.json()) as IdentifyResponse | IdentifyMiss | { error: string };
      if ('error' in data) setMessage(data.error);
      else if ('notFound' in data) setMessage(data.message);
      else setResult(data);
    } catch {
      setMessage('Request failed.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <form onSubmit={run} className="card flex flex-col gap-4 p-6 sm:flex-row sm:items-end">
        <div>
          <label htmlFor="pg-mode" className="field-label">Mode</label>
          <select id="pg-mode" value={mode} onChange={(e) => setMode(e.target.value as IdentifyMode)} className="field">
            <option value="swaras">Swaras</option>
            <option value="song">Song</option>
            <option value="description">Notes / description</option>
          </select>
        </div>
        <div className="flex-1">
          <label htmlFor="pg-query" className="field-label">Query</label>
          <input id="pg-query" value={query} onChange={(e) => setQuery(e.target.value)} className="field" />
        </div>
        <Button type="submit" disabled={busy || !query.trim()}>
          {busy ? 'Running…' : 'Run'}
        </Button>
      </form>
      {message && <p className="mt-4 text-muted">{message}</p>}
      {result && (
        <div className="mt-6">
          <RagaResult result={result} />
        </div>
      )}
    </div>
  );
}

function Backup({ rules, onImport }: { rules: AdminRule[]; onImport: (rules: unknown[]) => Promise<void> }) {
  const exportRules = () => {
    const url = URL.createObjectURL(new Blob([JSON.stringify(rules, null, 2)], { type: 'application/json' }));
    const a = Object.assign(document.createElement('a'), { href: url, download: `raagam-rules-${new Date().toISOString().slice(0, 10)}.json` });
    a.click();
    URL.revokeObjectURL(url);
  };

  const importRules = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    try {
      const parsed = JSON.parse(await file.text());
      if (!Array.isArray(parsed)) throw new Error();
      if (window.confirm(`Replace all ${rules.length} rules with the ${parsed.length} in this file?`)) await onImport(parsed);
    } catch {
      window.alert('That file is not a valid rules export.');
    }
  };

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div className="card p-6">
        <h3 className="text-xl tracking-[-0.02em]">Export</h3>
        <p className="mt-2 text-sm text-muted">Download all {rules.length} rules as JSON.</p>
        <Button onClick={exportRules} size="sm" className="mt-5">
          Download rules.json
        </Button>
      </div>
      <div className="card p-6">
        <h3 className="text-xl tracking-[-0.02em]">Import</h3>
        <p className="mt-2 text-sm text-muted">Replace the current rules with a previous export.</p>
        <label className="mt-5 inline-flex cursor-pointer items-center rounded-xl border border-ink/10 px-4 py-2 text-sm hover:border-ink/25">
          Choose file
          <input type="file" accept="application/json,.json" onChange={importRules} className="sr-only" />
        </label>
      </div>
    </div>
  );
}
