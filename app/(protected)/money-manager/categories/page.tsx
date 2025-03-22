"use client"

import { CategoriesTable } from "@/components/money-manager/categories-table"
import { AddCategoryButton } from "@/components/money-manager/add-category-button"

export default function CategoriesPage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Categories</h2>
        <AddCategoryButton />
      </div>
      <CategoriesTable />
    </div>
  )
}

