"use client"

import { useAppData } from "@/providers/data-provider"

export function useAppMembers() {
  const { members, isLoading, isError, refreshData, addMember, updateMember, deleteMember } = useAppData()

  return {
    members,
    isLoading,
    isError,
    mutate: refreshData,
    addMember,
    updateMember,
    deleteMember,
  }
}

