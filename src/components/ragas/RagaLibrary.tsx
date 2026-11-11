'use client';

import { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Segmented } from '@/components/ui/Segmented';
import { JanyaTable } from './JanyaTable';
import { MelakartaGrid } from './MelakartaGrid';
import { PopularRagas } from './PopularRagas';

export type LibraryView = 'janya' | 'melakarta' | 'popular';

/** Switches between the three views of the raga library and keeps the URL in sync. */
export function RagaLibrary({ initialView }: { initialView: LibraryView }) {
  const [view, setView] = useState<LibraryView>(initialView);
  const router = useRouter();
  const pathname = usePathname();

  const change = (next: LibraryView) => {
    setView(next);
    router.replace(next === 'janya' ? pathname : `${pathname}?view=${next}`, { scroll: false });
  };

  return (
    <div>
      <Segmented
        label="Library view"
        value={view}
        onChange={change}
        options={[
          { value: 'janya', label: 'Janya ragas', count: 908 },
          { value: 'melakarta', label: 'Melakartas', count: 72 },
          { value: 'popular', label: 'Popular', count: 12 },
        ]}
      />
      <div className="mt-8">
        {view === 'janya' && <JanyaTable />}
        {view === 'melakarta' && <MelakartaGrid />}
        {view === 'popular' && <PopularRagas />}
      </div>
    </div>
  );
}
