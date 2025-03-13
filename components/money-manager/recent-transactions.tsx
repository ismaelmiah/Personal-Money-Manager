import { getTransactions } from "@/lib/money-manager-service"
import { formatCurrency, formatDate } from "@/lib/utils"
import { ArrowUpCircle, ArrowDownCircle } from "lucide-react"

export async function RecentTransactions() {
  const transactions = await getTransactions()

  // Sort by CreatedAt (newest first) and take the 5 most recent
  const recentTransactions = [...transactions]
    .sort((a, b) => new Date(b.CreatedAt).getTime() - new Date(a.CreatedAt).getTime())
    .slice(0, 5)

  return (
    <div className="space-y-8">
      {recentTransactions.length === 0 ? (
        <div className="text-center text-muted-foreground">No recent transactions.</div>
      ) : (
        recentTransactions.map((transaction) => (
          <div key={transaction.Id} className="flex items-center">
            <div className={`mr-4 rounded-full p-2 ${transaction.Status === "expense" ? "bg-red-100" : "bg-green-100"}`}>
              {transaction.Status === "expense" ? (
                <ArrowUpCircle className="h-4 w-4 text-red-500" />
              ) : (
                <ArrowDownCircle className="h-4 w-4 text-green-500" />
              )}
            </div>
            <div className="flex-1 space-y-1">
              <p className="text-sm font-medium leading-none">{transaction.CategoryName}</p>
              <p className="text-sm text-muted-foreground">{formatDate(transaction.CreatedAt)}</p>
            </div>
            <div className={`font-medium ${transaction.Status === "expense" ? "text-red-500" : "text-green-500"}`}>
              {transaction.Status === "expense" ? "-" : "+"}
              {formatCurrency(transaction.Amount, transaction.Currency)}
            </div>
          </div>
        ))
      )}
    </div>
  )
}

