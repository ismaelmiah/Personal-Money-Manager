'use client';

import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Transaction, Account, Category } from '../../types';
import Modal from '@/app/components/Modal';
import AddTransactionForm from '@/app/components/expenses/AddTransactionForm';
import DataTable, { Column } from '@/app/components/DataTable';
import EditTransactionForm from '@/app/components/expenses/EditTransactionForm';

// Helper function to find item name from ID
const findNameById = (items: {Id: string, Name: string}[] | undefined, id: string | undefined) => {
    if (!items || !id) return '';
    return items.find(item => item.Id === id)?.Name || '';
};

export default function TransactionsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  // Fetch all necessary data for displaying the table enrichments
  const { data: transactions, isLoading: isLoadingTransactions } = useQuery<Transaction[]>({
    queryKey: ['transactions'],
    queryFn: () => fetch('/api/transactions').then(res => res.json()).then(data => data.sort((a: Transaction, b: Transaction) => new Date(b.CreatedAt).getTime() - new Date(a.CreatedAt).getTime())),
  });

  const { data: accounts } = useQuery<Account[]>({
    queryKey: ['accounts'],
    queryFn: () => fetch('/api/accounts').then(res => res.json())
  });

  const { data: categories } = useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn: () => fetch('/api/categories').then(res => res.json())
  });

  const isLoading = isLoadingTransactions || !accounts || !categories;

  if (isLoading) return <div>Loading transactions...</div>;

  if (!transactions || transactions.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No transactions found. Add one to get started!</p>
        <button
          onClick={() => setIsModalOpen(true)}
          className="mt-4 rounded-md bg-sky-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-sky-700"
        >
          Add Transaction
        </button>
      </div>
    );
  }

  
  const columns: Column<Transaction>[] = [
    { header: 'Date', accessorKey: 'CreatedAt', cell: (info) => new Date(info.CreatedAt).toLocaleDateString() },
    { header: 'Type', accessorKey: 'Type' },
    { header: 'Details', accessorKey: 'Notes', cell: (info) => (
        <div>
            <p className="font-semibold">{/* ... logic to show category or transfer details ... */}</p>
            <p className="text-sm text-gray-600">{info.Notes}</p>
        </div>
    )},
    { header: 'Amount', accessorKey: 'Amount', cell: (info) => (
        <span className={info.Type === 'Expense' ? 'text-red-700' : 'text-green-700'}>
            {info.Type === 'Expense' ? '-' : '+'} {info.Amount.toLocaleString()}
        </span>
    )},
    {
      header: 'Actions',
      accessorKey: 'Id',
      cell: (info) => (
        <button onClick={() => setEditingTransaction(info)} className="text-sky-600 hover:underline">
          Edit
        </button>
      ),
    },
  ];

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Transactions</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="rounded-md bg-sky-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-sky-700"
        >
          Add Transaction
        </button>
      </div>
      
      <div className="overflow-x-auto">
        <DataTable data={transactions} columns={columns} />
        {/* <table className="min-w-full bg-white border rounded-lg shadow">
          <thead className="bg-gray-50">
            <tr>
              <th className="py-3 px-4 border-b text-left">Date</th>
              <th className="py-3 px-4 border-b text-left">Type</th>
              <th className="py-3 px-4 border-b text-left">Details</th>
              <th className="py-3 px-4 border-b text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            {transactions?.map((t) => (
              <tr key={t.Id} className="hover:bg-gray-50">
                <td className="py-3 px-4 border-b text-sm text-gray-500">
                  {t.CreatedAt ? new Date(t.CreatedAt).toLocaleDateString() : 'N/A'}
                </td>
                <td className="py-3 px-4 border-b">
                   <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                     t.Type === 'Income' ? 'bg-green-100 text-green-800' : 
                     t.Type === 'Expense' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                   }`}>
                    {t.Type}
                  </span>
                </td>
                <td className="py-3 px-4 border-b">
                    <p className="font-semibold">
                        {t.Type === 'Transfer' ? 
                            `${findNameById(accounts, t.FromAccountId)} → ${findNameById(accounts, t.ToAccountId)}` :
                            findNameById(categories, t.CategoryId)
                        }
                    </p>
                    <p className="text-sm text-gray-600">{t.Notes}</p>
                </td>
                <td className={`py-3 px-4 border-b text-right font-medium ${t.Type === 'Expense' ? 'text-red-700' : 'text-green-700'}`}>
                  {t.Type === 'Expense' ? '-' : '+'} {t.Amount ? t.Amount.toLocaleString() : '0'} {t.Currency}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        */}
      </div>

      <Modal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add New Transaction"
      >
        <AddTransactionForm onSuccess={() => setIsModalOpen(false)} />
      </Modal>

      <Modal isOpen={!!editingTransaction} onClose={() => setEditingTransaction(null)} title="Edit Transaction">
      {editingTransaction && (
        <EditTransactionForm 
          transaction={editingTransaction}
          onSuccess={() => setEditingTransaction(null)} 
        />
      )}
    </Modal>
    </>
    
  );
}