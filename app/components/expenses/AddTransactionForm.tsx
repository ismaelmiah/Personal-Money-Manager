'use client';

import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Transaction, Account, Category } from '../../types';
import { useSyncStore } from '@/app/store/syncStore';
import { format } from 'date-fns';

type TransactionFormData = Omit<Transaction, 'Id' | 'CreatedAt'>;

export default function AddTransactionForm({ onSuccess }: { onSuccess: () => void }) {
  const queryClient = useQueryClient();

  const { addPendingTransaction, removePendingTransaction } = useSyncStore();

  // --- 1. Fetch required data in parallel ---
  const { data: accounts, isLoading: isLoadingAccounts } = useQuery<Account[]>({
    queryKey: ['accounts'],
    queryFn: () => fetch('/api/accounts').then((res) => res.json()),
  });

  const { data: categories, isLoading: isLoadingCategories } = useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn: () => fetch('/api/categories').then((res) => res.json()),
  });

  // --- 2. Form State ---
  const [formData, setFormData] = useState<Partial<TransactionFormData>>({
    Type: 'Expense', // Default type
    Amount: 0,
    Currency: 'BDT',
  });

  // --- 3. Mutation to add the transaction ---
  const addTransactionMutation = useMutation<Transaction, Error, TransactionFormData>({
    mutationFn: async (newTransactionData) => {
      const response = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTransactionData),
      });
      if (!response.ok) throw new Error('Failed to create transaction');
      return response.json();
    },
    onMutate: async (newTransactionData) => {
      // 1. Close the modal IMMEDIATELY
      onSuccess();

      // 2. Cancel ongoing queries
      await queryClient.cancelQueries({ queryKey: ['transactions'] });

      // 3. Snapshot the previous state
      const previousTransactions = queryClient.getQueryData<Transaction[]>(['transactions']) ?? [];
      
      // 4. Create a temporary ID and add to the sync queue
      const tempId = `temp-${Date.now()}`;
      addPendingTransaction({ tempId, payload: newTransactionData });

      // 5. Optimistically update the UI
      const optimisticTransaction: Transaction = {
        ...newTransactionData,
        Id: tempId,
        CreatedAt: format(new Date(), 'dd/MM/yyyy HH:mm:ss'),
      };
      queryClient.setQueryData<Transaction[]>(['transactions'], [...previousTransactions, optimisticTransaction]);

      // 6. Return context with tempId and snapshot
      return { previousTransactions, tempId };
    },
    onSuccess: (data, variables, context: any) => {
      removePendingTransaction(context.tempId);

      // Replace the temporary item with the real one from the server
      queryClient.setQueryData<Transaction[]>(['transactions'], (old) =>
        old?.map(t => t.Id === context.tempId ? data : t) ?? []
      );

      // // Invalidate all relevant queries
      // queryClient.invalidateQueries({ queryKey: ['transactions'] });
      // queryClient.invalidateQueries({ queryKey: ['accounts'] }); // Because balances change
      // queryClient.invalidateQueries({ queryKey: ['expense-dashboard-stats'] }); // For the dashboard
      // onSuccess();
      // removePendingTransaction(data.Id);
    },
    onError: (err, variables, context: any) => {
      if (context) {
        removePendingTransaction(context.tempId);
        queryClient.setQueryData(['transactions'], context.previousTransactions);
        // Optional: Add a toast notification to inform the user of the failure
        alert('Failed to save transaction. Please try again.');
      }
    },
    
    // Always refetch data to ensure consistency
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      queryClient.invalidateQueries({ queryKey: ['expense-dashboard-stats'] });
    },
  });

  // --- 4. Derived state for conditional UI ---
  const filteredCategories = useMemo(() => {
    if (!categories) return [];
    return categories.filter(c => c.Type === formData.Type);
  }, [categories, formData.Type]);

  // --- 5. Event Handlers ---
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    const isNumber = name === 'Amount';
    setFormData((prev) => ({
      ...prev,
      [name]: isNumber ? parseFloat(value) || 0 : value,
    }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addTransactionMutation.mutate(formData as TransactionFormData);
  };

  const isFormLoading = isLoadingAccounts || isLoadingCategories;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Transaction Type Selector */}
      <div>
        <label className="block text-sm font-medium text-gray-700">Type</label>
        <select name="Type" title="Transaction Type" value={formData.Type} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm">
          <option value="Expense">Expense</option>
          <option value="Income">Income</option>
          <option value="Transfer">Transfer</option>
        </select>
      </div>

      {/* Amount and Currency */}
      <div className="flex gap-4">
        <div className="flex-grow">
          <label htmlFor="Amount" className="block text-sm font-medium text-gray-700">Amount</label>
          <input type="number" step="0.01" name="Amount" id="Amount" onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
        </div>
        <div>
          <label htmlFor="Currency" className="block text-sm font-medium text-gray-700">Currency</label>
          <input type="text" name="Currency" title="Currency" value={formData.Currency} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
        </div>
      </div>
      
      {/* --- Conditional Fields --- */}

      {/* For Expense or Transfer */}
      {(formData.Type === 'Expense' || formData.Type === 'Transfer') && (
        <div>
          <label htmlFor="FromAccountId" className="block text-sm font-medium text-gray-700">From Account</label>
          <select name="FromAccountId" title="From Account" id="FromAccountId" onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm">
            <option>{isFormLoading ? 'Loading...' : 'Select account'}</option>
            {accounts?.map(acc => <option key={acc.Id} value={acc.Id}>{acc.Name} ({acc.Balance.toLocaleString()} {acc.Currency})</option>)}
          </select>
        </div>
      )}

      {/* For Income or Transfer */}
      {(formData.Type === 'Income' || formData.Type === 'Transfer') && (
        <div>
          <label htmlFor="ToAccountId" className="block text-sm font-medium text-gray-700">To Account</label>
          <select name="ToAccountId" title="To Account" id="ToAccountId" onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm">
            <option>{isFormLoading ? 'Loading...' : 'Select account'}</option>
            {accounts?.map(acc => <option key={acc.Id} value={acc.Id}>{acc.Name} ({acc.Balance.toLocaleString()} {acc.Currency})</option>)}
          </select>
        </div>
      )}

      {/* For Income or Expense (but NOT Transfer) */}
      {formData.Type !== 'Transfer' && (
        <div>
          <label htmlFor="CategoryId" className="block text-sm font-medium text-gray-700">Category</label>
          <select name="CategoryId" title="Category" id="CategoryId" onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm">
            <option>{isFormLoading ? 'Loading...' : 'Select category'}</option>
            {filteredCategories.map(cat => <option key={cat.Id} value={cat.Id}>{cat.Name}</option>)}
          </select>
        </div>
      )}

      {/* Notes */}
      <div>
        <label htmlFor="Notes" className="block text-sm font-medium text-gray-700">Notes</label>
        <textarea name="Notes" title="Notes" id="Notes" onChange={handleChange} rows={3} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"></textarea>
      </div>

      <div className="mt-6 flex justify-end gap-4">
        <button type="button" onClick={onSuccess} className="rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700">Cancel</button>
        <button type="submit" disabled={addTransactionMutation.isPending || isFormLoading} className="rounded-md border border-transparent bg-sky-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-sky-700 disabled:bg-gray-400">
          {addTransactionMutation.isPending ? 'Saving...' : 'Save Transaction'}
        </button>
      </div>
    </form>
  );
}