import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { getCategories } from "@/lib/money-manager-service"
import { formatDate } from "@/lib/utils"

export async function CategoriesTable() {
  try {
    const categories = await getCategories()

    if (!categories || categories.length === 0) {
      return (
        <div className="rounded-md border p-4">
          <p className="text-center text-muted-foreground">No categories found. Add your first category.</p>
        </div>
      )
    }

    return (
      <div className="rounded-md border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="hidden md:table-cell">Created On</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories.map((category) => (
              <TableRow key={category.Id}>
                <TableCell className="font-medium">{category.name}</TableCell>
                <TableCell>
                  <Badge variant={category.Status === "expense" ? "destructive" : "secondary"}>
                    {category.Status === "expense" ? "Expense" : "Income"}
                  </Badge>
                </TableCell>
                <TableCell className="hidden md:table-cell">{formatDate(category.CreatedAt)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    )
  } catch (error) {
    console.error("Error in CategoriesTable:", error)
    return (
      <Alert variant="destructive">
        <AlertDescription>Failed to load categories. Please check your Google Sheets configuration.</AlertDescription>
      </Alert>
    )
  }
}

