import { Suspense } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getLoans, getmembers } from "@/lib/loan-tracker-service";
import { formatcurrency, formatDate } from "@/lib/utils";
import { ChevronLeft } from "lucide-react";
import { memberTransactionsTable } from "@/components/member-transactions-table";
import { LoadingSpinner } from "@/components/loading-spinner";

type PageProps = {
  params: { id: string }; // Plain object with id property
};

export default async function memberDetailsPage({ params }:  { params: Promise<{ id: string }> }) {
  const { id } = await params; // Destructure id from params
  const members = await getmembers();
  const member = members.find((m) => m.id === id); // Use id

  if (!member) {
    notFound();
  }

  const loans = await getLoans();
  const memberLoans = loans.filter((loan) => loan.memberid === id); // Use id

  // Calculate totals
  const totalLoaned = memberLoans
    .filter((loan) => loan.status === "Loan")
    .reduce((sum, loan) => sum + (loan.currency === "BDT" ? loan.amount : 0), 0);

  const totalReturned = memberLoans
    .filter((loan) => loan.status === "Return")
    .reduce((sum, loan) => sum + (loan.currency === "BDT" ? loan.amount : 0), 0);

  const balance = totalLoaned - totalReturned;

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" asChild>
          <Link href="/members">
            <ChevronLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h2 className="text-xl md:text-3xl font-bold tracking-tight truncate">{member.name}</h2>
      </div>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Loaned</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatcurrency(totalLoaned, "BDT")}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Returned</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatcurrency(totalReturned, "BDT")}</div>
          </CardContent>
        </Card>
        <Card className="sm:col-span-2 md:col-span-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">balance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${balance > 0 ? "text-red-500" : "text-green-500"}`}>
              {formatcurrency(balance, "BDT")}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>member Information</CardTitle>
          <CardDescription>Contact details and information</CardDescription>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <dt className="text-sm font-medium text-muted-foreground">name</dt>
              <dd>{member.name}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">email</dt>
              <dd className="break-words">{member.email || "—"}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">phone</dt>
              <dd>{member.phone || "—"}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">member Since</dt>
              <dd>{formatDate(member.createdAt)}</dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
          <CardDescription>All loans and returns for this member</CardDescription>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<LoadingSpinner />}>
            <memberTransactionsTable memberid={id} /> {/* Use id */}
          </Suspense>
        </CardContent>
      </Card>
    </div>
  );
}