'use client';

import { useState } from 'react';
import { Ledger } from '@/app/types';
import DataTable, { Column } from '../../components/DataTable';
import Modal from '@/app/components/Modal';
import EditLedgerForm from '@/app/components/ledger/EditLedgerForm';
import { Member } from '@/app/types';
import { parse } from 'date-fns';


const StatCard = ({ title, value }: { title: string; value: string }) => (
  <div className="bg-white p-6 rounded-lg shadow">
    <h3 className="text-base font-semibold text-gray-500">{title}</h3>
    <p className="mt-2 text-2xl font-bold tracking-tight text-gray-900">{value}</p>
  </div>
);

export default function MemberDetailsClient({ member, memberLedgers }: { member: Member; memberLedgers: Ledger[] }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLedger, setEditingLedger] = useState<Ledger | null>(null);

  // Calculate stats for this member
  const memberTotalLoanedBDT = memberLedgers
    .filter(l => l.Type === 'Loan' && l.Currency === 'BDT')
    .reduce((sum, l) => sum + Number(l.Amount), 0);

  const memberTotalReturnedBDT = memberLedgers
    .filter(l => l.Type === 'Return' && l.Currency === 'BDT')
    .reduce((sum, l) => sum + Number(l.Amount), 0);

  const memberTotalLoanedGBP = memberLedgers
    .filter(l => l.Type === 'Loan' && l.Currency === 'GBP')
    .reduce((sum, l) => sum + Number(l.Amount), 0);

  const memberTotalReturnedGBP = memberLedgers
    .filter(l => l.Type === 'Return' && l.Currency === 'GBP')
    .reduce((sum, l) => sum + Number(l.Amount), 0);

  const columns: Column<Ledger>[] = [
    { header: 'Date', accessorKey: 'CreatedAt', cell: (info) => parse(info.CreatedAt, 'dd/MM/yyyy HH:mm:ss', new Date()).toLocaleDateString() },
    { header: 'Type', accessorKey: 'Type' },
    {
      header: 'Amount', accessorKey: 'Amount', cell: (info) => (
        <span className={info.Type === 'Loan' ? 'rounded-full bg-red-600 text-white px-2 py-[2px]' : 'rounded-full bg-green-700 text-white px-2 py-[2px]'}>
          {info.Amount} / {info.Currency}
        </span>
      )
    },
    { header: 'Notes', accessorKey: 'Notes' },
    {
      header: 'Actions',
      cell: (info: Ledger) => (
        <button onClick={() => { setEditingLedger(info); setIsModalOpen(true); }} className="text-blue-600 hover:underline hover:cursor-pointer">
          Edit
        </button>
      ),
    },
  ];

  return (

    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">{member.Name}</h1>
        <p className="text-gray-600">{member.Relationship || 'No relationship specified'}</p>
        <p className="text-sm text-gray-500">Phone: {member.Phone}</p>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3 mb-10">
        <StatCard title="Current Balance" value={`BDT: ${(memberTotalLoanedBDT - memberTotalReturnedBDT).toLocaleString()} | GBP: ${(memberTotalLoanedGBP - memberTotalReturnedGBP).toLocaleString()}`} />
        <StatCard title="Total Loaned to Member" value={`BDT: ${memberTotalLoanedBDT.toLocaleString()} | GBP: ${memberTotalLoanedGBP.toLocaleString()}`} />
        <StatCard title="Total Returned by Member" value={`BDT: ${memberTotalReturnedBDT.toLocaleString()} | GBP: ${memberTotalReturnedGBP.toLocaleString()}`} />
      </div>

      <div className="mt-6">
        <DataTable data={memberLedgers || []} columns={columns} numberOfRows={6} setIsModalOpen={setIsModalOpen} />
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Edit Ledger">
        {editingLedger && <EditLedgerForm ledger={editingLedger} onSuccess={() => setEditingLedger(null)} />}
      </Modal>
    </div>
  )
}