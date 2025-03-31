"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import { cn } from "@/lib/utils"

interface PaginatedTableProps<T> {
  data: T[]
  columns: {
    header: string
    accessorKey: keyof T | ((row: T) => React.ReactNode)
    className?: string
    searchable?: boolean
  }[]
  searchPlaceholder?: string
  onRowClick?: (row: any, e: React.MouseEvent) => void
  maxHeight?: string,
  defaultPageSize?: number
}

export function PaginatedTable<T extends { id: string }>({
  data,
  columns,
  searchPlaceholder = "Search...",
  onRowClick,
  maxHeight,
  defaultPageSize = 10,
}: PaginatedTableProps<T>) {
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(defaultPageSize)
  const [searchQuery, setSearchQuery] = useState("")
  const [tableHeight, setTableHeight] = useState<string | undefined>(maxHeight)

  // Calculate dynamic table height based on viewport if not explicitly provided
  useEffect(() => {
    if (!maxHeight) {
      const calculateHeight = () => {
        const viewportHeight = window.innerHeight
        // Adjust this value based on your layout (header, pagination, etc.)
        const otherElementsHeight = 250
        const calculatedHeight = `${Math.max(400, viewportHeight - otherElementsHeight)}px`
        setTableHeight(calculatedHeight)
      }

      calculateHeight()
      window.addEventListener("resize", calculateHeight)
      return () => window.removeEventListener("resize", calculateHeight)
    }
  }, [maxHeight])

  // Filter data based on search query
  const filteredData = data.filter((row) => {
    if (!searchQuery) return true

    const query = searchQuery.toLowerCase()
    return columns.some((column) => {
      if (!column.searchable) return false

      const key = column.accessorKey
      if (typeof key === "function") return false

      const value = String(row[key] || "").toLowerCase()
      return value.includes(query)
    })
  })

  // Calculate pagination
  const totalPages = Math.ceil(filteredData.length / pageSize)
  const startIndex = (currentPage - 1) * pageSize
  const endIndex = startIndex + pageSize
  const paginatedData = filteredData.slice(startIndex, endIndex)

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pages = []
    const maxVisiblePages = 5

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      // Always show first page
      pages.push(1)

      // Calculate middle pages
      const startPage = Math.max(2, currentPage - 1)
      const endPage = Math.min(totalPages - 1, currentPage + 1)

      // Add ellipsis after first page if needed
      if (startPage > 2) {
        pages.push("ellipsis-start")
      }

      // Add middle pages
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i)
      }

      // Add ellipsis before last page if needed
      if (endPage < totalPages - 1) {
        pages.push("ellipsis-end")
      }

      // Always show last page
      pages.push(totalPages)
    }

    return pages
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="relative max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder={searchPlaceholder}
            className="pl-8 w-full md:w-[300px]"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value)
              setCurrentPage(1) // Reset to first page on search
            }}
          />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Rows per page</span>
          <Select
            value={pageSize.toString()}
            onValueChange={(value) => {
              setPageSize(Number(value))
              setCurrentPage(1) // Reset to first page when changing page size
            }}
          >
            <SelectTrigger className="h-8 w-[70px]">
              <SelectValue placeholder={pageSize.toString()} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="5">5</SelectItem>
              <SelectItem value="7">7</SelectItem>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="20">20</SelectItem>
              <SelectItem value="50">50</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="rounded-md border overflow-hidden">
        <div style={{ height: tableHeight, display: "flex", flexDirection: "column" }}>
          <div className="overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  {columns.map((column, index) => (
                    <TableHead key={index} className={column.className}>
                      {column.header}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
            </Table>
          </div>
          <div className="overflow-auto flex-1">
            <Table>
              <TableBody>
                {paginatedData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={columns.length} className="h-24 text-center">
                      No results found.
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedData.map((row, index) => (
                    <TableRow
                      key={index}
                      className={cn("cursor-pointer hover:bg-muted/50", onRowClick ? "cursor-pointer" : "")}
                      onClick={onRowClick ? (e) => onRowClick(row, e) : undefined}
                    >
                      {columns.map((column, cellIndex) => {
                        const key = column.accessorKey
                        const value = typeof key === "function" ? key(row) : row[key]

                        return (
                          <TableCell key={cellIndex} className={column.className}>
                            {value as React.ReactNode}
                          </TableCell>
                        )
                      })}
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>

      {totalPages > 1 && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href="#"
                onClick={(e) => {
                  e.preventDefault()
                  if (currentPage > 1) setCurrentPage(currentPage - 1)
                }}
                className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
              />
            </PaginationItem>

            {getPageNumbers().map((page, index) => {
              if (page === "ellipsis-start" || page === "ellipsis-end") {
                return (
                  <PaginationItem key={`ellipsis-${index}`}>
                    <PaginationEllipsis />
                  </PaginationItem>
                )
              }

              return (
                <PaginationItem key={index}>
                  <PaginationLink
                    href="#"
                    isActive={currentPage === page}
                    onClick={(e) => {
                      e.preventDefault()
                      setCurrentPage(page as number)
                    }}
                  >
                    {page}
                  </PaginationLink>
                </PaginationItem>
              )
            })}

            <PaginationItem>
              <PaginationNext
                href="#"
                onClick={(e) => {
                  e.preventDefault()
                  if (currentPage < totalPages) setCurrentPage(currentPage + 1)
                }}
                className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  )
}

