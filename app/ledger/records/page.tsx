'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Ledger } from '../../types';
import { parse } from 'date-fns';
// We will create this form component next
// import AddLedgerForm from '../components/ledger/AddLedgerForm';
import Modal from '../../components/Modal';
import AuthButton from '../../components/AuthButton';
import AddLedgerForm from '../../components/ledger/AddLedgerForm';
import DataTable, { Column } from '../../components/DataTable';

export default function LedgerPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data: ledgers, isLoading, isError } = useQuery<Ledger[]>({
    queryKey: ['ledgers'],
    // Sort by most recent first
    queryFn: () => fetch('/api/ledger').then(res => res.json()).then(data => data.sort((a: Ledger, b: Ledger) => new Date(b.CreatedAt).getTime() - new Date(a.CreatedAt).getTime())),
  });

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error loading ledger data.</div>;

  const columns: Column<Ledger>[] = [
    { header: 'Date', accessorKey: 'CreatedAt', cell: (info) => parse(info.CreatedAt, 'dd/MM/yyyy HH:mm:ss', new Date()).toLocaleDateString() },
    { header: 'Member', accessorKey: 'MemberName' },
    { header: 'Type', accessorKey: 'Type' },
    {
      header: 'Amount', accessorKey: 'Amount', cell: (info) => (
        <span className={info.Type === 'Loan' ? 'text-red-700' : 'text-green-700'}>
          {info.Type === 'Loan' ? '-' : '+'} {info.Amount.toLocaleString()}
        </span>
      )
    },
    { header: 'Notes', accessorKey: 'Notes' }
  ];

  return (
    <>
      <main className="p-8">
        <div className="flex justify-between items-start mb-8">
          <h1 className="text-3xl font-bold">Ledger</h1>
          <button
            onClick={() => setIsModalOpen(true)}
            className="rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-green-700"
          >
            Add Record
          </button>
        </div>

        <div className="mt-6 overflow-x-auto">
          <DataTable data={ledgers || []} columns={columns} />
        </div>
      </main>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add Ledger Record"
      >
        <AddLedgerForm onSuccess={() => setIsModalOpen(false)} />
      </Modal>
    </>
  );
}