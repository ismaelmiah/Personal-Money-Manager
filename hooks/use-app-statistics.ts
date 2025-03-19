"use client"

import { useAppData } from "@/providers/data-provider"

export function useAppStatistics() {
  const { statistics, isLoading, isError, refreshStatistics } = useAppData()

  return {
    statistics,
    isLoading,
    isError,
    mutate: refreshStatistics,
  }
}

