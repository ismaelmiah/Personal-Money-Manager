import { getLoans } from "@/lib/loan-tracker-service"
import { formatCurrency, formatDate } from "@/lib/utils"
import { ArrowUpCircle, ArrowDownCircle } from "lucide-react"

export async function RecentLoans() {
  const loans = await getLoans()

  // Sort by CreatedAt (newest first) and take the 5 most recent
  const recentLoans = [...loans].sort((a, b) => new Date(b.CreatedAt).getTime() - new Date(a.CreatedAt).getTime()).slice(0, 4)

  return (
    <div className="space-y-8">
      {recentLoans.length === 0 ? (
        <div className="text-center text-muted-foreground">No recent transactions.</div>
      ) : (
        recentLoans.map((loan) => (
          <div key={loan.Id} className="flex items-center">
            <div className={`mr-4 rounded-full p-2 ${loan.Status === "Loan" ? "bg-red-100" : "bg-green-100"}`}>
              {loan.Status === "Loan" ? (
                <ArrowUpCircle className="h-4 w-4 text-red-500" />
              ) : (
                <ArrowDownCircle className="h-4 w-4 text-green-500" />
              )}
            </div>
            <div className="flex-1 space-y-1">
              <p className="text-sm font-medium leading-none">{loan.MemberName}</p>
              <p className="text-sm text-muted-foreground">{loan.CreatedAt}</p>
            </div>
            <div className={`font-medium ${loan.Status === "Loan" ? "text-red-500" : "text-green-500"}`}>
              {loan.Status === "Loan" ? "-" : "+"}
              {formatCurrency(loan.Amount, loan.Currency)}
            </div>
          </div>
        ))
      )}
    </div>
  )
}

