"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { CalendarIcon, Plus } from "lucide-react"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn, formatDate } from "@/lib/utils"
import type { Account, Category } from "@/lib/money-manager-service"

const formSchema = z.object({
  accountId: z.string({
    required_error: "Please select an account",
  }),
  Amount: z.string().min(1, "Amount is required"),
  Currency: z.enum(["BDT", "USD", "GBP"], {
    required_error: "Please select a Currency",
  }),
  Status: z.enum(["expense", "income"], {
    required_error: "Please select a Status",
  }),
  categoryId: z.string({
    required_error: "Please select a category",
  }),
  CreatedAt: z.date({
    required_error: "Please select a CreatedAt",
  }),
  Notes: z.string().optional(),
})

export function AddTransactionButton() {
  const [open, setOpen] = useState(false)
  const [accounts, setAccounts] = useState<Account[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      Currency: "BDT",
      Status: "expense",
      CreatedAt: new Date(),
      Notes: "",
    },
  })

  // Watch the Status field to filter categories
  const transactionType = form.watch("Status")
  const filteredCategories = categories.filter((category) => category.Status === transactionType)

  // Reset category when Status changes
  useEffect(() => {
    form.setValue("categoryId", "")
  }, [transactionType, form])

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setLoading(true)
      const selectedAccount = accounts.find((a) => a.Id === values.accountId)
      const selectedCategory = categories.find((c) => c.Id === values.categoryId)

      if (!selectedAccount || !selectedCategory) {
        throw new Error("Account or category not found")
      }

      const response = await fetch("/api/money-manager/transactions", {
        method: "POST",
        headers: {
          "Content-Status": "application/json",
        },
        body: JSON.stringify({
          ...values,
          accountName: selectedAccount.name,
          categoryName: selectedCategory.name,
          CreatedAt: values.CreatedAt.toISOString(),
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to create transaction")
      }

      toast({
        title: "Success",
        description: `${values.Status === "expense" ? "Expense" : "Income"} added successfully`,
      })

      setOpen(false)
      form.reset()
      router.refresh()
    } catch (error) {
      console.error("Error adding transaction:", error)
      toast({
        title: "Error",
        description: "Failed to add transaction. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const loadData = async () => {
    try {
      // Load accounts
      const accountsResponse = await fetch("/api/money-manager/accounts")
      if (!accountsResponse.ok) {
        throw new Error("Failed to fetch accounts")
      }
      const accountsData = await accountsResponse.json()
      setAccounts(accountsData)

      // Load categories
      const categoriesResponse = await fetch("/api/money-manager/categories")
      if (!categoriesResponse.ok) {
        throw new Error("Failed to fetch categories")
      }
      const categoriesData = await categoriesResponse.json()
      setCategories(categoriesData)
    } catch (error) {
      console.error("Error loading data:", error)
      toast({
        title: "Error",
        description: "Failed to load accounts and categories. Please try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button onClick={loadData}>
          <Plus className="mr-2 h-4 w-4" />
          Add Transaction
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Transaction</DialogTitle>
          <DialogDescription>Add a new income or expense transaction.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="Status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Transaction Status</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select Status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="expense">Expense (Money Out)</SelectItem>
                      <SelectItem value="income">Income (Money In)</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="accountId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Account</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select an account" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {accounts.map((account) => (
                        <SelectItem key={account.Id} value={account.Id}>
                          {account.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="categoryId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {filteredCategories.map((category) => (
                        <SelectItem key={category.Id} value={category.Id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="Amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="Currency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Currency</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select Currency" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="BDT">BDT</SelectItem>
                        <SelectItem value="USD">USD</SelectItem>
                        <SelectItem value="GBP">GBP</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="CreatedAt"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>CreatedAt</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
                        >
                          {field.value ? formatDate(field.value.toISOString()) : <span>Pick a CreatedAt</span>}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="Notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea {...field} />
                  </FormControl>
                  <FormDescription>Any additional details about this transaction.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit" disabled={loading}>
                {loading ? "Saving..." : "Save"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

