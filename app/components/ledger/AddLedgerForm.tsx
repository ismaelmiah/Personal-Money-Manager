'use client';

import { useMemo, useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Ledger, LedgerType, Member } from '../../types';
import { format } from 'date-fns';

type LedgerFormData = Omit<Ledger, 'Id' | 'MemberName'>;
// Reusable styling for our new buttons
const typeButtonClasses = (isActive: boolean) =>
  `hover:cursor-pointer w-full p-3 text-sm font-semibold rounded-lg border-2 transition-colors ${isActive
    ? 'bg-sky-600 border-blue-600 text-white shadow-md'
    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
  }`;

export default function AddLedgerForm({ onSuccess }: { onSuccess: () => void }) {
  const queryClient = useQueryClient();

  // Fetch members to populate the dropdown
  const { data: members, isLoading: isLoadingMembers } = useQuery<Member[]>({
    queryKey: ['members'],
    queryFn: () => fetch('/api/members').then((res) => res.json()),
  });

  const [formData, setFormData] = useState<Partial<LedgerFormData>>({
    Type: 'Loan', // Default type
    Currency: 'BDT', // Default currency
    CreatedAt: new Date().toISOString().slice(0, 16),
  });
  const [memberSearch, setMemberSearch] = useState(''); // State for the member search input
  const [selectedMemberName, setSelectedMemberName] = useState(''); // State to hold the name for display
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // --- Derived State for Search ---
  const filteredMembers = useMemo(() => {
    if (!members) return [];
    if (!memberSearch) return members;
    return members.filter(member =>
      member.Name.toLowerCase().includes(memberSearch.toLowerCase())
    );
  }, [members, memberSearch]);


  const addLedgerMutation = useMutation<Ledger, Error, LedgerFormData & { MemberName: string }>({
    mutationFn: async (newLedgerData) => {
      const response = await fetch('/api/ledger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newLedgerData),
      });
      if (!response.ok) throw new Error('Failed to create ledger record');
      return response.json();
    },
    onSuccess: () => {
      // Invalidate both ledgers and members queries, as a new loan/return affects a member's balance
      queryClient.invalidateQueries({ queryKey: ['ledgers'] });
      queryClient.invalidateQueries({ queryKey: ['members'] });
      onSuccess();
    },
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    const isNumber = ['Amount', 'Equivalent to BDT'].includes(name);
    setFormData((prev) => ({ ...prev, [name]: isNumber ? parseFloat(value) : value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const selectedMember = members?.find(m => m.Id === formData.MemberId);
    if (!selectedMember || !formData.Amount) {
      alert("Please select a member and enter an amount.");
      return;
    }
    const createdAt = format(new Date(formData.CreatedAt || new Date()), 'dd/MM/yyyy HH:mm:ss');
    addLedgerMutation.mutate({
      ...formData as LedgerFormData, // We are sure it's valid here
      MemberName: selectedMember.Name,
      CreatedAt: createdAt,
    });
  };

  // --- Event Handlers ---
  const handleTypeSelect = (type: LedgerType) => {
    setFormData(prev => ({ ...prev, Type: type }));
  };

  const handleMemberSelect = (member: Member) => {
    setFormData(prev => ({ ...prev, MemberId: member.Id }));
    setSelectedMemberName(member.Name);
    setMemberSearch(member.Name); // Fill input with selected name
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* 1. Member Search and Selection */}
      <div className="relative">
        <label htmlFor="memberSearch" className="block text-sm font-medium text-gray-700 mb-1">Member</label>
        <input
          id="memberSearch"
          type="text"
          ref={inputRef}
          value={memberSearch}
          onFocus={() => setDropdownOpen(true)}
          onBlur={() => setTimeout(() => setDropdownOpen(false), 150)} // Delay to allow click
          onChange={(e) => {
            setMemberSearch(e.target.value);
            if (e.target.value !== selectedMemberName) {
              setFormData(prev => ({ ...prev, MemberId: undefined }));
              setSelectedMemberName('');
            }
          }}
          placeholder={isLoadingMembers ? "Loading members..." : "Search for a member..."}
          className="w-full p-2 border border-gray-300 rounded-md shadow-sm"
          autoComplete="off"
        />
        {dropdownOpen && members && members.length > 0 && !formData.MemberId && (
          <ul
            className={`absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg
              ${memberSearch ? "max-h-40" : "max-h-72"} overflow-y-auto transition-all duration-200`}
          >
            {(memberSearch ? filteredMembers : members).map(member => (
              <li
                key={member.Id}
                onMouseDown={() => { // Use onMouseDown to select before blur
                  handleMemberSelect(member);
                  setDropdownOpen(false);
                }}
                className="p-2 cursor-pointer hover:bg-sky-50"
              >
                {member.Name}
              </li>
            ))}
            {(memberSearch ? filteredMembers : members).length === 0 && (
              <li className="p-2 text-gray-400">No members found</li>
            )}
          </ul>
        )}
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
        <input type="datetime-local" name="CreatedAt" id="CreatedAt" value={formData.CreatedAt} onChange={handleChange} required
          className="w-full p-2 border border-gray-300 rounded-md shadow-sm"
          title="Select the date and time for this record"
          placeholder="Select date and time" />
      </div>

      {/* 2. Button-style Type Selector */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Type of Record</label>
        <div className="grid grid-cols-2 gap-4">
          <button type="button" onClick={() => handleTypeSelect('Loan')} className={typeButtonClasses(formData.Type === 'Loan')}>
            Loan (I Gave)
          </button>
          <button type="button" onClick={() => handleTypeSelect('Return')} className={typeButtonClasses(formData.Type === 'Return')}>
            Return (I Received)
          </button>
        </div>
      </div>

      {/* Amount, Currency, Notes ... same as before but with better styling */}
      <div className="flex gap-4">
        <div className="flex-grow">
          <label htmlFor="Amount" className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
          <input type="number" step="0.01" name="Amount" id="Amount" placeholder='Amount' onChange={handleChange} required className="w-full p-2 border border-gray-300 rounded-md shadow-sm" />
        </div>
        <div className="w-1/3">
          <label htmlFor="Currency" className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
          <select
            name="Currency"
            id="Currency"
            value={formData.Currency}
            onChange={handleChange}
            required
            className="w-full p-2 border border-gray-300 rounded-md shadow-sm"
          >
            <option value="BDT">BDT</option>
            <option value="GBP">GBP</option>
            <option value="USD">USD</option>
          </select>
        </div>
      </div>
      <div>
        <label htmlFor="Notes" className="block text-sm font-medium text-gray-700 mb-1">Notes (Optional)</label>
        <textarea name="Notes" id="Notes" onChange={handleChange} rows={3} className="w-full p-2 border border-gray-300 rounded-md shadow-sm"></textarea>
      </div>

      {/* Submit Button */}
      <div className="pt-4 border-t border-gray-200">
        <button type="submit" disabled={addLedgerMutation.isPending} className="hover:cursor-pointer w-full bg-sky-600 text-white font-bold py-3 px-4 rounded-lg shadow-md hover:bg-sky-700 disabled:bg-gray-400 transition-all">
          {addLedgerMutation.isPending ? 'Saving...' : 'Add Record to Ledger'}
        </button>
      </div>
    </form>
  );
}