import useSWR from "swr"
import type { Member } from "@/lib/google-sheets"

export function useMembers() {
  const { data, error, isLoading, mutate } = useSWR<Member[]>("/api/members")

  return {
    members: data || [],
    isLoading,
    isError: error,
    mutate,
  }
}

