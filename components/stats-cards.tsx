import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getLoans, getMembers } from "@/lib/loan-tracker-service"
import { formatCurrency } from "@/lib/utils"
import { Users, ArrowDownCircle, ArrowUpCircle, CreditCard } from "lucide-react"

export async function StatsCards() {
  const loans = await getLoans()
  const members = await getMembers()

  const totalLoaned = loans
    .filter((loan) => loan.Status === "loan")
    .reduce((sum, loan) => sum + (loan.Currency === "BDT" ? loan.Amount : 0), 0)

  const totalReturned = loans
    .filter((loan) => loan.Status === "return")
    .reduce((sum, loan) => sum + (loan.Currency === "BDT" ? loan.Amount : 0), 0)

  const totalOutstanding = totalLoaned - totalReturned

  const totalTransactions = loans.length

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Outstanding</CardTitle>
          <CreditCard className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(totalOutstanding, "BDT")}</div>
          <p className="text-xs text-muted-foreground">Total Amount yet to be returned</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Loaned</CardTitle>
          <ArrowUpCircle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(totalLoaned, "BDT")}</div>
          <p className="text-xs text-muted-foreground">Total Amount loaned out</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Returned</CardTitle>
          <ArrowDownCircle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(totalReturned, "BDT")}</div>
          <p className="text-xs text-muted-foreground">Total Amount returned</p>
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
  )
}

