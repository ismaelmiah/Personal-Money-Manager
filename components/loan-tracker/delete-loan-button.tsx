"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useToast } from "@/components/ui/use-toast"
import { Trash2 } from "lucide-react"
import { useOptimistic } from "@/lib/optimistic-context"

interface DeleteLoanButtonProps {
  loanId: string
  onSuccess?: () => void
}

export function DeleteLoanButton({ loanId, onSuccess }: DeleteLoanButtonProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()
  const { deleteOptimisticLoan } = useOptimistic()

  const handleDelete = async () => {
    try {
      setLoading(true)

      // Update optimistic state immediately
      deleteOptimisticLoan(loanId)

      // Show success toast
      toast({
        title: "Success",
        description: "Transaction deleted successfully",
      })

      // Close dialog
      setOpen(false)

      // Call success callback if provided
      if (onSuccess) onSuccess()

      // Make API call in the background
      const response = await fetch(`/api/loan-tracker/loans/${loanId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete loan")
      }

      // Refresh the page to update the UI
      router.refresh()
    } catch (error) {
      console.error("Error deleting loan:", error)
      toast({
        title: "Error",
        description: "Failed to delete transaction. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="outline" size="icon" className="h-8 w-8 text-destructive">
          <Trash2 className="h-4 w-4" />
          <span className="sr-only">Delete</span>
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete this transaction and may affect account balances.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete} disabled={loading}>
            {loading ? "Deleting..." : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

