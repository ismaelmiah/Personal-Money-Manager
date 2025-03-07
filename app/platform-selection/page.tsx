import Link from "next/link"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CreditCard, Wallet } from "lucide-react"

export default function PlatformSelectionPage() {
  return (
    <div className="container flex flex-col items-center justify-center min-h-screen py-12">
      <h1 className="text-3xl font-bold mb-8 text-center">Choose a Platform</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl">
        <Card className="flex flex-col h-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-6 w-6" />
              <span>Loan Tracker</span>
            </CardTitle>
            <CardDescription>Track personal loans and returns with detailed member information</CardDescription>
          </CardHeader>
          <CardContent className="flex-grow">
            <ul className="list-disc list-inside space-y-2 text-sm">
              <li>Manage loans and returns</li>
              <li>Track member information</li>
              <li>View transaction history</li>
              <li>Analyze loan statistics</li>
              <li>Multiple currency support</li>
            </ul>
          </CardContent>
          <CardFooter>
            <Button asChild className="w-full">
              <Link href="/loan-tracker/dashboard">Enter Loan Tracker</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}

