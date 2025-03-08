"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts"
import { formatCurrency } from "@/lib/utils"

export function MoneyManagerAnalytics() {
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("categories")

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch("/api/money-manager/statistics")
        const data = await response.json()
        setStats(data)
      } catch (error) {
        console.error("Error fetching statistics:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  if (loading) {
    return <div className="flex justify-center items-center p-8">Loading analytics data...</div>
  }

  if (!stats) {
    return <div className="flex justify-center items-center p-8">Failed to load analytics data</div>
  }

  // Prepare data for category chart
  const categoryData = stats.categoryStats.map((cat: any) => ({
    name: cat.categoryName,
    value: cat.total,
    type: cat.categoryType,
  }))

  // Prepare data for account chart
  const accountData = stats.accountStats.map((acc: any) => ({
    name: acc.accountName,
    income: acc.income,
    expense: acc.expense,
    balance: acc.balance,
  }))

  // Prepare data for monthly chart
  const monthlyData = stats.monthlyStats.map((month: any) => ({
    name: month.month,
    income: month.income,
    expense: month.expense,
    balance: month.income - month.expense,
  }))

  return (
    <div className="space-y-4">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="w-full flex justify-start overflow-x-auto">
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="accounts">Accounts</TabsTrigger>
          <TabsTrigger value="monthly">Monthly Trends</TabsTrigger>
        </TabsList>

        <TabsContent value="categories" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Expense by Category</CardTitle>
              <CardDescription>Breakdown of expenses by category</CardDescription>
            </CardHeader>
            <CardContent className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData.filter((cat: any) => cat.type === "expense")}
                    cx="50%"
                    cy="50%"
                    labelLine={true}
                    outerRadius={150}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  >
                    {categoryData.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => [formatCurrency(value, "BDT"), ""]} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="accounts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Account Balance</CardTitle>
              <CardDescription>Income and expenses by account</CardDescription>
            </CardHeader>
            <CardContent className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={accountData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis tickFormatter={(value) => `৳${value}`} />
                  <Tooltip formatter={(value: number) => [formatCurrency(value, "BDT"), ""]} />
                  <Legend />
                  <Bar dataKey="income" name="Income" fill="#22c55e" />
                  <Bar dataKey="expense" name="Expense" fill="#ef4444" />
                  <Bar dataKey="balance" name="Balance" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="monthly" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Monthly Trends</CardTitle>
              <CardDescription>Income and expense trends over time</CardDescription>
            </CardHeader>
            <CardContent className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis tickFormatter={(value) => `৳${value}`} />
                  <Tooltip
                    formatter={(value: number) => [formatCurrency(value, "BDT"), ""]}
                    labelFormatter={(label) => `Month: ${label}`}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="income" name="Income" stroke="#22c55e" activeDot={{ r: 8 }} />
                  <Line type="monotone" dataKey="expense" name="Expense" stroke="#ef4444" />
                  <Line type="monotone" dataKey="balance" name="Balance" stroke="#3b82f6" strokeDasharray="5 5" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

// Colors for pie chart
const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8", "#82ca9d", "#ffc658", "#8dd1e1"]

