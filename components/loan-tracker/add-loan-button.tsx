"use client"

import { useState } from "react"
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
import { CalendarIcon, Plus, ArrowUpCircle, ArrowDownCircle } from "lucide-react"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn, formatDate } from "@/lib/utils"
import { useAppMembers } from "@/hooks/use-app-members"
import { useAppLoans } from "@/hooks/user-app-loans"
import { format } from "date-fns";

const formSchema = z.object({
  memberId: z.string({
    required_error: "Please select a member",
  }),
  amount: z.string().min(0, "Amount is required"),
  currency: z.enum(["BDT", "USD", "GBP"], {
    required_error: "Please select a currency",
  }),
  status: z.enum(["Loan", "Return"], {
    required_error: "Please select a type",
  }),
  createdAt: z.date({
    required_error: "Please select a date",
  }),
  notes: z.string().optional(),
})
export function AddLoanButton() {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const router = useRouter()
  const { toast } = useToast()
  const { members } = useAppMembers()
  const { addLoan } = useAppLoans()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      memberId: "",
      amount: "",
      currency: "BDT",
      status: "Loan",
      createdAt: new Date(),
      notes: "",
    },
  })

  // Sort members alphanumerically by name
members.sort((a, b) => {
  const nameA = a.name.toLowerCase();
  const nameB = b.name.toLowerCase();
  if (nameA < nameB) return -1; // Sort `a` before `b`
  if (nameA > nameB) return 1;  // Sort `b` before `a`
  return 0; // Names are equal
});

  const filteredMembers = members.filter((member) =>
    member.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setLoading(true)
      const selectedMember = members.find((m) => m.id === values.memberId)

      if (!selectedMember) {
        throw new Error("Member not found")
      }

      const formattedCreatedAt = format(values.createdAt, "dd/MM/yyyy HH:mm:ss");

      await addLoan({
        memberId: values.memberId,
        memberName: selectedMember.name,
        amount: Number.parseFloat(values.amount),
        currency: values.currency,
        status: values.status as "Loan" | "Return",
        createdAt: formattedCreatedAt,
        notes: values.notes || "",
      })

      toast({
        title: "Success",
        description: `${values.status === "Loan" ? "Loan" : "Return"} added successfully`,
      })
      setOpen(false)
      form.reset()
    } catch (error) {
      console.error("Error adding loan:", error)
      toast({
        title: "Error",
        description: "Failed to add loan. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const transactionType = form.watch("status")
console.log('members: ', searchQuery);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Transaction
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Transaction</DialogTitle>
          <DialogDescription>Add a new loan or return transaction.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="memberId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Member</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a member" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <div className="sticky top-0 bg-white z-10 p-2">
                        <Input
                          type="text"
                          placeholder="Search members..."
                          value={searchQuery}
                          onChange={(e) => {
                            e.stopPropagation();
                            setSearchQuery(e.target.value);
                          }}
                          className="mb-2"
                        />
                      </div>
                      <div className="max-h-60 overflow-y-auto">
                        {filteredMembers.map((member) => (
                          <SelectItem key={member.id} value={member.id}>
                            {member.name}
                          </SelectItem>
                        ))}
                      </div>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" {...field} disabled={loading} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="currency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Currency</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value} disabled={loading}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select currency" />
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
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Transaction Type</FormLabel>
                  <div className="flex gap-4">
                    <Button
                      type="button"
                      variant={field.value === "Loan" ? "default" : "outline"}
                      className={cn("flex-1 gap-2", field.value === "Loan" && "bg-red-600 hover:bg-red-700")}
                      onClick={() => field.onChange("Loan")}
                      disabled={loading}
                    >
                      <ArrowUpCircle className="h-4 w-4" />
                      Loan (Out)
                    </Button>
                    <Button
                      type="button"
                      variant={field.value === "Return" ? "default" : "outline"}
                      className={cn("flex-1 gap-2", field.value === "Return" && "bg-green-600 hover:bg-green-700")}
                      onClick={() => field.onChange("Return")}
                      disabled={loading}
                    >
                      <ArrowDownCircle className="h-4 w-4" />
                      Return (In)
                    </Button>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="createdAt"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
                          disabled={loading}
                        >
                          {field.value ? formatDate(field.value.toISOString()) : <span>Pick a date</span>}
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
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea {...field} disabled={loading} />
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
