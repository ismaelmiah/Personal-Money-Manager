"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrency } from "@/lib/utils"
import { Wallet, ArrowDownCircle, ArrowUpCircle, CreditCard } from "lucide-react"
import { LoadingCountdown } from "@/components/loading-countdown"
import { useMoneyManagerStatistics } from "@/hooks/use-money-manager-statistics"

export function MoneyManagerStatsCards() {
  const { statistics, isLoading, isError } = useMoneyManagerStatistics()

  if (isLoading) {
    return <LoadingCountdown message="Loading statistics" isLoading={isLoading} />
  }

  if (isError) {
    return <div className="text-center text-red-500">Failed to load statistics</div>
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Balance</CardTitle>
          <CreditCard className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(statistics.balance, "BDT")}</div>
          <p className="text-xs text-muted-foreground">Current balance across all accounts</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Income</CardTitle>
          <ArrowDownCircle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(statistics.totalIncome, "BDT")}</div>
          <p className="text-xs text-muted-foreground">Total income received</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
          <ArrowUpCircle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(statistics.totalExpense, "BDT")}</div>
          <p className="text-xs text-muted-foreground">Total expenses paid</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Accounts</CardTitle>
          <Wallet className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{statistics.accountStats.length}</div>
          <p className="text-xs text-muted-foreground">Total registered accounts</p>
        </CardContent>
      </Card>
    </div>
  )
}

