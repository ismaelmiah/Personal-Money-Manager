import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getStatistics } from "@/lib/loan-tracker-service";
import { formatcurrency } from "@/lib/utils";

export async function currencyStats() {
  const { currencyStats } = await getStatistics();
  const currencies = ["BDT", "USD", "GBP"] as const;

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {currencies.map((currency) => (
        <Card key={currency}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{currency}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatcurrency(
                currencyStats[currency].totalLoaned - currencyStats[currency].totalReturned,
                currency
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Loaned: {formatcurrency(currencyStats[currency].totalLoaned, currency)}
              <br />
              Returned: {formatcurrency(currencyStats[currency].totalReturned, currency)}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}