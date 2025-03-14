import { Suspense } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { memberStats } from "@/components/member-stats"
import { currencyStats } from "@/components/currency-stats"
import { LoadingSpinner } from "@/components/loading-spinner"

export default function StatisticsPage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Statistics</h2>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>member Statistics</CardTitle>
            <CardDescription>Total loans and returns by member</CardDescription>
          </CardHeader>
          <CardContent>
            <Suspense fallback={<LoadingSpinner />}>
              <memberStats />
            </Suspense>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>currency Statistics</CardTitle>
            <CardDescription>Loans and returns by currency</CardDescription>
          </CardHeader>
          <CardContent>
            <Suspense fallback={<LoadingSpinner />}>
              <currencyStats />
            </Suspense>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

