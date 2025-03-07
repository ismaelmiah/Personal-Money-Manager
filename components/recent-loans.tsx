import { getLoans } from "@/lib/google-sheets"
import { formatCurrency, formatDate } from "@/lib/utils"
import { ArrowUpCircle, ArrowDownCircle } from "lucide-react"

export async function RecentLoans() {
  const loans = await getLoans()

  // Sort by date (newest first) and take the 5 most recent
  const recentLoans = [...loans].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5)

  return (
    <div className="space-y-8">
      {recentLoans.length === 0 ? (
        <div className="text-center text-muted-foreground">No recent transactions.</div>
      ) : (
        recentLoans.map((loan) => (
          <div key={loan.id} className="flex items-center">
            <div className={`mr-4 rounded-full p-2 ${loan.type === "loan" ? "bg-red-100" : "bg-green-100"}`}>
              {loan.type === "loan" ? (
                <ArrowUpCircle className="h-4 w-4 text-red-500" />
              ) : (
                <ArrowDownCircle className="h-4 w-4 text-green-500" />
              )}
            </div>
            <div className="flex-1 space-y-1">
              <p className="text-sm font-medium leading-none">{loan.memberName}</p>
              <p className="text-sm text-muted-foreground">{formatDate(loan.date)}</p>
            </div>
            <div className={`font-medium ${loan.type === "loan" ? "text-red-500" : "text-green-500"}`}>
              {loan.type === "loan" ? "-" : "+"}
              {formatCurrency(loan.amount, loan.currency)}
            </div>
          </div>
        ))
      )}
    </div>
  )
}

