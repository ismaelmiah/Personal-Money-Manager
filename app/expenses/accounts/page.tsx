'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Account } from '../../types';
import Modal from '@/app/components/Modal';
import AddAccountForm from '@/app/components/expenses/AddAccountForm';
import DataTable, { Column } from '@/app/components/DataTable';

export default function AccountsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data: accounts, isLoading, isError } = useQuery<Account[]>({
    queryKey: ['accounts'],
    queryFn: () => fetch('/api/accounts').then((res) => res.json()),
  });

  if (isLoading) return <div>Loading accounts...</div>;
  if (isError) return <div>Error loading accounts.</div>;

  const columns: Column<Account>[] = [
    { header: 'Name', accessorKey: 'Name' },
    { header: 'Balance', accessorKey: 'Balance', cell: (info) => (
      <span className="text-right">{info.Balance.toLocaleString()} {info.Currency}</span>
    )},
    { header: 'Savings', accessorKey: 'Savings', cell: (info) => (
      <span className="text-right">{info.Savings.toLocaleString()} {info.Currency}</span>
    )},
    { header: 'Date Created', accessorKey: 'CreatedAt', cell: (info) => (
      <span className="text-right">{new Date(info.CreatedAt).toLocaleDateString()}</span>
    )}
  ];

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Your Accounts</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="rounded-md bg-sky-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-sky-700"
        >
          Add New Account
        </button>
      </div>
      
      <div className="overflow-x-auto">
        <DataTable data={accounts || []} columns={columns} />
      </div>

      <Modal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add New Account"
      >
        <AddAccountForm onSuccess={() => setIsModalOpen(false)} />
      </Modal>
    </>
  );
}