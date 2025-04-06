'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Ledger } from '../../types';
import { parse } from 'date-fns';
import Modal from '../../components/Modal';
import AddLedgerForm from '../../components/ledger/AddLedgerForm';
import DataTable, { Column } from '../../components/DataTable';

export default function LedgerPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data: ledgers, isLoading, isError } = useQuery<Ledger[]>({
    queryKey: ['ledgers'],
    // Sort by most recent first
    queryFn: () => fetch('/api/ledger').then(res => res.json())
      .then(data => data.sort(
        (a: Ledger, b: Ledger) =>
          parse(b.CreatedAt, 'dd/MM/yyyy HH:mm:ss', new Date()).getTime() -
          parse(a.CreatedAt, 'dd/MM/yyyy HH:mm:ss', new Date()).getTime()
      )),
  });

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error loading ledger data.</div>;

  const columns: Column<Ledger>[] = [
    { header: 'Date', accessorKey: 'CreatedAt', cell: (info) => parse(info.CreatedAt, 'dd/MM/yyyy HH:mm:ss', new Date()).toLocaleDateString() },
    { header: 'Member', accessorKey: 'MemberName' },
    { header: 'Type', accessorKey: 'Type', cell: (info) => (
      <span className={info.Type === 'Loan' ? 'rounded-full bg-red-600 text-white px-2 py-[2px]' : 'rounded-full bg-green-700 text-white px-2 py-[2px]'}>
        {info.Type}
      </span>
    ) },
    {
      header: 'Amount', accessorKey: 'Amount', cell: (info) => (
        <span className={info.Type === 'Loan' ? 'text-red-700' : 'text-green-700'}>
          {info.Type === 'Loan' ? '-' : '+'} {info.Amount.toLocaleString()}
        </span>
      )
    },
    { header: 'Notes', accessorKey: 'Notes' },
    { header: 'BDT Equivalent', accessorKey: 'Equivalent to BDT', cell: (info) => info['Equivalent to BDT'].toLocaleString() },
  ];

  return (
    <>
      <div className="mt-6">
        <DataTable data={ledgers || []} columns={columns} title='Ledger' setIsModalOpen={setIsModalOpen}/>
      </div>

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