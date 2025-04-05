import Sidebar from '@/app/components/layout/Sidebar';

import { getRows } from '../lib/sheets';
import { Ledger, Member } from '../types';
import { dehydrate } from '@tanstack/react-query';
import getQueryClient from '../getQueryClient';
import { HydrationBoundary } from '@tanstack/react-query';

export default async function LedgerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const queryClient = getQueryClient();

  // Prefetch all data for this platform in parallel
  await Promise.all([
    queryClient.prefetchQuery({
      queryKey: ['ledgers'],
      queryFn: () => getRows<Ledger>('Ledger'),
    }),
    queryClient.prefetchQuery({
      queryKey: ['members'],
      queryFn: () => getRows<Member>('Member'),
    }),
  ]);

  const dehydratedState = dehydrate(queryClient);

  return (
    <HydrationBoundary state={dehydratedState}>
      <div className="flex">
        <div className="hidden lg:flex h-screen lg:w-72 lg:flex-col">
          <Sidebar />
        </div>
        <main className='w-full'>
          <div className="px-4 sm:px-6 lg:px-8">{children}</div>
        </main>
      </div>
    </HydrationBoundary>
  );
}