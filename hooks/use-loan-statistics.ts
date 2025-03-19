import useSWR from "swr"

export function useLoanStatistics() {
  const { data, error, isLoading, mutate } = useSWR("/api/loan-tracker/statistics")

  return {
    statistics: data || { memberStats: [], currencyStats: {} },
    isLoading,
    isError: error,
    mutate,
  }
}

