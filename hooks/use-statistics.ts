import useSWR from "swr"

export function useStatistics() {
  const { data, error, isLoading, mutate } = useSWR("/api/statistics")

  return {
    statistics: data || { memberStats: [], currencyStats: {} },
    isLoading,
    isError: error,
    mutate,
  }
}

