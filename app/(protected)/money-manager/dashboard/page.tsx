"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MoneyManagerOverview } from "@/components/money-manager/overview"
import { RecentTransactions } from "@/components/money-manager/recent-transactions"
import { MoneyManagerStatsCards } from "@/components/money-manager/stats-cards"
import { MoneyManagerAnalytics } from "@/components/money-manager/analytics"

export default function MoneyManagerDashboardPage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-xl md:text-3xl font-bold tracking-tight">Money Manager Dashboard</h2>
      </div>
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="w-full flex justify-start overflow-x-auto">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="space-y-4">
          <MoneyManagerStatsCards />
          <div className="grid gap-4 grid-cols-1 lg:grid-cols-7">
            <Card className="lg:col-span-4">
              <CardHeader>
                <CardTitle>Monthly Overview</CardTitle>
                <CardDescription>View your income and expense trends over time.</CardDescription>
              </CardHeader>
              <CardContent className="pl-2">
                <MoneyManagerOverview />
              </CardContent>
            </Card>
            <Card className="lg:col-span-3">
              <CardHeader>
                <CardTitle>Recent Transactions</CardTitle>
                <CardDescription>Your most recent financial transactions.</CardDescription>
              </CardHeader>
              <CardContent>
                <RecentTransactions />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        <TabsContent value="analytics" className="space-y-4">
          <MoneyManagerAnalytics />
        </TabsContent>
      </Tabs>
    </div>
  )
}

