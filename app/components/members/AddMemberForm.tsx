'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Member } from '../../types';
import { format } from 'date-fns';

type MemberFormData = Pick<Member, 'Name' | 'Phone' | 'Email' | 'Relationship'>;

// The form now accepts an `onSuccess` prop to signal the modal to close
export default function AddMemberForm({ onSuccess }: { onSuccess: () => void }) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<MemberFormData>({
    Name: '',
    Phone: '',
    Email: '',
    Relationship: '',
  });

  const addMemberMutation = useMutation<Member, Error, MemberFormData>({
    mutationFn: async (newMemberData) => {
      // Logic is the same, just lives inside this component now
      const response = await fetch('/api/members', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newMemberData),
      });
      if (!response.ok) throw new Error('Failed to create member');
      return response.json();
    },
    // We use the onSuccess callback from the mutation to trigger the prop
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members'] });
      onSuccess(); // This will close the modal
    },
    // Note: We don't need optimistic updates as much with a modal,
    // because the UI state changes (modal closing) provide user feedback.
    // But it's still good practice. We'll add it back if needed.
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.Name) {
      const createdAt = format(new Date(), 'dd/MM/yyyy HH:mm:ss');
      const newMemberData = {
        ...formData,
        CreatedAt: createdAt,
        'Number of Loans': 0,
        'Current Loan': 0,
        'Total Returned': 0,
      };
      addMemberMutation.mutate(newMemberData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="Name" className="block text-sm font-medium text-gray-700">Name</label>
        <input type="text" name="Name" id="Name" value={formData.Name} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
      </div>
      <div>
        <label htmlFor="Phone" className="block text-sm font-medium text-gray-700">Phone</label>
        <input type="tel" name="Phone" id="Phone" value={formData.Phone} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
      </div>
      <div>
        <label htmlFor="Email" className="block text-sm font-medium text-gray-700">Email</label>
        <input type="email" name="Email" id="Email" value={formData.Email} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
      </div>
      <div>
        <label htmlFor="Relationship" className="block text-sm font-medium text-gray-700">Relationship</label>
        <input type="text" name="Relationship" id="Relationship" value={formData.Relationship} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
      </div>
      <div className="mt-6 flex justify-end gap-4">
        <button type="button" onClick={onSuccess} className="rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50">Cancel</button>
        <button type="submit" disabled={addMemberMutation.isPending} className="rounded-md border border-transparent bg-blue-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-blue-700 disabled:bg-gray-400">
          {addMemberMutation.isPending ? 'Saving...' : 'Save Member'}
        </button>
      </div>
    </form>
  );
}