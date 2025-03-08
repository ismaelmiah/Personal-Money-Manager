import { Suspense } from "react"
import { MoneyManagerAnalytics } from "@/components/money-manager/analytics"
import { LoadingSpinner } from "@/components/loading-spinner"

export default function ReportsPage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Reports</h2>
      </div>
      <Suspense fallback={<LoadingSpinner />}>
        <MoneyManagerAnalytics />
      </Suspense>
    </div>
  )
}

