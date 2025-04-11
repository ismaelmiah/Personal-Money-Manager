// app/components/members/EditMemberForm.tsx
'use client';
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Member } from '../../types';

interface EditMemberFormProps {
    member: Member;
    onSuccess: () => void;
}

export default function EditMemberForm({ member, onSuccess }: EditMemberFormProps) {
    const queryClient = useQueryClient();
    const [formData, setFormData] = useState<Member>(member);

    const updateMemberMutation = useMutation<Member, Error, Member>({
        mutationFn: async (updatedMember) => {
            const response = await fetch('/api/members', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedMember),
            });
            if (!response.ok) throw new Error('Failed to update member');
            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['members'] });
            onSuccess();
        },
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        updateMemberMutation.mutate(formData);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label htmlFor="Name" className="block text-sm font-medium text-gray-700">Name</label>
                <input className="p-2 w-full rounded-md border-gray-300 border focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" type="text" name="Name" placeholder="Name" id="Name" value={formData.Name} onChange={handleChange} required />
            </div>
            <div>
                <label htmlFor="Phone" className="block text-sm font-medium text-gray-700">Phone</label>
                <input className="p-2 w-full rounded-md border-gray-300 border focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" type="tel" name="Phone" placeholder="Phone" id="Phone" value={formData.Phone} onChange={handleChange} required />
            </div>
            <div>
                <label htmlFor="Email" className="block text-sm font-medium text-gray-700">Email</label>
                <input className="p-2 w-full rounded-md border-gray-300 border focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" type="email" name="Email" placeholder="Email" id="Email" value={formData.Email} onChange={handleChange} required />
            </div>
            <div>
                <label htmlFor="Relationship" className="block text-sm font-medium text-gray-700">Relationship</label>
                <input className="p-2 w-full rounded-md border-gray-300 border focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" type="text" name="Relationship" placeholder="Relationship" id="Relationship" value={formData.Relationship} onChange={handleChange} required />
            </div>
            <div className="mt-6 flex justify-end gap-4">
                <button type="button" className="hover:cursor-pointer hover:bg-gray-50 hover:text-gray-700 transition-colors duration-200 rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700" onClick={onSuccess}>Cancel</button>
                <button type="submit" disabled={updateMemberMutation.isPending} className="hover:cursor-pointer hover:bg-sky-700 transition-colors duration-200 rounded-md border border-transparent bg-sky-600 py-2 px-4 text-sm font-medium text-white shadow-sm disabled:bg-gray-400">
                    {updateMemberMutation.isPending ? 'Updating...' : 'Update Member'}
                </button>
            </div>
        </form>
    );
}