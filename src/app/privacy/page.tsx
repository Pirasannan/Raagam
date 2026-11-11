import type { Metadata } from 'next';
import { PageHeader } from '@/components/layout/PageHeader';
import { SITE } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Privacy policy',
  description: 'How Raagam handles your data. No accounts, no tracking, no advertising.',
};

const SECTIONS: Array<{ title: string; body: React.ReactNode }> = [
  {
    title: 'The short version',
    body: (
      <p>
        Raagam has no accounts, no sign-in, no advertising and no analytics. We do not sell or share personal data. Audio is generated on your
        device and nothing is recorded from your microphone.
      </p>
    ),
  },
  {
    title: 'What we do not collect',
    body: (
      <ul className="list-disc space-y-2 pl-5">
        <li>No registration, names, email addresses or passwords.</li>
        <li>No location, contacts, camera, microphone or files.</li>
        <li>No cookies of our own and no cross-site tracking.</li>
      </ul>
    ),
  },
  {
    title: 'Searches',
    body: (
      <p>
        When you identify a raga, your swaras, song title or notes are sent to our server to be matched. Song titles that are not in our
        archive may be looked up on the Malayalam Song Info Database. If the site owner has enabled AI identification, the query is also sent to
        the configured provider (Google Gemini or OpenAI). Queries are not stored with any information about you.
      </p>
    ),
  },
  {
    title: 'Corrections you send',
    body: (
      <p>
        If you suggest a correction, we keep what you type in that form, including your name only if you choose to give it, so the
        correction can be reviewed.
      </p>
    ),
  },
  {
    title: 'Embedded players',
    body: (
      <p>
        Raga radio uses YouTube&apos;s privacy-enhanced player and the New songs page uses Spotify&apos;s player. They load only on the pages
        that show them, and those services may receive your IP address and set their own cookies under their own privacy policies.
      </p>
    ),
  },
  {
    title: 'Children',
    body: <p>Raagam is an educational reference suitable for all ages. We do not knowingly collect personal information from anyone.</p>,
  },
  {
    title: 'Contact',
    body: (
      <p>
        Questions about this policy can be raised on{' '}
        <a href={`${SITE.repo}/issues`} className="text-ink underline decoration-coral underline-offset-4">
          GitHub
        </a>
        .
      </p>
    ),
  },
];

export default function PrivacyPage() {
  return (
    <>
      <PageHeader eyebrow="Privacy" title="Privacy policy" description="Effective 8 November 2026 · Raagam for web, Android and iOS (com.raagam.app)" />
      <div className="container-page pb-24">
        <div className="card mx-auto max-w-3xl divide-y divide-ink/[0.08] px-6 sm:px-10">
          {SECTIONS.map((section, i) => (
            <section key={section.title} className="grid gap-3 py-8 sm:grid-cols-[3rem_1fr]">
              <span className="font-mono text-sm text-coral">{String(i + 1).padStart(2, '0')}</span>
              <div>
                <h2 className="text-2xl tracking-display">{section.title}</h2>
                <div className="mt-3 leading-relaxed text-muted">{section.body}</div>
              </div>
            </section>
          ))}
        </div>
      </div>
    </>
  );
}
