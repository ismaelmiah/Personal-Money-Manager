import { create } from 'zustand';

interface PendingTransaction {
  tempId: string;
  payload: object; // The data that was sent
}

interface SyncState {
  pendingTransactions: PendingTransaction[];
  addPendingTransaction: (transaction: PendingTransaction) => void;
  removePendingTransaction: (tempId: string) => void;
}

export const useSyncStore = create<SyncState>((set) => ({
  pendingTransactions: [],
  addPendingTransaction: (transaction) =>
    set((state) => ({
      pendingTransactions: [...state.pendingTransactions, transaction],
    })),
  removePendingTransaction: (tempId) =>
    set((state) => ({
      pendingTransactions: state.pendingTransactions.filter((t) => t.tempId !== tempId),
    })),
}));