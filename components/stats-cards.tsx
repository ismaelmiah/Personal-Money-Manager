"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrency } from "@/lib/utils"
import { Users, ArrowDownCircle, ArrowUpCircle, CreditCard } from "lucide-react"
import { useAppMembers } from "@/hooks/use-app-members"
import { LoadingCountdown } from "@/components/loading-countdown"
import { useAppLoans } from "@/hooks/user-app-loans"

export function StatsCards() {
  const { loans, isLoading: loansLoading, isError: loansError } = useAppLoans()
  const { members, isLoading: membersLoading, isError: membersError } = useAppMembers()

  const isLoading = loansLoading || membersLoading
  const isError = loansError || membersError
  if (isError) {
    return <div className="text-center text-red-500">Failed to load statistics</div>
  }

  // Calculate statistics
  const totalLoaned = loans
    .filter((loan) => loan.status === "Loan")
    .reduce((sum, loan) => sum + (loan.currency === "BDT" ? loan.amount : 0), 0)

  const totalReturned = loans
    .filter((loan) => loan.status === "Return")
    .reduce((sum, loan) => sum + (loan.currency === "BDT" ? loan.amount : 0), 0)

  const totalOutstanding = totalLoaned - totalReturned
  const totalTransactions = loans.length

  return (
    <>
      <LoadingCountdown message="Loading statistics" isLoading={isLoading} />

      {!isLoading && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Outstanding</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(totalOutstanding, "BDT")}</div>
              <p className="text-xs text-muted-foreground">Total amount yet to be returned</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Loaned</CardTitle>
              <ArrowUpCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(totalLoaned, "BDT")}</div>
              <p className="text-xs text-muted-foreground">Total amount loaned out</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Returned</CardTitle>
              <ArrowDownCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(totalReturned, "BDT")}</div>
              <p className="text-xs text-muted-foreground">Total amount returned</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Members</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{members.length}</div>
              <p className="text-xs text-muted-foreground">Total registered members</p>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  )
}

