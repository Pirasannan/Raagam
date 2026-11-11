'use client';

import { useEffect, useRef, useState } from 'react';
import { CheckCircle2, X } from 'lucide-react';
import type { IdentifyRequest, RagaProfile } from '@/types/raga';
import { Button } from '@/components/ui/Button';

interface ReportMistakeProps {
  open: boolean;
  onClose: () => void;
  query: IdentifyRequest;
  raga: RagaProfile;
}

/** Lets a visitor send a correction for the musicologist to review. */
export function ReportMistake({ open, onClose, query, raga }: ReportMistakeProps) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [correctRaga, setCorrectRaga] = useState('');
  const [correctSwaras, setCorrectSwaras] = useState('');
  const [notes, setNotes] = useState('');
  const [name, setName] = useState('');
  const [state, setState] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');

  useEffect(() => {
    const node = dialog.current;
    if (!node) return;
    if (open && !node.open) {
      setState('idle');
      node.showModal();
    }
    if (!open && node.open) node.close();
  }, [open]);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!correctRaga.trim()) return;
    setState('sending');
    try {
      const res = await fetch('/api/report-mistake', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query,
          aiSuggestedRaga: raga.name,
          userCorrection: { correctRaga: correctRaga.trim(), correctSwaras: correctSwaras.trim(), notesOrExplanation: notes.trim(), reporterName: name.trim() },
        }),
      });
      if (!res.ok) throw new Error();
      setState('sent');
      setCorrectRaga('');
      setCorrectSwaras('');
      setNotes('');
    } catch {
      setState('error');
    }
  };

  return (
    <dialog
      ref={dialog}
      onClose={onClose}
      onClick={(e) => e.target === dialog.current && onClose()}
      className="m-auto w-[min(32rem,calc(100vw-2rem))] rounded-4xl bg-surface p-0 text-ink shadow-lift backdrop:bg-deep/60 backdrop:backdrop-blur-sm"
    >
      <div className="p-6 sm:p-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl tracking-display">Suggest a correction</h2>
            <p className="mt-1 text-sm text-muted">
              We showed <span className="text-ink">{raga.name}</span>. Tell us what it should be and we will review it.
            </p>
          </div>
          <button type="button" onClick={onClose} className="rounded-xl p-2 text-muted hover:bg-canvas hover:text-ink" aria-label="Close">
            <X className="h-5 w-5" />
          </button>
        </div>

        {state === 'sent' ? (
          <div className="mt-8 flex flex-col items-center gap-3 rounded-3xl bg-canvas p-8 text-center">
            <CheckCircle2 className="h-8 w-8 text-coral" />
            <p className="text-lg tracking-[-0.02em]">Thank you. Your note is with us.</p>
            <Button variant="light" size="sm" onClick={onClose}>
              Close
            </Button>
          </div>
        ) : (
          <form onSubmit={submit} className="mt-6 space-y-4">
            <div>
              <label htmlFor="rm-raga" className="field-label">
                Correct raga
              </label>
              <input id="rm-raga" required value={correctRaga} onChange={(e) => setCorrectRaga(e.target.value)} className="field" placeholder="e.g. Simhendramadhyamam" maxLength={120} />
            </div>
            <div>
              <label htmlFor="rm-swaras" className="field-label">
                Swaras (optional)
              </label>
              <input id="rm-swaras" value={correctSwaras} onChange={(e) => setCorrectSwaras(e.target.value)} className="field font-mono" placeholder="S R2 G2 M2 P D1 N3" maxLength={200} />
            </div>
            <div>
              <label htmlFor="rm-notes" className="field-label">
                Why (optional)
              </label>
              <textarea id="rm-notes" rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} className="field resize-none" placeholder="A source, or the phrase that gives it away" maxLength={1000} />
            </div>
            <div>
              <label htmlFor="rm-name" className="field-label">
                Your name (optional)
              </label>
              <input id="rm-name" value={name} onChange={(e) => setName(e.target.value)} className="field" maxLength={80} />
            </div>
            {state === 'error' && <p className="text-sm text-coral-dark">That did not go through. Please try again.</p>}
            <Button type="submit" variant="coral" disabled={state === 'sending' || !correctRaga.trim()} className="w-full justify-between">
              {state === 'sending' ? 'Sending…' : 'Send correction'}
            </Button>
          </form>
        )}
      </div>
    </dialog>
  );
}
