'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Ledger, Member } from '../../types';

// type LedgerFormData = Omit<Ledger, 'Id' | 'MemberName'>;
// Reusable styling for our new buttons
const typeButtonClasses = (isActive: boolean) =>
  `w-full p-3 text-sm font-semibold rounded-lg border-2 transition-colors ${isActive
    ? 'bg-sky-600 border-blue-600 text-white shadow-md'
    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
  }`;
interface EditLedgerFormProps {
  ledger: Ledger;
  onSuccess: () => void;
}

export default function EditLedgerForm({ ledger, onSuccess }: EditLedgerFormProps) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<Ledger>({
    ...ledger,
    CreatedAt: ledger.CreatedAt ? new Date(
      ledger.CreatedAt.replace(
        /(\d{2})\/(\d{2})\/(\d{4}) (\d{2}):(\d{2}):(\d{2})/,
        '$3-$2-$1T$4:$5:$6'
      )
    ).toISOString().slice(0, 16)
  : ''
  });

  const { data: members, isLoading: isLoadingMembers } = useQuery<Member[]>({
    queryKey: ['members'],
    queryFn: () => fetch('/api/members').then((res) => res.json()),
  });

  const updateLedgerMutation = useMutation<Ledger, Error, Ledger>({
    mutationFn: async (updatedLedger) => {
      const response = await fetch('/api/ledger', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedLedger),
      });
      if (!response.ok) throw new Error('Failed to update ledger');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ledgers'] });
      onSuccess();
    },
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateLedgerMutation.mutate(formData);
  };

  if (isLoadingMembers) return <div>Loading members...</div>;
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="CreatedAt" className="block text-sm font-medium text-gray-700 mb-2">Date</label>
        <input type="datetime-local" name="CreatedAt" id="CreatedAt" value={formData.CreatedAt} onChange={handleChange} required className="w-full p-2 border border-gray-300 rounded-md shadow-sm" />
      </div>
      <div>
        <label htmlFor="MemberId" className="block text-sm font-medium text-gray-700 mb-2">Member</label>
        <select
          name="MemberId"
          id="MemberId"
          value={formData.MemberId}
          onChange={handleChange}
          required
          className="w-full p-2 border border-gray-300 rounded-md shadow-sm"
        >
          <option value="">Select a member</option>
          {members?.map(member => (
            <option key={member.Id} value={member.Id}>
              {member.Name}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="Type" className="block text-sm font-medium text-gray-700 mb-2">Type of Record</label>
        <div className="grid grid-cols-2 gap-4">
          <button type="button" className={typeButtonClasses(formData.Type === 'Loan')}>
            Loan (I Gave)
          </button>
          <button type="button" className={typeButtonClasses(formData.Type === 'Return')}>
            Return (I Received)
          </button>
        </div>
      </div>

      <div className="flex gap-4">
        <div className="flex-grow">
          <label htmlFor="Amount" className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
          <input type="number" step="0.01" name="Amount" id="Amount" placeholder='Amount' value={formData.Amount} onChange={handleChange} required className="w-full p-2 border border-gray-300 rounded-md shadow-sm" />
        </div>
        <div className="w-1/3">
          <label htmlFor="Currency" className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
          <select
            name="Currency"
            id="Currency"
            value={formData.Currency}
            onChange={handleChange}
            required
            className="w-full p-2 border border-gray-300 rounded-md shadow-sm"
          >
            <option value="BDT">BDT</option>
            <option value="GBP">GBP</option>
            <option value="USD">USD</option>
          </select>
        </div>
      </div>
      <div>
        <label htmlFor="Notes" className="block text-sm font-medium text-gray-700 mb-1">Notes (Optional)</label>
        <textarea name="Notes" id="Notes" value={formData.Notes} onChange={handleChange} rows={3} className="w-full p-2 border border-gray-300 rounded-md shadow-sm"></textarea>
      </div>

      <div className="pt-4 border-t border-gray-200">
        <button type="submit" disabled={updateLedgerMutation.isPending} className="w-full bg-sky-600 text-white font-bold py-3 px-4 rounded-lg shadow-md hover:bg-sky-700 disabled:bg-gray-400 transition-all">
          {updateLedgerMutation.isPending ? 'Saving...' : 'Update Record in Ledger'}
        </button>
      </div>
    </form>
  );
}