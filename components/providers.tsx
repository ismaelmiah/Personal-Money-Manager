"use client"

import type React from "react"

import { SessionProvider } from "next-auth/react"
import { SWRConfig } from "swr"
import { swrConfig } from "@/lib/swr-config"
import { ThemeProvider } from "@/components/theme-provider"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <SWRConfig value={swrConfig}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          {children}
        </ThemeProvider>
      </SWRConfig>
    </SessionProvider>
  )
}