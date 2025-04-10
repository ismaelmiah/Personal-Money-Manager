'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Category, CategoryType } from '../../types';

type CategoryFormData = Pick<Category, 'Name' | 'Type' | 'Budget'>;

export default function AddCategoryForm({ onSuccess }: { onSuccess: () => void }) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<CategoryFormData>({
    Name: '',
    Type: 'Expense', // Default to Expense
    Budget: 0,
  });

  const addCategoryMutation = useMutation<Category, Error, CategoryFormData>({
    mutationFn: async (newCategoryData) => {
      const response = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCategoryData),
      });
      if (!response.ok) throw new Error('Failed to create category');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      onSuccess();
    },
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const isNumber = name === 'Budget';
    setFormData((prev) => ({ 
        ...prev, 
        [name]: isNumber ? parseFloat(value) || 0 : value 
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.Name) {
      addCategoryMutation.mutate(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="Name" className="block text-sm font-medium text-gray-700">Category Name</label>
        <input type="text" name="Name" id="Name" value={formData.Name} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
      </div>
      <div>
        <label htmlFor="Type" className="block text-sm font-medium text-gray-700">Type</label>
        <select name="Type" id="Type" value={formData.Type} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm">
          <option value="Expense">Expense</option>
          <option value="Income">Income</option>
        </select>
      </div>
      <div>
        <label htmlFor="Budget" className="block text-sm font-medium text-gray-700">Monthly Budget (Optional)</label>
        <input type="number" step="0.01" name="Budget" id="Budget" value={formData.Budget} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
      </div>
      <div className="mt-6 flex justify-end gap-4">
        <button type="button" onClick={onSuccess} className="rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700">Cancel</button>
        <button type="submit" disabled={addCategoryMutation.isPending} className="rounded-md border border-transparent bg-sky-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-sky-700 disabled:bg-gray-400">
          {addCategoryMutation.isPending ? 'Saving...' : 'Save Category'}
        </button>
      </div>
    </form>
  );
}