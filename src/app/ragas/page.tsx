import { redirect } from 'next/navigation';

export default async function RagasPage({ searchParams }: { searchParams: Promise<{ sub?: string }> }) {
  const params = await searchParams;
  const sub = params.sub ? `&sub=${encodeURIComponent(params.sub)}` : '';
  redirect(`/?tab=ragas${sub}`);
}
