'use client';

import { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Segmented } from '@/components/ui/Segmented';
import { TanpuraPanel } from './TanpuraPanel';
import { LookalikePairs } from './LookalikePairs';
import { SwaraLookup } from './SwaraLookup';

export type PracticeTool = 'tanpura' | 'pairs' | 'lookup';

export function PracticeRoom({ initialTool }: { initialTool: PracticeTool }) {
  const [tool, setTool] = useState<PracticeTool>(initialTool);
  const router = useRouter();
  const pathname = usePathname();

  const change = (next: PracticeTool) => {
    setTool(next);
    router.replace(next === 'tanpura' ? pathname : `${pathname}?tool=${next}`, { scroll: false });
  };

  return (
    <div>
      <Segmented
        label="Practice tool"
        value={tool}
        onChange={change}
        options={[
          { value: 'tanpura', label: 'Tanpura drone' },
          { value: 'pairs', label: 'Look-alike ragas' },
          { value: 'lookup', label: 'Swara lookup' },
        ]}
      />
      <div className="mt-8">
        {tool === 'tanpura' && <TanpuraPanel />}
        {tool === 'pairs' && <LookalikePairs />}
        {tool === 'lookup' && <SwaraLookup />}
      </div>
    </div>
  );
}
