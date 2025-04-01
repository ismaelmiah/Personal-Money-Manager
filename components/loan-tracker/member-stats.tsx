"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { formatCurrency } from "@/lib/utils"
import { useAppStatistics } from "@/hooks/use-app-statistics"
import { LoadingCountdown } from "@/components/loading-countdown"
import { PaginatedTable } from "../paginated-table"

export function MemberStats() {
  const { statistics, isLoading, isError } = useAppStatistics()

  if (isError) {
    return <div className="text-center text-red-500">Failed to load statistics</div>
  }

  // Ensure statistics and memberStats exist
  const memberStats = statistics?.memberStats || []

  const columns = [
    {
      header: "Member",
      accessorKey: (row: any) => row.memberName,
      className: "font-medium",
      searchable: true,
    },
    {
      header: "Loaned",
      accessorKey: (row: any) => formatCurrency(row.totalLoaned?.BDT || 0, "BDT"),
      className: "hidden sm:table-cell truncate max-w-[200px]",
      searchable: true,
    },
    {
      header: "Returned",
      accessorKey: (row: any) => formatCurrency(row.totalReturned?.BDT || 0, "BDT"),
      className: "hidden md:table-cell",
      searchable: true,
    },
    {
      header: "Balance",
      accessorKey: (row: any) => (formatCurrency((row.totalLoaned?.BDT || 0) - (row.totalReturned?.BDT || 0), "BDT")),
      className: "hidden md:table-cell",
      searchable: true,
    }
  ]

  return (
    <>
      <LoadingCountdown message="Loading member statistics" isLoading={isLoading} />

      {!isLoading && (
        <div className="rounded-md">
          <PaginatedTable
            data={memberStats}
            columns={columns}
            defaultPageSize={7}
          />
        </div>
      )}
    </>
  )
}

