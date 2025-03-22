"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrency, formatDate } from "@/lib/utils"
import { ChevronLeft } from "lucide-react"
import { MemberTransactionsTable } from "@/components/member-transactions-table"
import { LoadingCountdown } from "@/components/loading-countdown"
import { useMembers } from "@/hooks/use-members"
import { useLoans } from "@/hooks/use-loans"

export function MemberDetailsPageClient({ id }: { id: string }) {
  const router = useRouter()
  const { members, isLoading: membersLoading } = useMembers()
  const { loans, isLoading: loansLoading } = useLoans()
  const [member, setMember] = useState<any>(null)
  const [memberLoans, setMemberLoans] = useState<any[]>([])
  const [totalLoaned, setTotalLoaned] = useState(0)
  const [totalReturned, setTotalReturned] = useState(0)

  useEffect(() => {
    if (!membersLoading && members.length > 0) {
      const foundMember = members.find((m) => m.id === id)
      if (foundMember) {
        setMember(foundMember)
      } else {
        router.push("/loan-tracker/members")
      }
    }
  }, [members, membersLoading, id, router])

  useEffect(() => {
    if (!loansLoading && loans.length > 0 && member) {
      const filteredLoans = loans.filter((loan) => loan.memberId === id)
      setMemberLoans(filteredLoans)

      // Calculate totals
      const loaned = filteredLoans
        .filter((loan) => loan.status === "Loan")
        .reduce((sum, loan) => sum + (loan.currency === "BDT" ? loan.amount : 0), 0)

      const returned = filteredLoans
        .filter((loan) => loan.status === "Return")
        .reduce((sum, loan) => sum + (loan.currency === "BDT" ? loan.amount : 0), 0)

      setTotalLoaned(loaned)
      setTotalReturned(returned)
    }
  }, [loans, loansLoading, member, id])

  if (membersLoading || !member) {
    return <LoadingCountdown message="Loading member details" isLoading={membersLoading} />
  }

  const balance = totalLoaned - totalReturned

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" asChild>
          <Link href="/loan-tracker/members">
            <ChevronLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h2 className="text-xl md:text-3xl font-bold tracking-tight truncate">{member.name}</h2>
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
              <dd>{member.name}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Email</dt>
              <dd className="break-words">{member.email || "—"}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Phone</dt>
              <dd>{member.phone || "—"}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Member Since</dt>
              <dd>{formatDate(member.createdAt)}</dd>
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
          <MemberTransactionsTable memberId={id} />
        </CardContent>
      </Card>
    </div>
  )
}