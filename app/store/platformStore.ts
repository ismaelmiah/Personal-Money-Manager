import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Platform = 'ledger' | 'expenses';

type PlatformState = {
  platform: Platform;
  setPlatform: (platform: Platform) => void;
};

// The 'persist' middleware will automatically save the state to localStorage
export const usePlatformStore = create<PlatformState>()(
  persist(
    (set) => ({
      platform: 'ledger', // Default platform
      setPlatform: (platform) => set({ platform }),
    }),
    {
      name: 'platform-storage', // Name for the localStorage item
    }
  )
);