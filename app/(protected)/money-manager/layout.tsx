import type React from "react"
import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { MoneyManagerSideNav } from "@/components/money-manager/side-nav"
import { MobileNav } from "@/components/mobile-nav"

export default async function MoneyManagerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/auth/signin")
  }

  return (
      <div className="flex min-h-screen flex-col">
        <MobileNav platform="money-manager" session={session} />
        <div className="flex flex-1">
          <MoneyManagerSideNav session={session} />
          <main className="flex-1 overflow-x-hidden">{children}</main>
        </div>
      </div>
  )
}

