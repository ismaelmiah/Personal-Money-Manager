"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { BarChart3, Home, Wallet, Receipt, CreditCard, LogOut, PiggyBank } from "lucide-react"
import { signOut } from "next-auth/react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { PlatformSwitcher } from "../platform-switcher"
import { Session } from "next-auth";

export const moneyManagerNavItems = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: Home,
  },
  {
    title: "Transactions",
    href: "/transactions",
    icon: Receipt,
  },
  {
    title: "Accounts",
    href: "/accounts",
    icon: PiggyBank,
  },
  {
    title: "Categories",
    href: "/categories",
    icon: CreditCard,
  },
  {
    title: "Reports",
    href: "/reports",
    icon: BarChart3,
  },
]

export function MoneyManagerSideNav({ session }: { session: Session }) {
  const pathname = usePathname()

  return (
    <div className="hidden border-r bg-muted/40 md:block">
      <div className="flex h-full max-h-screen flex-col gap-2">
        <div className="flex h-14 items-center border-b px-4 justify-between">
          <Link href="/money-manager/dashboard" className="flex items-center gap-2 font-semibold">
            <Wallet className="h-6 w-6" />
            <span>Money Manager</span>
          </Link>
          <PlatformSwitcher currentPlatform="money-manager" />
        </div>
        <div className="flex-1 overflow-auto py-2">
          <nav className="grid items-start px-2 text-sm font-medium">
            {moneyManagerNavItems.map((item, index) => {
              const Icon = item.icon
              const itemPath = `/money-manager${item.href}`
              const isActive =
                pathname === itemPath ||
                (item.href !== "/dashboard" && pathname.startsWith(`/money-manager${item.href}`))
              return (
                <Link key={index} href={itemPath}>
                  <Button
                    variant={isActive ? "secondary" : "ghost"}
                    className={cn("w-full justify-start gap-2", isActive && "bg-muted")}
                  >
                    <Icon className="h-4 w-4" />
                    {item.title}
                  </Button>
                </Link>
              )
            })}
          </nav>
        </div>
        {session?.user && (
          <div className="border-t p-4">
            <div className="flex items-center gap-4 pb-4">
              <Avatar>
                <AvatarImage src={session.user.image ?? undefined} />
                <AvatarFallback>{session.user.name?.[0]}</AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <p className="text-sm font-medium">{session.user.name}</p>
                <p className="text-xs text-muted-foreground">{session.user.email}</p>
              </div>
            </div>
            <Button variant="ghost" className="w-full justify-start gap-2" onClick={() => signOut()}>
              <LogOut className="h-4 w-4" />
              Sign Out
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

