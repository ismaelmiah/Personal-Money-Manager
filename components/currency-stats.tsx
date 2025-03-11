import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getStatistics } from "@/lib/loan-tracker-service";
import { formatCurrency } from "@/lib/utils";

export async function CurrencyStats() {
  const { currencyStats } = await getStatistics();
  const currencies = ["BDT", "USD", "GBP"] as const;

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {currencies.map((Currency) => (
        <Card key={Currency}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{Currency}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(
                currencyStats[Currency].totalLoaned - currencyStats[Currency].totalReturned,
                Currency
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Loaned: {formatCurrency(currencyStats[Currency].totalLoaned, Currency)}
              <br />
              Returned: {formatCurrency(currencyStats[Currency].totalReturned, Currency)}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}