"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { CreditCard, Menu, Wallet } from "lucide-react"
import { useSession } from "next-auth/react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import { loanTrackerNavItems } from "./loan-tracker/side-nav"
import { moneyManagerNavItems } from "./money-manager/side-nav"
import { PlatformSwitcher } from "./platform-switcher"
import { Session } from "next-auth";

type Platform = "loan-tracker" | "money-manager"

interface MobileNavProps {
  platform: Platform;
  session: Session | null;
}

export function MobileNav({ platform, session }: MobileNavProps) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const navItems = platform === "loan-tracker" ? loanTrackerNavItems : moneyManagerNavItems

  return (
    <div className="md:hidden border-b">
      <div className="flex h-14 items-center px-4 justify-between">
        <div className="flex items-center">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="mr-2">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="pr-0 sm:max-w-xs">
              <div className="px-7">
                <Link
                  href={`/${platform}`}
                  className="flex items-center gap-2 font-semibold"
                  onClick={() => setOpen(false)}
                >
                  {platform === "loan-tracker" ? <CreditCard className="h-6 w-6" /> : <Wallet className="h-6 w-6" />}
                  <span>{platform === "loan-tracker" ? "Loan Tracker" : "Money Manager"}</span>
                </Link>
              </div>
              <div className="mt-8 px-7">
                <nav className="grid gap-2">
                  {navItems.map((item, index) => {
                    const Icon = item.icon
                    const itemPath = `/${platform}${item.href === "/" ? "/dashboard" : item.href}`
                    const isActive =
                      pathname === itemPath ||
                      (item.href !== "/dashboard" && pathname.startsWith(`/${platform}${item.href}`))
                    return (
                      <Link key={index} href={itemPath} onClick={() => setOpen(false)}>
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
                <div className="absolute bottom-0 left-0 right-0 border-t p-4">
                  <div className="flex items-center gap-4">
                    <Avatar>
                      <AvatarImage src={session.user.image ?? undefined} />
                      <AvatarFallback>{session.user.name?.[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <p className="text-sm font-medium">{session.user.name}</p>
                      <p className="text-xs text-muted-foreground truncate max-w-[150px]">{session.user.email}</p>
                    </div>
                  </div>
                </div>
              )}
            </SheetContent>
          </Sheet>
          <Link href={`/${platform}`} className="flex items-center gap-2 font-semibold">
            {platform === "loan-tracker" ? <CreditCard className="h-6 w-6" /> : <Wallet className="h-6 w-6" />}
            <span>{platform === "loan-tracker" ? "Loan Tracker" : "Money Manager"}</span>
          </Link>
        </div>
        <PlatformSwitcher currentPlatform={platform} />
      </div>
    </div>
  )
}

