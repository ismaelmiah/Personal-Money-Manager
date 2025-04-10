'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Account } from '../../types';

type AccountFormData = Pick<Account, 'Name' | 'Balance' | 'Savings' | 'Currency'>;

export default function AddAccountForm({ onSuccess }: { onSuccess: () => void }) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<AccountFormData>({
    Name: '',
    Balance: 0,
    Savings: 0,
    Currency: 'BDT', // Default currency
  });

  const addAccountMutation = useMutation<Account, Error, AccountFormData>({
    mutationFn: async (newAccountData) => {
      const response = await fetch('/api/accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newAccountData),
      });
      if (!response.ok) throw new Error('Failed to create account');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      onSuccess(); // Close the modal
    },
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const isNumber = ['Balance', 'Savings'].includes(name);
    setFormData((prev) => ({ ...prev, [name]: isNumber ? parseFloat(value) || 0 : value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.Name) {
      addAccountMutation.mutate(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="Name" className="block text-sm font-medium text-gray-700">Account Name</label>
        <input type="text" name="Name" id="Name" value={formData.Name} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
      </div>
       <div>
        <label htmlFor="Balance" className="block text-sm font-medium text-gray-700">Current Balance</label>
        <input type="number" step="0.01" name="Balance" id="Balance" value={formData.Balance} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
      </div>
      <div>
        <label htmlFor="Savings" className="block text-sm font-medium text-gray-700">Savings Component</label>
        <input type="number" step="0.01" name="Savings" id="Savings" value={formData.Savings} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
      </div>
      <div>
        <label htmlFor="Currency" className="block text-sm font-medium text-gray-700">Currency</label>
        <input type="text" name="Currency" id="Currency" value={formData.Currency} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
      </div>
      <div className="mt-6 flex justify-end gap-4">
        <button type="button" onClick={onSuccess} className="rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700">Cancel</button>
        <button type="submit" disabled={addAccountMutation.isPending} className="rounded-md border border-transparent bg-sky-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-sky-700 disabled:bg-gray-400">
          {addAccountMutation.isPending ? 'Saving...' : 'Save Account'}
        </button>
      </div>
    </form>
  );
}