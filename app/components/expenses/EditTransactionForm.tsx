'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Transaction, Account, Category } from '../../types';

// The form receives the transaction to edit as a prop
interface EditTransactionFormProps {
  transaction: Transaction;
  onSuccess: () => void;
}

export default function EditTransactionForm({ transaction, onSuccess }: EditTransactionFormProps) {
  const queryClient = useQueryClient();

  // Fetch accounts and categories
  const { data: accounts, isLoading: isLoadingAccounts } = useQuery<Account[]>({
    queryKey: ['accounts'],
    queryFn: async () => {
      const response = await fetch('/api/accounts');
      if (!response.ok) throw new Error('Failed to fetch accounts');
      return response.json();
    },
  });

  const { data: categories, isLoading: isLoadingCategories } = useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn: async () => {
      const response = await fetch('/api/categories');
      if (!response.ok) throw new Error('Failed to fetch categories');
      return response.json();
    },
  });

  // Initialize form state with the existing transaction data
  const [formData, setFormData] = useState<Transaction>(transaction);

  const updateTransactionMutation = useMutation<Transaction, unknown, Transaction>({
    mutationFn: async (updatedTransaction) => {
      const response = await fetch('/api/transactions', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedTransaction),
      });
      if (!response.ok) throw new Error('Failed to update transaction');
      return response.json();
    },
    onSuccess: () => {
      // Invalidate queries to refetch data
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      onSuccess(); // Close the modal
    },
  });

  // Filter categories based on selected transaction type
  // const filteredCategories = useMemo(() => {
  //   if (!categories) return [];
  //   return categories.filter(c => c.Type === formData.Type);
  // }, [categories, formData.Type]);

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
    updateTransactionMutation.mutate(formData);
  };

  const isFormLoading = isLoadingAccounts || isLoadingCategories;
console.log(categories);
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* The form JSX is nearly identical to AddTransactionForm */}
      {/* The key difference is that the `value` of each input is bound to `formData` */}
      {/* which is pre-filled with the transaction's data. */}
      
      {/* Transaction Type Selector */}
      <div>
        <label>Type</label>
        <select name="Type" title="Type" value={formData.Type} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm">
          <option value="Expense">Expense</option>
          <option value="Income">Income</option>
          <option value="Transfer">Transfer</option>
        </select>
      </div>

      {/* Amount */}
       <div>
          <label htmlFor="Amount">Amount</label>
          <input type="number" step="0.01" name="Amount" id="Amount" value={formData.Amount} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
      </div>

      {/* Conditional Fields: From Account */}
      {(formData.Type === 'Expense' || formData.Type === 'Transfer') && (
        <div>
          <label htmlFor="FromAccountId">From Account</label>
          <select name="FromAccountId" id="FromAccountId" value={formData.FromAccountId} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm">
             {accounts?.map(acc => <option key={acc.Id} value={acc.Id}>{acc.Name}</option>)}
          </select>
        </div>
      )}
      
      {/* All other conditional fields (ToAccountId, CategoryId, Notes) follow the same pattern... */}
      
      <div className="mt-6 flex justify-end gap-4">
        <button type="button" onClick={onSuccess} className="rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700">Cancel</button>
        <button type="submit" disabled={updateTransactionMutation.isPending || isFormLoading} className="rounded-md border border-transparent bg-sky-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-sky-700 disabled:bg-gray-400">
          {updateTransactionMutation.isPending ? 'Updating...' : 'Update Transaction'}
        </button>
      </div>
    </form>
  );
}