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
        <div className="rounded-md border">
          <PaginatedTable
            data={memberStats}
            columns={columns}
            defaultPageSize={5}
          />
          {/* 
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Member</TableHead>
                <TableHead>Loaned (BDT)</TableHead>
                <TableHead>Returned (BDT)</TableHead>
                <TableHead>Balance (BDT)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {memberStats.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center">
                    No data available.
                  </TableCell>
                </TableRow>
              ) : (
                memberStats.map((stat) => (
                  <TableRow key={stat.memberId}>
                    <TableCell className="font-medium">{stat.memberName}</TableCell>
                    <TableCell>{formatCurrency(stat.totalLoaned?.BDT || 0, "BDT")}</TableCell>
                    <TableCell>{formatCurrency(stat.totalReturned?.BDT || 0, "BDT")}</TableCell>
                    <TableCell
                      className={
                        (stat.totalLoaned?.BDT || 0) - (stat.totalReturned?.BDT || 0) > 0
                          ? "text-red-500"
                          : "text-green-500"
                      }
                    >
                      {formatCurrency((stat.totalLoaned?.BDT || 0) - (stat.totalReturned?.BDT || 0), "BDT")}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table> */}
        </div>
      )}
    </>
  )
}

