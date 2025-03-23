import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { LoanTrackerLayoutClient } from "./layout.client"

export default async function LoanTrackerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/auth/signin")
  }

  return <LoanTrackerLayoutClient session={session}>{children}</LoanTrackerLayoutClient>
}