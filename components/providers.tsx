"use client"

import type React from "react"

import { SessionProvider } from "next-auth/react"
import { SWRConfig } from "swr"
import { swrConfig } from "@/lib/swr-config"
import { ThemeProvider } from "@/components/theme-provider"
import { OptimisticProvider } from "@/lib/optimistic-context"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <SWRConfig value={swrConfig}>
        <OptimisticProvider>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
            {children}
          </ThemeProvider>
        </OptimisticProvider>
      </SWRConfig>
    </SessionProvider>
  )
}

