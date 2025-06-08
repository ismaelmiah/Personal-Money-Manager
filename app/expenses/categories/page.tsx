'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Category } from '../../types';
import Modal from '@/app/components/Modal';
import AddCategoryForm from '@/app/components/expenses/AddCategoryForm';
import DataTable, { Column } from '@/app/components/DataTable';

export default function CategoriesPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data: categories, isLoading, isError } = useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn: () => fetch('/api/categories').then((res) => res.json()).then(data => data.sort((a: Category, b: Category) => new Date(b.CreatedAt).getTime() - new Date(a.CreatedAt).getTime())),
  });

  if (isLoading) return <div>Loading categories...</div>;
  if (isError) return <div>Error loading categories.</div>;


  const columns: Column<Category>[] = [
    { header: 'Name', accessorKey: 'Name' },
    { header: 'Type', accessorKey: 'Type' },
    {
      header: 'Budget', accessorKey: 'Budget', cell: (info) => (
        <span className={info.Type === 'Income' ? 'text-green-700' : 'text-red-700'}>
          {info.Type === 'Income' ? '+' : '-'} {info.Budget}
        </span>
      )
    }
  ];

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Categories</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700"
        >
          Add New Category
        </button>
      </div>

      <div className="overflow-x-auto">
        <DataTable data={categories || []} columns={columns} />
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add New Category"
      >
        <AddCategoryForm onSuccess={() => setIsModalOpen(false)} />
      </Modal>
    </>
  );
}