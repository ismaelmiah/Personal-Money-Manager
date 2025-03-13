import useSWR from "swr"
import type { Member } from "@/lib/loan-tracker-service"

export function useMembers() {
  const { data, error, isLoading, mutate } = useSWR<Member[]>("/api/members")

  return {
    members: data || [],
    isLoading,
    isError: error,
    mutate,
  }
}

