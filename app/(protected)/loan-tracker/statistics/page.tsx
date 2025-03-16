import { Suspense } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { MemberStats } from "@/components/loan-tracker/member-stats"
import { CurrencyStats } from "@/components/loan-tracker/currency-stats"
import { LoadingSpinner } from "@/components/loading-spinner"
import { useStatistics } from "@/hooks/use-statistics"
import { getStatistics } from "@/lib/loan-tracker-service"

export default async function StatisticsPage() {
  
  //const { statistics, isLoading, isError, mutate } = useStatistics()
  const {memberStats, currencyStats} =await getStatistics();
  
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
              <MemberStats memberStats={memberStats} />
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
              <CurrencyStats currencyStats={currencyStats} />
            </Suspense>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

