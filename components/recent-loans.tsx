"use client"

import { formatCurrency, formatDate } from "@/lib/utils"
import { ArrowUpCircle, ArrowDownCircle } from "lucide-react"
import { LoadingCountdown } from "@/components/loading-countdown"
import { useMemo } from "react"
import { useAppLoans } from "@/hooks/user-app-loans"

export function RecentLoans() {
  const { loans, isLoading, isError } = useAppLoans()

  // Get 5 most recent loans
  const recentLoans = useMemo(() => {
    if (!loans || loans.length === 0) return []

    return [...loans].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5)
  }, [loans])

  if (isLoading) {
    return <LoadingCountdown message="Loading recent transactions" isLoading={isLoading} />
  }

  if (isError) {
    return <div className="text-center text-red-500">Failed to load recent transactions</div>
  }

  if (recentLoans.length === 0) {
    return <div className="text-center text-muted-foreground">No recent transactions.</div>
  }

  return (
    <div className="space-y-8">
      {recentLoans.map((loan) => (
        <div key={loan.id} className="flex items-center">
          <div className={`mr-4 rounded-full p-2 ${loan.status === "Loan" ? "bg-red-100" : "bg-green-100"}`}>
            {loan.status === "Loan" ? (
              <ArrowUpCircle className="h-4 w-4 text-red-500" />
            ) : (
              <ArrowDownCircle className="h-4 w-4 text-green-500" />
            )}
          </div>
          <div className="flex-1 space-y-1">
            <p className="text-sm font-medium leading-none">{loan.memberName}</p>
            <p className="text-sm text-muted-foreground">{formatDate(loan.createdAt)}</p>
          </div>
          <div className={`font-medium ${loan.status === "Loan" ? "text-red-500" : "text-green-500"}`}>
            {loan.status === "Loan" ? "-" : "+"}
            {formatCurrency(loan.amount, loan.currency)}
          </div>
        </div>
      ))}
    </div>
  )
}

