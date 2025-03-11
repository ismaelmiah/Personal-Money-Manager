import useSWR from "swr"

export function useMoneyManagerStatistics() {
  const { data, error, isLoading, mutate } = useSWR("/api/money-manager/statistics")

  return {
    statistics: data || {
      totalIncome: 0,
      totalExpense: 0,
      balance: 0,
      categoryStats: [],
      accountStats: [],
      monthlyStats: [],
    },
    isLoading,
    isError: error,
    mutate,
  }
}

