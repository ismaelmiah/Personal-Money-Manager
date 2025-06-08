'use client';

import { usePlatformStore } from '@/app/store/platformStore';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import LoadingOverlay from '@/app/components/layout/LoadingOverlay';

export default function SelectPlatformPage() {
  const { setPlatform } = usePlatformStore();
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(false);

  const handleSelect = (platform: 'ledger' | 'expenses') => {
    setIsLoading(true);
    setPlatform(platform);
    router.push(`/${platform}/dashboard`);
  };

  return (
    <>
    {isLoading && <LoadingOverlay />}
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-8">Choose Your Platform</h1>
        <div className="flex gap-8">
          <button
            onClick={() => handleSelect('ledger')}
            className="p-8 bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow"
          >
            <h2 className="text-2xl font-semibold">Loan Tracking</h2>
            <p className="text-gray-600">Manage loans and returns</p>
          </button>
          <button
            onClick={() => handleSelect('expenses')}
            className="p-8 bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow"
          >
            <h2 className="text-2xl font-semibold">Expense Management</h2>
            <p className="text-gray-600">Track income and expenses</p>
          </button>
        </div>
      </div>
    </div>
    </>
  );
}