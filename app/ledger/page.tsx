'use client';

// This page now simply redirects to the dashboard
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function LedgerRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/ledger/dashboard');
  }, [router]);

  return <div>Loading...</div>; // Or a loading spinner
}