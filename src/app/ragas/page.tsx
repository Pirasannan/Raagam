import type { Metadata } from 'next';
import { PageHeader } from '@/components/layout/PageHeader';
import { RagaLibrary, type LibraryView } from '@/components/ragas/RagaLibrary';

export const metadata: Metadata = {
  title: 'Raga library',
  description: 'Browse 908 Carnatic janya ragas and the 72 melakartas. Filter by type, search by notes and play every scale.',
};

const VIEWS: LibraryView[] = ['janya', 'melakarta', 'popular'];

export default async function RagasPage({ searchParams }: { searchParams: Promise<{ view?: string; sub?: string }> }) {
  const params = await searchParams;
  const requested = (params.view ?? params.sub) as LibraryView;
  const view = VIEWS.includes(requested) ? requested : 'janya';

  return (
    <>
      <PageHeader
        eyebrow="Raga library"
        title="Every scale,"
        accent="ready to play."
        description="908 janya ragas and the 72 melakartas they come from. Search by name, parent or notes, and press play to hear the arohana and avarohana."
      />
      <div className="container-page pb-24">
        <RagaLibrary initialView={view} />
      </div>
    </>
  );
}
