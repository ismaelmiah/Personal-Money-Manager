import useSWR from "swr"
import type { member } from "@/lib/loan-tracker-service"

export function usemembers() {
  const { data, error, isLoading, mutate } = useSWR<member[]>("/api/members")

  return {
    members: data || [],
    isLoading,
    isError: error,
    mutate,
  }
}

