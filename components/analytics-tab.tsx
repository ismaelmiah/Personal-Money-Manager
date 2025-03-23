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
import type { Loan } from "@/lib/loan-tracker-service"
import { useAppLoans } from "@/hooks/user-app-loans"

export function AnalyticsTab() {
  const [activeTab, setActiveTab] = useState("monthly")
  const { loans, isLoading } = useAppLoans()

  if (isLoading) {
    return <div className="flex justify-center items-center p-8">Loading analytics data...</div>
  }

  // Prepare data for monthly chart
  const monthlyData = prepareMonthlyData(loans)

  // Prepare data for currency distribution
  const currencyData = preparecurrencyData(loans)

  // Prepare data for transaction types
  const typeData = prepareTypeData(loans)

  return (
    <div className="space-y-4">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="w-full flex justify-start overflow-x-auto">
          <TabsTrigger value="monthly">Monthly Trends</TabsTrigger>
          <TabsTrigger value="currency">currency Distribution</TabsTrigger>
          <TabsTrigger value="status">Transaction Types</TabsTrigger>
        </TabsList>

        <TabsContent value="monthly" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Monthly Transaction Trends</CardTitle>
              <CardDescription>Loan and return amounts by month</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px] md:h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis tickFormatter={(value) => `৳${value}`} />
                  <Tooltip
                    formatter={(value: number) => [`৳${value.toLocaleString()}`, ""]}
                    labelFormatter={(label) => `Month: ${label}`}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="loaned" name="Loans" stroke="#ef4444" activeDot={{ r: 8 }} />
                  <Line type="monotone" dataKey="returned" name="Returns" stroke="#22c55e" />
                  <Line type="monotone" dataKey="balance" name="balance" stroke="#3b82f6" strokeDasharray="5 5" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="currency" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>currency Distribution</CardTitle>
              <CardDescription>Breakdown of loans by currency</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px] md:h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={currencyData}
                    cx="50%"
                    cy="50%"
                    labelLine={true}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  >
                    {currencyData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value} transactions`, ""]} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="status" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Transaction Types</CardTitle>
              <CardDescription>Comparison of loans vs returns</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px] md:h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={typeData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`${value} transactions`, ""]} />
                  <Legend />
                  <Bar dataKey="value" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

// Helper functions to prepare data
function prepareMonthlyData(loans: Loan[]) {
  const monthlyData: Record<string, { loaned: number; returned: number; balance: number }> = {}

  // Only consider BDT for simplicity
  const bdtLoans = loans.filter((loan) => loan.currency === "BDT")

  bdtLoans.forEach((loan) => {
    const createdAt = new Date(loan.createdAt)
    const monthYear = `${createdAt.toLocaleString("default", { month: "short" })} ${createdAt.getFullYear()}`

    if (!monthlyData[monthYear]) {
      monthlyData[monthYear] = { loaned: 0, returned: 0, balance: 0 }
    }

    if (loan.status === "Loan") {
      monthlyData[monthYear].loaned += loan.amount
    } else {
      monthlyData[monthYear].returned += loan.amount
    }
  })

  // Calculate running balance
  let runningbalance = 0
  const sortedMonths = Object.keys(monthlyData).sort((a, b) => {
    const [monthA, yearA] = a.split(" ")
    const [monthB, yearB] = b.split(" ")
    return new Date(`${monthA} 1, ${yearA}`).getTime() - new Date(`${monthB} 1, ${yearB}`).getTime()
  })

  sortedMonths.forEach((month) => {
    runningbalance += monthlyData[month].loaned - monthlyData[month].returned
    monthlyData[month].balance = runningbalance
  })

  return sortedMonths.map((month) => ({
    name: month,
    loaned: monthlyData[month].loaned,
    returned: monthlyData[month].returned,
    balance: monthlyData[month].balance,
  }))
}

function preparecurrencyData(loans: Loan[]) {
  const currencyCounts: Record<string, number> = {}

  loans.forEach((loan) => {
    if (!currencyCounts[loan.currency]) {
      currencyCounts[loan.currency] = 0
    }
    currencyCounts[loan.currency]++
  })

  return Object.entries(currencyCounts).map(([name, value]) => ({
    name,
    value,
  }))
}

function prepareTypeData(loans: Loan[]) {
  const loanCount = loans.filter((loan) => loan.status === "Loan").length
  const returnCount = loans.filter((loan) => loan.status === "Return").length

  return [
    { name: "Loans", value: loanCount },
    { name: "Returns", value: returnCount },
  ]
}

// Colors for pie chart
const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"]

