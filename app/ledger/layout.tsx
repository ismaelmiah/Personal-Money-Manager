import Sidebar from '@/app/components/layout/Sidebar';
import AuthButton from '@/app/components/AuthButton';

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
      <div>
        {/* Static sidebar for desktop */}
        <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
          <Sidebar />
        </div>

        {/* Main content area */}
        <div className="lg:pl-72">
          <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
            {/* You can add a mobile menu button here later */}
            <div className="flex-1 text-sm font-semibold leading-6 text-gray-900">
              Loan Tracking Platform
            </div>
            <AuthButton />
          </div>

          <main className="py-10">
            <div className="px-4 sm:px-6 lg:px-8">{children}</div>
          </main>
        </div>
      </div>
    </HydrationBoundary>
  );
}