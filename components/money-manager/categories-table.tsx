"use client"

import { useRouter } from "next/navigation"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { useCategories } from "@/hooks/use-categories"
import { formatDate } from "@/lib/utils"
import { EditCategoryButton } from "@/components/money-manager/edit-category-button"
import { DeleteCategoryButton } from "@/components/money-manager/delete-category-button"
import { LoadingCountdown } from "@/components/loading-countdown"
import { PaginatedTable } from "../paginated-table"

export function CategoriesTable() {
  const router = useRouter()
  const { categories, isLoading, isError, mutate } = useCategories()

  if (isError) {
    return (
      <Alert variant="destructive">
        <AlertDescription>Failed to load categories. Please check your Google Sheets configuration.</AlertDescription>
      </Alert>
    )
  }

  if (isLoading) {
    return <LoadingCountdown message="Loading categories" isLoading={isLoading} />
  }

  if (!categories || categories.length === 0) {
    return (
      <div className="rounded-md border p-4">
        <p className="text-center text-muted-foreground">No categories found. Add your first category.</p>
      </div>
    )
  }

  const columns = [
    {
      header: "Name",
      accessorKey: (row: any) => formatDate(row.name),
      className: "font-medium",
      searchable: true,
    },
    {
      header: "Type",
      accessorKey: (row: any) => (
        <Badge variant={row.type === "expense" ? "danger" : "success"}>
          {row.type === "expense" ? "Expense" : "Income"}
        </Badge>
      ),
    },
    {
      header: "Created On",
      accessorKey: (row: any) => formatDate(row.createdAt),
      className: "hidden md:table-cell",
    },
    {
      header: "Actions",
      accessorKey: (row: any) => (
        <div className="flex space-x-2">
          <EditCategoryButton category={row} onSuccess={() => mutate()} />
          <DeleteCategoryButton categoryId={row.id} onSuccess={() => mutate()} />
        </div>
      ),
      className: "w-[100px]",
    },
  ]

  return <PaginatedTable data={categories} columns={columns} searchPlaceholder="Search categories..." />
}

