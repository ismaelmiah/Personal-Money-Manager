"use client"

import useSWR from "swr"
import { useEffect } from "react"
import type { Member } from "@/lib/loan-tracker-service"
import { useOptimistic } from "@/lib/optimistic-context"

export function useMembers() {
  const { data: fetchedMembers, error, isLoading, mutate } = useSWR<Member[]>("/api/members")
  const {
    data: optimisticData,
    setOptimisticMembers,
    addOptimisticMember,
    updateOptimisticMember,
    deleteOptimisticMember,
  } = useOptimistic()

  // Sync fetched data with optimistic state when it loads
  useEffect(() => {
    if (fetchedMembers && !optimisticData.members.length) {
      setOptimisticMembers(fetchedMembers)
    }
  }, [fetchedMembers, optimisticData.members.length, setOptimisticMembers])

  // Use optimistic data if available, otherwise use fetched data
  const members = optimisticData.members.length > 0 ? optimisticData.members : fetchedMembers || []

  return {
    members,
    isLoading,
    isError: error,
    mutate,
    // Add optimistic update functions
    addMember: async (member: Member) => {
      // Add to optimistic state immediately
      addOptimisticMember(member)

      // Make API call in the background
      try {
        await fetch("/api/members", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(member),
        })
        // Revalidate data after successful API call
        mutate()
      } catch (error) {
        console.error("Error adding member:", error)
        // Revalidate to restore correct state
        mutate()
      }
    },
    updateMember: async (member: Member) => {
      // Update optimistic state immediately
      updateOptimisticMember(member)

      // Make API call in the background
      try {
        await fetch(`/api/members/${member.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(member),
        })
        // Revalidate data after successful API call
        mutate()
      } catch (error) {
        console.error("Error updating member:", error)
        // Revalidate to restore correct state
        mutate()
      }
    },
    deleteMember: async (id: string) => {
      // Update optimistic state immediately
      deleteOptimisticMember(id)

      // Make API call in the background
      try {
        await fetch(`/api/members/${id}`, {
          method: "DELETE",
        })
        // Revalidate data after successful API call
        mutate()
      } catch (error) {
        console.error("Error deleting member:", error)
        // Revalidate to restore correct state
        mutate()
      }
    },
  }
}

