import { NextResponse } from "next/server"
import { getCategories, updateCategory, deleteCategory } from "@/lib/money-manager-service"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const categories = await getCategories()
    const category = categories.find((c) => c.Id === params.id)

    if (!category) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 })
    }

    return NextResponse.json(category)
  } catch (error) {
    console.error("Error fetching category:", error)
    return NextResponse.json({ error: "Failed to fetch category" }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()
    const { Name, Status } = body

    if (!Name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 })
    }

    const updatedCategory = await updateCategory(params.id, {
      Name,
      Status: Status === "income" ? "income" : "expense",
    })

    return NextResponse.json(updatedCategory)
  } catch (error) {
    console.error("Error updating category:", error)
    return NextResponse.json({ error: "Failed to update category" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    await deleteCategory(params.id)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting category:", error)
    return NextResponse.json({ error: "Failed to delete category" }, { status: 500 })
  }
}

