import type React from "react"
import { SWRConfig } from "swr"

export const swrConfig = {
  fetcher: (url: string) =>
    fetch(url).then((res) => {
      if (!res.ok) {
        throw new Error("An error occurred while fetching the data.")
      }
      return res.json()
    }),
  revalidateOnFocus: false,
  revalidateIfStale: false,
  revalidateOnReconnect: false,
  dedupingInterval: 300000, // 5 minutes
  keepPreviousData: true, // Keep showing previous data while fetching
  errorRetryCount: 3, // Retry failed requests 3 times
  provider: () => {
    // Create a persistent cache that survives component unmounts
    const cache = new Map()
    return cache
  },
}

export function SwrProvider({ children }: { children: React.ReactNode }) {
  return <SWRConfig value={swrConfig}>{children}</SWRConfig>
}

