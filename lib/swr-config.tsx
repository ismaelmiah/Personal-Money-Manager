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
  dedupingInterval: 6000, // 1 minute
}

export function SwrProvider({ children }: { children: React.ReactNode }) {
  return <SWRConfig value={swrConfig}>{children}</SWRConfig>
}

