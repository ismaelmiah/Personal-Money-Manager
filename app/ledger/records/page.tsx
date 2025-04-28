'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Ledger } from '../../types';
import { parse } from 'date-fns';
import Modal from '../../components/Modal';
import AddLedgerForm from '../../components/ledger/AddLedgerForm';
import DataTable, { Column } from '../../components/DataTable';
import Link from 'next/link';
import EditLedgerForm from '@/app/components/ledger/EditLedgerForm';

export default function LedgerPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLedger, setEditingLedger] = useState<Ledger | null>(null);

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
    { header: 'Date', accessorKey: 'CreatedAt', cell: (info) => parse(info.CreatedAt, 'dd/MM/yyyy HH:mm:ss', new Date()).toLocaleString() },
    {
      header: 'Member', accessorKey: 'MemberName', cell: (info) => (
        <Link href={`/members/${info.MemberId}`} className='text-sky-600 font-semibold hover:underline'>
          {info.MemberName}
        </Link>
      )
    },
    {
      header: 'Type', accessorKey: 'Type', cell: (info) => (
        <span className={info.Type === 'Loan' ? 'rounded-full bg-red-600 text-white px-2 py-[2px]' : 'rounded-full bg-green-700 text-white px-2 py-[2px]'}>
          {info.Type} / {info.Currency}
        </span>
      )
    },
    {
      header: 'Amount', accessorKey: 'Amount', cell: (info) => (
        <span className={info.Type === 'Loan' ? 'text-red-700' : 'text-green-700'}>
          {info.Type === 'Loan' ? '-' : '+'} {info.Amount.toLocaleString()}
        </span>
      )
    },
    { header: 'Notes', accessorKey: 'Notes', cell: (info) => info.Notes || '' },
    {
      header: 'Actions', cell: (info: Ledger) => (
        <div className='flex gap-2'>
          <button
            onClick={() => setEditingLedger(info)}
            className='text-green-600 hover:underline hover:cursor-pointer'
          >
            Edit
          </button>
        </div>
      )
    }
  ];

  return (
    <>
      <div className="mt-6">
        <DataTable data={ledgers || []} columns={columns} title='Ledger' setIsModalOpen={setIsModalOpen} />
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add Ledger Record"
      >
        <AddLedgerForm onSuccess={() => setIsModalOpen(false)} />
      </Modal>

      {/* Edit Modal */}
      <Modal isOpen={!!editingLedger} onClose={() => setEditingLedger(null)} title="Edit Ledger">
        {editingLedger && <EditLedgerForm ledger={editingLedger} onSuccess={() => setEditingLedger(null)} />}
      </Modal>
    </>
  );
}