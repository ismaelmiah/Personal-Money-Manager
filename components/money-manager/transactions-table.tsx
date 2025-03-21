"use client"

import { useRouter } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useTransactions } from "@/hooks/use-transactions"
import { formatCurrency, formatDate } from "@/lib/utils"
import { EditTransactionButton } from "@/components/money-manager/edit-transaction-button"
import { DeleteTransactionButton } from "@/components/money-manager/delete-transaction-button"
import { LoadingCountdown } from "@/components/loading-countdown"
import { PaginatedTable } from "../paginated-table"

export function TransactionsTable() {
  const router = useRouter()
  const { transactions, isLoading, isError, mutate } = useTransactions()

  if (isError) {
    return (
      <Alert variant="destructive">
        <AlertDescription>Failed to load transactions. Please check your Google Sheets configuration.</AlertDescription>
      </Alert>
    )
  }

  if (isLoading) {
    return <LoadingCountdown message="Loading transactions" isLoading={isLoading} />
  }

  if (!transactions || transactions.length === 0) {
    return (
      <div className="rounded-md border p-4">
        <p className="text-center text-muted-foreground">No transactions found. Add your first transaction.</p>
      </div>
    )
  }

  const columns = [
    {
      header: "Date",
      accessorKey: (row:any) => formatDate(row.createdAt),
      searchable: true,
    },
    {
      header: "Category",
      accessorKey: (row:any) => formatDate(row.categoryName),
      searchable: true,
    },
    {
      header: "Account",
      accessorKey: (row:any) => formatDate(row.accountName),
      searchable: true,
    },
    {
      header: "Type",
      accessorKey: (row: any) => (
        <Badge variant={row.type === "expense" ? "danger" : "success"}>
          {row.type === "expense" ? "Expense" : "Income"}
        </Badge>
      ),
    },
    {
      header: "Amount",
      accessorKey: (row: any) => (
        <span className={row.type === "expense" ? "text-red-600" : "text-green-600"}>
          {formatCurrency(row.amount, row.currency)}
        </span>
      ),
    },
    {
      header: "Notes",
      accessorKey: (row:any) => formatDate(row.notes),
      className: "hidden md:table-cell max-w-[200px] truncate",
      searchable: true,
    },
    {
      header: "Actions",
      accessorKey: (row: any) => (
        <div className="flex space-x-2">
          <EditTransactionButton transaction={row} onSuccess={() => mutate()} />
          <DeleteTransactionButton transactionid={row.id} onSuccess={() => mutate()} />
        </div>
      ),
      className: "w-[100px]",
    },
  ]

  return <PaginatedTable data={transactions} columns={columns} searchPlaceholder="Search transactions..." />
}

