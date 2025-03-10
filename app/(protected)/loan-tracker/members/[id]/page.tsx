import { Suspense } from "react"
import { notFound } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getLoans, getMembers } from "@/lib/loan-tracker-service"
import { formatCurrency, formatDate } from "@/lib/utils"
import { ChevronLeft } from "lucide-react"
import { MemberTransactionsTable } from "@/components/member-transactions-table"
import { LoadingSpinner } from "@/components/loading-spinner"

export default async function MemberDetailsPage({ params }: { params: { Id: string } }) {
  const members = await getMembers()
  const member = members.find((m) => m.Id === params.Id)

  if (!member) {
    notFound()
  }

  const loans = await getLoans()
  const memberLoans = loans.filter((loan) => loan.MemberId === params.Id)

  // Calculate totals
  const totalLoaned = memberLoans
    .filter((loan) => loan.Status === "loan")
    .reduce((sum, loan) => sum + (loan.Currency === "BDT" ? loan.Amount : 0), 0)

  const totalReturned = memberLoans
    .filter((loan) => loan.Status === "return")
    .reduce((sum, loan) => sum + (loan.Currency === "BDT" ? loan.Amount : 0), 0)

  const balance = totalLoaned - totalReturned

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" asChild>
          <Link href="/members">
            <ChevronLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h2 className="text-xl md:text-3xl font-bold tracking-tight truncate">{member.Name}</h2>
      </div>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Loaned</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalLoaned, "BDT")}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Returned</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalReturned, "BDT")}</div>
          </CardContent>
        </Card>
        <Card className="sm:col-span-2 md:col-span-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${balance > 0 ? "text-red-500" : "text-green-500"}`}>
              {formatCurrency(balance, "BDT")}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Member Information</CardTitle>
          <CardDescription>Contact details and information</CardDescription>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Name</dt>
              <dd>{member.Name}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Email</dt>
              <dd className="break-words">{member.Email || "—"}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Phone</dt>
              <dd>{member.Phone || "—"}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Member Since</dt>
              <dd>{formatDate(member.CreatedAt)}</dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
          <CardDescription>All loans and returns for this member</CardDescription>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<LoadingSpinner />}>
            <MemberTransactionsTable MemberId={params.Id} />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  )
}

