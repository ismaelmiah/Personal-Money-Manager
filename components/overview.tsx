"use client"

import { useEffect, useState } from "react"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from "recharts"

type ChartData = {
  name: string
  loaned: number
  returned: number
}

export function Overview() {
  const [data, setData] = useState<ChartData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("/api/loan-tracker/loans")
        const loans = await response.json()
        console.log(loans)
        // Group by month
        const monthlyData: Record<string, { loaned: number; returned: number }> = {}

        loans.forEach((loan: any) => {
          const [day, month, year] = loan.createdAt.split(" ")[0].split("/")
          const createdAt = new Date(`${year}-${month}-${day}`)
          const monthYear = `${createdAt.toLocaleString("default", { month: "short" })} ${createdAt.getFullYear()}`

          if (!monthlyData[monthYear]) {
            monthlyData[monthYear] = { loaned: 0, returned: 0 }
          }

          if (loan.status === "Loan" && loan.currency === "BDT") {
            monthlyData[monthYear].loaned += loan.amount
          } else if (loan.status === "Return" && loan.currency === "BDT") {
            monthlyData[monthYear].returned += loan.amount
          }
        })

        // Convert to array and sort by createdAt
        const chartData = Object.entries(monthlyData)
          .map(([name, values]) => ({
            name,
            ...values,
          }))
          .sort((a, b) => {
            const [monthA, yearA] = a.name.split(" ")
            const [monthB, yearB] = b.name.split(" ")
            return new Date(`${monthA} 1, ${yearA}`).getTime() - new Date(`${monthB} 1, ${yearB}`).getTime()
          })
          .slice(-6) // Last 6 months

        setData(chartData)
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
    <ResponsiveContainer width="100%" height={200}>
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
        <Bar dataKey="loaned" name="Loans" fill="#ef4444" radius={[4, 4, 0, 0]} />
        <Bar dataKey="returned" name="Returns" fill="#22c55e" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}

