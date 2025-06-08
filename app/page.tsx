'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { usePlatformStore } from './store/platformStore';

// This component runs on the client and handles the initial redirect logic.
export default function HomePage() {
  const router = useRouter();
  const { platform } = usePlatformStore();

  useEffect(() => {
    // Zustand's persist middleware might take a moment to rehydrate from localStorage.
    // By checking `platform`, we ensure we have the stored value before redirecting.
    if (platform) {
      router.replace(`/${platform}/dashboard`);
    } else {
      // This case handles if the storage is empty or cleared.
      router.replace('/select-platform');
    }
  }, [platform, router]);

  // Render a loading state while the redirect is happening.
  return (
      <div className="flex h-screen items-center justify-center">
          <div>Loading...</div>
      </div>
  );
}