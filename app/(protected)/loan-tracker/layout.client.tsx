"use client"

import { LoanTrackerSideNav } from "@/components/loan-tracker/side-nav"
import { MobileNav } from "@/components/mobile-nav"

export function LoanTrackerLayoutClient({
  children,
  session,
}: {
  children: React.ReactNode
  session: any
}) {
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