"use client"

import { useMemo } from "react"
import { formatCurrency, formatDate } from "@/lib/utils"
import { ArrowUpCircle, ArrowDownCircle } from "lucide-react"
import { useAppTransactions } from "@/hooks/use-app-transactions"
import { LoadingCountdown } from "@/components/loading-countdown"

export function RecentTransactions() {
  const { transactions, isLoading, isError } = useAppTransactions()

  // Get 5 most recent transactions
  const recentTransactions = useMemo(() => {
    if (!transactions || transactions.length === 0) return []

    return [...transactions].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5)
  }, [transactions])

  if (isLoading) {
    return <LoadingCountdown message="Loading recent transactions" isLoading={isLoading} />
  }

  if (isError) {
    return <div className="text-center text-red-500">Failed to load recent transactions</div>
  }

  if (recentTransactions.length === 0) {
    return <div className="text-center text-muted-foreground">No recent transactions.</div>
  }

  return (
    <div className="space-y-8">
      {recentTransactions.map((transaction) => (
        <div key={transaction.id} className="flex items-center">
          <div className={`mr-4 rounded-full p-2 ${transaction.type === "expense" ? "bg-red-100" : "bg-green-100"}`}>
            {transaction.type === "expense" ? (
              <ArrowUpCircle className="h-4 w-4 text-red-500" />
            ) : (
              <ArrowDownCircle className="h-4 w-4 text-green-500" />
            )}
          </div>
          <div className="flex-1 space-y-1">
            <p className="text-sm font-medium leading-none">{transaction.categoryName}</p>
            <p className="text-sm text-muted-foreground">{formatDate(transaction.createdAt)}</p>
          </div>
          <div className={`font-medium ${transaction.type === "expense" ? "text-red-500" : "text-green-500"}`}>
            {transaction.type === "expense" ? "-" : "+"}
            {formatCurrency(transaction.amount, transaction.currency)}
          </div>
        </div>
      ))}
    </div>
  )
}

