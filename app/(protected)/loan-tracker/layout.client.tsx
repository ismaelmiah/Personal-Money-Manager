"use client"

import { useState, useEffect } from "react"
import { LoanTrackerSideNav } from "@/components/loan-tracker/side-nav"
import { MobileNav } from "@/components/mobile-nav"
import { FullScreenLoading } from "@/components/full-screen-loading"
import { useAppData } from "@/providers/data-provider"

export function LoanTrackerLayoutClient({
  children,
  session,
}: {
  children: React.ReactNode
  session: any
}) {
  const [initialLoading, setInitialLoading] = useState(true)
  const { refreshData, isLoading } = useAppData()

  useEffect(() => {
    const loadData = async () => {
      await refreshData()
      setInitialLoading(false)
    }

    loadData()
  }, [refreshData])

  if (initialLoading || isLoading) {
    return <FullScreenLoading message="Loading Loan Tracker" seconds={3} />
  }
console.log('children', children)
  return (
    <div className="flex min-h-screen flex-col">
      <MobileNav platform="loan-tracker" session={session} />
      <div className="flex flex-1">
        <LoanTrackerSideNav session={session} />
        <main className="flex-1 overflow-x-hidden">{children}</main>
      </div>
    </div>
  )
}