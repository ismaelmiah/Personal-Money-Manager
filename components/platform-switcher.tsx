"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { CreditCard, ChevronDown, Wallet } from "lucide-react"

type Platform = "loan-tracker" | "money-manager"

interface PlatformSwitcherProps {
  currentPlatform: Platform
}

export function PlatformSwitcher({ currentPlatform }: PlatformSwitcherProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)

  const handlePlatformChange = (platform: Platform) => {
    setOpen(false)
    router.push(`/${platform}`)
  }

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          {currentPlatform === "loan-tracker" ? (
            <>
              <CreditCard className="h-4 w-4" />
              <span>Loan Tracker</span>
            </>
          ) : (
            <>
              <Wallet className="h-4 w-4" />
              <span>Money Manager</span>
            </>
          )}
          <ChevronDown className="h-4 w-4 ml-2" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          disabled={currentPlatform === "loan-tracker"}
          onClick={() => handlePlatformChange("loan-tracker")}
          className="flex items-center gap-2"
        >
          <CreditCard className="h-4 w-4" />
          <span>Switch to Loan Tracker</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          disabled={currentPlatform === "money-manager"}
          onClick={() => handlePlatformChange("money-manager")}
          className="flex items-center gap-2"
        >
          <Wallet className="h-4 w-4" />
          <span>Switch to Money Manager</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

