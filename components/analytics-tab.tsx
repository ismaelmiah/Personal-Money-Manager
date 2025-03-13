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

export function AnalyticsTab() {
  const [loans, setLoans] = useState<Loan[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("monthly")

  useEffect(() => {
    const fetchLoans = async () => {
      try {
        const response = await fetch("/api/loans")
        const data = await response.json()
        setLoans(data)
      } catch (error) {
        console.error("Error fetching loans:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchLoans()
  }, [])

  if (loading) {
    return <div className="flex justify-center items-center p-8">Loading analytics data...</div>
  }

  // Prepare data for monthly chart
  const monthlyData = prepareMonthlyData(loans)

  // Prepare data for Currency distribution
  const currencyData = prepareCurrencyData(loans)

  // Prepare data for transaction types
  const typeData = prepareTypeData(loans)

  return (
    <div className="space-y-4">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="w-full flex justify-start overflow-x-auto">
          <TabsTrigger value="monthly">Monthly Trends</TabsTrigger>
          <TabsTrigger value="Currency">Currency Distribution</TabsTrigger>
          <TabsTrigger value="Status">Transaction Types</TabsTrigger>
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
                  <Line type="monotone" dataKey="balance" name="Balance" stroke="#3b82f6" strokeDasharray="5 5" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="Currency" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Currency Distribution</CardTitle>
              <CardDescription>Breakdown of loans by Currency</CardDescription>
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

        <TabsContent value="Status" className="space-y-4">
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
  const bdtLoans = loans.filter((loan) => loan.Currency === "BDT")

  bdtLoans.forEach((loan) => {
    const CreatedAt = new Date(loan.CreatedAt)
    const monthYear = `${CreatedAt.toLocaleString("default", { month: "short" })} ${CreatedAt.getFullYear()}`

    if (!monthlyData[monthYear]) {
      monthlyData[monthYear] = { loaned: 0, returned: 0, balance: 0 }
    }

    if (loan.Status === "Loan") {
      monthlyData[monthYear].loaned += loan.Amount
    } else {
      monthlyData[monthYear].returned += loan.Amount
    }
  })

  // Calculate running balance
  let runningBalance = 0
  const sortedMonths = Object.keys(monthlyData).sort((a, b) => {
    const [monthA, yearA] = a.split(" ")
    const [monthB, yearB] = b.split(" ")
    return new Date(`${monthA} 1, ${yearA}`).getTime() - new Date(`${monthB} 1, ${yearB}`).getTime()
  })

  sortedMonths.forEach((month) => {
    runningBalance += monthlyData[month].loaned - monthlyData[month].returned
    monthlyData[month].balance = runningBalance
  })

  return sortedMonths.map((month) => ({
    name: month,
    loaned: monthlyData[month].loaned,
    returned: monthlyData[month].returned,
    balance: monthlyData[month].balance,
  }))
}

function prepareCurrencyData(loans: Loan[]) {
  const currencyCounts: Record<string, number> = {}

  loans.forEach((loan) => {
    if (!currencyCounts[loan.Currency]) {
      currencyCounts[loan.Currency] = 0
    }
    currencyCounts[loan.Currency]++
  })

  return Object.entries(currencyCounts).map(([name, value]) => ({
    name,
    value,
  }))
}

function prepareTypeData(loans: Loan[]) {
  const loanCount = loans.filter((loan) => loan.Status === "Loan").length
  const returnCount = loans.filter((loan) => loan.Status === "Return").length

  return [
    { name: "Loans", value: loanCount },
    { name: "Returns", value: returnCount },
  ]
}

// Colors for pie chart
const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"]

