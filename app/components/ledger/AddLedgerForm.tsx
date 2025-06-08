'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Ledger, Member } from '../../types';
import { format } from 'date-fns';

type LedgerFormData = Omit<Ledger, 'Id' | 'MemberName'>;

export default function AddLedgerForm({ onSuccess }: { onSuccess: () => void }) {
  const queryClient = useQueryClient();

  // Fetch members to populate the dropdown
  const { data: members, isLoading: isLoadingMembers } = useQuery<Member[]>({
    queryKey: ['members'],
    queryFn: () => fetch('/api/members').then((res) => res.json()),
  });

  const [formData, setFormData] = useState<Partial<LedgerFormData>>({
    Type: 'Loan', // Default type
    Currency: 'BDT', // Default currency
  });

  const addLedgerMutation = useMutation<Ledger, Error, LedgerFormData & { MemberName: string }>({
    mutationFn: async (newLedgerData) => {
      const response = await fetch('/api/ledger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newLedgerData),
      });
      if (!response.ok) throw new Error('Failed to create ledger record');
      return response.json();
    },
    onSuccess: () => {
      // Invalidate both ledgers and members queries, as a new loan/return affects a member's balance
      queryClient.invalidateQueries({ queryKey: ['ledgers'] });
      queryClient.invalidateQueries({ queryKey: ['members'] });
      onSuccess();
    },
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    const isNumber = ['Amount', 'Equivalent to BDT'].includes(name);
    setFormData((prev) => ({ ...prev, [name]: isNumber ? parseFloat(value) : value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const selectedMember = members?.find(m => m.Id === formData.MemberId);
    if (!selectedMember || !formData.Amount) {
        alert("Please select a member and enter an amount.");
        return;
    }
    const createdAt = format(new Date(), 'dd/MM/yyyy HH:mm:ss');
    addLedgerMutation.mutate({
      ...formData as LedgerFormData, // We are sure it's valid here
      MemberName: selectedMember.Name,
      CreatedAt: createdAt,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="MemberId" className="block text-sm font-medium text-gray-700">Member</label>
        <select name="MemberId" id="MemberId" onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm">
          <option value="">{isLoadingMembers ? 'Loading...' : 'Select a member'}</option>
          {members?.map(member => <option key={member.Id} value={member.Id}>{member.Name}</option>)}
        </select>
      </div>
      <div>
        <label htmlFor="Type" className="block text-sm font-medium text-gray-700">Type</label>
        <select name="Type" id="Type" value={formData.Type} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm">
          <option value="Loan">Loan (I gave)</option>
          <option value="Return">Return (I received)</option>
        </select>
      </div>
      <div>
        <label htmlFor="Amount" className="block text-sm font-medium text-gray-700">Amount</label>
        <input type="number" name="Amount" id="Amount" onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
      </div>
      {/* Add other fields like Currency, Equivalent to BDT, Notes as needed */}
      <div className="mt-6 flex justify-end gap-4">
        <button type="button" onClick={onSuccess} className="rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700">Cancel</button>
        <button type="submit" disabled={addLedgerMutation.isPending} className="rounded-md border border-transparent bg-green-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-green-700 disabled:bg-gray-400">
          {addLedgerMutation.isPending ? 'Saving...' : 'Save Record'}
        </button>
      </div>
    </form>
  );
}