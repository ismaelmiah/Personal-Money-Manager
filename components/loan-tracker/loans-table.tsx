"use client"

import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { formatcurrency, formatDate } from "@/lib/utils"
import { useLoans } from "@/hooks/use-loans"
import { useRouter } from "next/navigation"
import { EditLoanButton } from "./edit-loan-button"
import { DeleteLoanButton } from "./delete-loan-button"
import { PaginatedTable } from "../paginated-table"

export function LoansTable() {
  const router = useRouter()
  const { loans, isLoading, isError, mutate } = useLoans()

  if (isError) {
    return (
      <Alert variant="destructive">
        <AlertDescription>Failed to load loans. Please check your Google Sheets configuration.</AlertDescription>
      </Alert>
    )
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!loans || loans.length === 0) {
    return (
      <div className="rounded-md border p-4">
        <p className="text-center text-muted-foreground">No loans found. Add your first loan.</p>
      </div>
    )
  }

  const columns = [
    {
      header: "Date",
      accessorKey: (row: any) => formatDate(row.createdAt),
      searchable: true,
    },
    {
      header: "Member",
      accessorKey: (row: any) => row.membername,
      className: "max-w-[200px] truncate",
      searchable: true,
    },
    {
      header: "Status",
      accessorKey: (row: any) => (
        <Badge variant={row.status === "Loan" ? "danger" : "success"}>{row.status === "Loan" ? "Loan" : "Return"}</Badge>
      ),
    },
    {
      header: "Amount",
      accessorKey: (row: any) => row.amount,//formatcurrency(row.amount, row.currency),
    },
    {
      header: "Notes",
      accessorKey: (row: any) => row.notes,
      className: "hidden md:table-cell",
      searchable: true,
    },
    {
      header: "Actions",
      accessorKey: (row: any) => (
        <div className="flex space-x-2">
          <EditLoanButton loan={row} onSuccess={() => mutate()} />
          <DeleteLoanButton loanid={row.id} onSuccess={() => mutate()} />
        </div>
      ),
      className: "w-[100px]",
    },
  ]

  return (
    <PaginatedTable
      data={loans}
      columns={columns}
      searchPlaceholder="Search loans..."
      onRowClick={(row: any) => router.push(`/loan-tracker/members/${row.memberid}`)}
    />
  )
}
