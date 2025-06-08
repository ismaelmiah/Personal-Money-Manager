'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import AuthButton from '../components/AuthButton';
import Modal from '../components/Modal'; // Import Modal
import AddMemberForm from '../components/members/AddMemberForm'; // Import the new form
import { Member } from '../types';
import { parse } from 'date-fns';
import Link from 'next/link';
import DataTable, { Column } from '../components/DataTable';

// Main Page Component
export default function MembersPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data: members, isLoading, isError } = useQuery<Member[]>({
    queryKey: ['members'],
    queryFn: () => fetch('/api/members').then((res) => res.json()),
  });

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error loading members.</div>;

  const columns: Column<Member>[] = [
    { header: 'Name', accessorKey: 'Name' },
    { header: 'Current Loan', accessorKey: 'Current Loan' },
    { header: 'Total Returned', accessorKey: 'Total Returned' },
    { header: 'Date Joined', accessorKey: 'CreatedAt', cell: (info: { CreatedAt: string }) => parse(info.CreatedAt, 'dd/MM/yyyy HH:mm:ss', new Date()).toLocaleDateString() }
  ];

  return (
    <>
      <main className="p-8">
        <div className="flex justify-between items-start mb-8">
          <h1 className="text-3xl font-bold">Members</h1>
          <button
            onClick={() => setIsModalOpen(true)}
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700"
          >
            Add New Member
          </button>
        </div>

        {/* Table remains the same */}
        <div className="overflow-x-auto">
          <DataTable data={members || []} columns={columns} />
        </div>
      </main>

      {/* MODAL IMPLEMENTATION */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add New Member"
      >
        <AddMemberForm onSuccess={() => setIsModalOpen(false)} />
      </Modal>
    </>
  );
}