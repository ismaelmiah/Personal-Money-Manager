"use client"

import { useRouter } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { formatCurrency, formatDate } from "@/lib/utils"
import { LoadingCountdown } from "@/components/loading-countdown"
import { useAppLoans } from "@/hooks/user-app-loans"
import { EditLoanButton } from "./edit-loan-button"
import { DeleteLoanButton } from "./delete-loan-button"
import { PaginatedTable } from "../paginated-table"

export function LoansTable() {
  const router = useRouter()
  const { loans, isLoading, isError, refreshLoans, deleteLoan } = useAppLoans()

  if (isError) {
    return (
      <Alert variant="destructive">
        <AlertDescription>Failed to load loans. Please check your Google Sheets configuration.</AlertDescription>
      </Alert>
    )
  }

  const handleDeleteLoan = async (id: string) => {
    try {
      await deleteLoan(id)
      refreshLoans()
    } catch (error) {
      console.error("Error deleting loan:", error)
    }
  }

  const sortedLoans = loans

  const columns = [
    {
      header: "Date",
      accessorKey: (row:any) => formatDate(row.createdAt),
      searchable: true,
    },
    {
      header: "Member",
      accessorKey: (row:any) => row.memberName,
      className: "max-w-[120px] truncate",
      searchable: true,
    },
    {
      header: "Type",
      accessorKey: (row:any) => (
        <Badge variant={row.status === "Loan" ? "danger" : "success"}>{row.status === "Loan" ? "Loan" : "Return"}</Badge>
      ),
    },
    {
      header: "Amount",
      accessorKey: (row: any) => formatCurrency(row.amount, row.currency),
    },
    {
      header: "Notes",
      accessorKey: (row: any) => row.notes,
      className: "hidden md:table-cell",
      searchable: true,
    },
    {
      header: "Actions",
      accessorKey: (row:any) => (
        <div className="flex space-x-2">
          <EditLoanButton loan={row} onSuccess={() => refreshLoans()} />
          <DeleteLoanButton loanId={row.id} onSuccess={() => handleDeleteLoan(row.id)} />
        </div>
      ),
      className: "w-[100px]",
    },
  ]

  return (
    <>
      <LoadingCountdown message="Loading loan transactions" isLoading={isLoading} />

      {!isLoading &&
        (loans && loans.length === 0 ? (
          <div className="rounded-md border p-4">
            <p className="text-center text-muted-foreground">No loans found. Add your first loan.</p>
          </div>
        ) : (
          <PaginatedTable
            data={sortedLoans}
            columns={columns}
            searchPlaceholder="Search loans..."
            onRowClick={(row :any) => router.push(`/loan-tracker/members/${row.memberId}`)}
            maxHeight="calc(100vh - 250px)"
          />
        ))}
    </>
  )
}

