import type { Metadata } from 'next';
import { PageHeader } from '@/components/layout/PageHeader';
import { AdminConsole } from './AdminConsole';

export const metadata: Metadata = {
  title: 'Musicology console',
  robots: { index: false, follow: false },
};

export default function AdminPage() {
  return (
    <>
      <PageHeader eyebrow="Owner only" title="Musicology console" description="Teach the finder corrections, review reports from visitors and test queries." />
      <div className="container-page pb-24">
        <AdminConsole />
      </div>
    </>
  );
}
