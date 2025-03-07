import { Suspense } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Overview } from "@/components/overview"
import { RecentLoans } from "@/components/recent-loans"
import { StatsCards } from "@/components/stats-cards"
import { AnalyticsTab } from "@/components/analytics-tab"
import { LoadingSpinner } from "@/components/loading-spinner"

export default function LoanTrackerDashboardPage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-xl md:text-3xl font-bold tracking-tight">Dashboard</h2>
      </div>
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="w-full flex justify-start overflow-x-auto">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="space-y-4">
          <Suspense fallback={<LoadingSpinner />}>
            <StatsCards />
          </Suspense>
          <div className="grid gap-4 grid-cols-1 lg:grid-cols-7">
            <Card className="lg:col-span-4">
              <CardHeader>
                <CardTitle>Overview</CardTitle>
                <CardDescription>View your loan and repayment trends over time.</CardDescription>
              </CardHeader>
              <CardContent className="pl-2">
                <Suspense fallback={<LoadingSpinner />}>
                  <Overview />
                </Suspense>
              </CardContent>
            </Card>
            <Card className="lg:col-span-3">
              <CardHeader>
                <CardTitle>Recent Loans</CardTitle>
                <CardDescription>Your most recent loan transactions.</CardDescription>
              </CardHeader>
              <CardContent>
                <Suspense fallback={<LoadingSpinner />}>
                  <RecentLoans />
                </Suspense>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        <TabsContent value="analytics" className="space-y-4">
          <Suspense fallback={<LoadingSpinner />}>
            <AnalyticsTab />
          </Suspense>
        </TabsContent>
      </Tabs>
    </div>
  )
}

