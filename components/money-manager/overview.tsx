"use client"

import { useEffect, useState } from "react"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from "recharts"

type ChartData = {
  name: string
  income: number
  expense: number
}

export function MoneyManagerOverview() {
  const [data, setData] = useState<ChartData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("/api/money-manager/statistics")
        const stats = await response.json()

        // Get the monthly stats from the response
        const chartData = stats.monthlyStats.slice(-6) // Last 6 months

        setData(
          chartData.map((item: any) => ({
            name: item.month,
            income: item.income,
            expense: item.expense,
          })),
        )
      } catch (error) {
        console.error("Error fetching chart data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) {
    return <div className="h-[300px] flex items-center justify-center">Loading chart data...</div>
  }

  if (data.length === 0) {
    return <div className="h-[300px] flex items-center justify-center">No data available for chart</div>
  }

  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={data}>
        <XAxis
          dataKey="name"
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tick={{ fontSize: 10 }}
          tickFormatter={(value) => {
            // On small screens, just show the month
            if (window.innerWidth < 768) {
              return value.split(" ")[0]
            }
            return value
          }}
        />
        <YAxis
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `৳${value}`}
        />
        <Tooltip formatter={(value: number) => [`৳${value}`, ""]} labelFormatter={(label) => `Month: ${label}`} />
        <Legend />
        <Bar dataKey="income" name="Income" fill="#22c55e" radius={[4, 4, 0, 0]} />
        <Bar dataKey="expense" name="Expense" fill="#ef4444" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}

