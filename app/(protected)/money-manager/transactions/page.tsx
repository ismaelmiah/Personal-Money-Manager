"use client"

import { TransactionsTable } from "@/components/money-manager/transactions-table"
import { AddTransactionButton } from "@/components/money-manager/add-transaction-button"

export default function TransactionsPage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Transactions</h2>
        <AddTransactionButton />
      </div>
      <TransactionsTable />
    </div>
  )
}

