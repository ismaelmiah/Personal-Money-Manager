// app/components/DataTable.tsx
'use client';

import React, { useState, useMemo } from 'react';

// A generic type for a row object that must include an ID
export type DataItem = { Id: string; CreatedAt: string };

// Define a generic column type
export type Column<T extends DataItem> = {
  header: string;
  // Use accessorKey for simple value access, or a custom cell renderer for complex output
  accessorKey?: keyof T;
  cell?: (item: T) => React.ReactNode;
};

type DataTableProps<T extends DataItem> = {
  data: T[];
  columns: Column<T>[];
  title: string;
  setIsModalOpen: (isOpen: boolean) => void;
};

export default function DataTable<T extends DataItem>({ data, columns, title, setIsModalOpen }: DataTableProps<T>) {
  const [filter, setFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;

  // --- Logic for Sorting, Filtering, Pagination ---

  const sortedData = useMemo(() => {
    // Default sort by CreatedAt descending
    return [...data].sort((a, b) => new Date(b.CreatedAt).getTime() - new Date(a.CreatedAt).getTime());
  }, [data]);

  const filteredData = useMemo(() => {
    if (!filter) return sortedData;
    return sortedData.filter(item =>
      Object.values(item).some(value =>
        String(value).toLowerCase().includes(filter.toLowerCase())
      )
    );
  }, [sortedData, filter]);

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * rowsPerPage;
    return filteredData.slice(startIndex, startIndex + rowsPerPage);
  }, [filteredData, currentPage, rowsPerPage]);

  const totalPages = Math.ceil(filteredData.length / rowsPerPage);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  return (
    <div className="w-full">
      <div className="flex justify-between items-start mb-2">
        <h1 className="text-3xl font-bold">{title}</h1>
        <div className="flex items-center gap-4">
          <input
            type="text"
            placeholder="Search table..."
            value={filter}
            onChange={(e) => {
              setFilter(e.target.value);
              setCurrentPage(1); // Reset to first page on new search
            }}
            className="p-2 border rounded-md w-full sm:w-auto"
          />
          <button
            onClick={() => setIsModalOpen(true)}
            className="rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-green-700"
          >
            Add New
          </button>

        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto bg-white border border-gray-200 rounded-lg shadow-sm">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.header}
                  scope="col"
                  // Slightly bolder and more spaced out headers
                  className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider"
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {paginatedData.length > 0 ? (
              paginatedData.map((item, index) => (
                // Add a subtle zebra stripe effect
                <tr key={item.Id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}>
                  {columns.map((column) => (
                    <td key={column.header} className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                       {column.cell ? column.cell(item) : column.accessorKey ? String(item[column.accessorKey]) : null}
                    </td>
                  ))}
                </tr>
              ))) : (
              <tr>
                <td colSpan={columns.length} className="px-6 py-12 text-center text-sm text-gray-500">
                  No records found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          // Better button style
          className="px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Previous
        </button>
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          // Better button style
          className="px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Next
        </button>
      </div>
    </div>
  );
}