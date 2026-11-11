import type { Metadata } from 'next';
import { PageHeader } from '@/components/layout/PageHeader';
import { PracticeRoom, type PracticeTool } from '@/components/practice/PracticeRoom';

export const metadata: Metadata = {
  title: 'Practice room',
  description: 'A tanpura drone in any shruti, comparisons of easily confused ragas, and an instant swara-to-raga lookup.',
};

const TOOLS: PracticeTool[] = ['tanpura', 'pairs', 'lookup'];

export default async function PracticePage({ searchParams }: { searchParams: Promise<{ tool?: string }> }) {
  const { tool } = await searchParams;
  return (
    <>
      <PageHeader
        eyebrow="Practice room"
        title="A drone, an ear,"
        accent="and a little patience."
        description="Tune up with a tanpura in any shruti, learn to hear the difference between ragas that look alike, and look up ragas from the notes you catch."
      />
      <div className="container-page pb-24">
        <PracticeRoom initialTool={TOOLS.includes(tool as PracticeTool) ? (tool as PracticeTool) : 'tanpura'} />
      </div>
    </>
  );
}
