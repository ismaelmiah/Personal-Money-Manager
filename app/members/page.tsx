'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Modal from '../components/Modal'; // Import Modal
import AddMemberForm from '../components/members/AddMemberForm'; // Import the new form
import { Member } from '../types';
import { parse } from 'date-fns';
import DataTable, { Column } from '../components/DataTable';
import Link from 'next/link';
import EditMemberForm from '../components/members/EditMemberForm';

// Main Page Component
export default function MembersPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);

  const { data: members, isLoading, isError } = useQuery<Member[]>({
    queryKey: ['members'],
    queryFn: () => fetch('/api/members').then((res) => res.json()).then(data => data.sort((a: Member, b: Member) => a.Name.localeCompare(b.Name))),
  });

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error loading members.</div>;

  const columns: Column<Member>[] = [
    {
      header: 'Name', accessorKey: 'Name', cell: (info) => (
        <Link href={`/members/${info.Id}`} className='text-sky-600 font-semibold hover:underline'>
          {info.Name}
        </Link>
      )
    },
    { header: 'Phone', accessorKey: 'Phone' },
    { header: 'Relationship', accessorKey: 'Relationship' },
    { header: 'Current Loan', accessorKey: 'Current Loan' },
    { header: 'Total Returned', accessorKey: 'Total Returned' },
    { header: 'Date Joined', accessorKey: 'CreatedAt', cell: (info: { CreatedAt: string }) => parse(info.CreatedAt, 'dd/MM/yyyy HH:mm:ss', new Date()).toLocaleDateString() },
    {
      header: 'Actions',
      cell: (info: Member) => (
        <button onClick={() => setEditingMember(info)} className="text-blue-600 hover:underline hover:cursor-pointer">
          Edit
        </button>
      ),
    },
  ];

  return (
    <>
      <main className='mt-6'>
        <DataTable data={members || []} columns={columns} title='Members' setIsModalOpen={setIsModalOpen} />
      </main>

      {/* MODAL IMPLEMENTATION */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add New Member"
      >
        <AddMemberForm onSuccess={() => setIsModalOpen(false)} />
      </Modal>

      {/* Edit Modal */}
      <Modal isOpen={!!editingMember} onClose={() => setEditingMember(null)} title="Edit Member">
        {editingMember && <EditMemberForm member={editingMember} onSuccess={() => setEditingMember(null)} />}
      </Modal>
    </>
  );
}