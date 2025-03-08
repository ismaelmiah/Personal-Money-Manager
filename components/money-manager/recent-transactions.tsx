import { getTransactions } from "@/lib/money-manager"
import { formatCurrency, formatDate } from "@/lib/utils"
import { ArrowUpCircle, ArrowDownCircle } from "lucide-react"

export async function RecentTransactions() {
  const transactions = await getTransactions()

  // Sort by date (newest first) and take the 5 most recent
  const recentTransactions = [...transactions]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5)

  return (
    <div className="space-y-8">
      {recentTransactions.length === 0 ? (
        <div className="text-center text-muted-foreground">No recent transactions.</div>
      ) : (
        recentTransactions.map((transaction) => (
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
              <p className="text-sm text-muted-foreground">{formatDate(transaction.date)}</p>
            </div>
            <div className={`font-medium ${transaction.type === "expense" ? "text-red-500" : "text-green-500"}`}>
              {transaction.type === "expense" ? "-" : "+"}
              {formatCurrency(transaction.amount, transaction.currency)}
            </div>
          </div>
        ))
      )}
    </div>
  )
}

