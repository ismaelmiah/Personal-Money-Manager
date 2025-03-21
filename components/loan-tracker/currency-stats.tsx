"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrency } from "@/lib/utils"
import { useAppStatistics } from "@/hooks/use-app-statistics"
import { LoadingCountdown } from "@/components/loading-countdown"

export function CurrencyStats() {
  const { statistics, isLoading, isError } = useAppStatistics()
  const currencies = ["BDT", "USD", "GBP"] as const

  if (isError) {
    return <div className="text-center text-red-500">Failed to load statistics</div>
  }

  // Ensure statistics and currencyStats exist
  const currencyStats = statistics?.currencyStats || {}

  return (
    <>
      <LoadingCountdown message="Loading currency statistics" isLoading={isLoading} />

      {!isLoading && (
        <div className="grid gap-4 md:grid-cols-3">
          {currencies.map((currency) => {
            // Ensure the currency data exists
            const currencyData = currencyStats[currency] || { totalLoaned: 0, totalReturned: 0 }

            return (
              <Card key={currency}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{currency}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {formatCurrency(currencyData.totalLoaned - currencyData.totalReturned, currency)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Loaned: {formatCurrency(currencyData.totalLoaned, currency)}
                    <br />
                    Returned: {formatCurrency(currencyData.totalReturned, currency)}
                  </p>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </>
  )
}

