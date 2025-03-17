import type React from "react"
import "@/styles/globals.css"
import { Inter } from "next/font/google"
import { Toaster } from "@/components/ui/toaster"
import { Providers } from "@/components/providers"
import { OptimisticProvider } from "@/lib/optimistic-context";

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "Personal Finance Manager",
  description: "Track personal loans and finances with Google Sheets integration",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <OptimisticProvider>
          <Providers>
            {children}
            <Toaster />
          </Providers>
        </OptimisticProvider>
      </body>
    </html>
  )
}

