"use client"

import { useAppData } from "@/providers/data-provider"

export function useAppMembers() {
  const { members, isLoading, isError, refreshMembers, addMember, updateMember, deleteMember } = useAppData()

  return {
    members,
    isLoading,
    isError,
    refreshMembers: refreshMembers,
    addMember,
    updateMember,
    deleteMember,
  }
}

