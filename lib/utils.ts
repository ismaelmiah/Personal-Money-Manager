import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number, currency: "BDT" | "USD" | "GBP"): string {
  // Map currency to valid ISO 4217 codes
  const currencyCode = currency.toUpperCase(); // Ensure uppercase (e.g., "bdt" → "BDT")

  // Format the amount using Intl.NumberFormat
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currencyCode, // Use the valid currency code
  }).format(amount);
}

export function formatDate(CreatedAt: string): string {
  const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false };
  return new Date(CreatedAt).toLocaleString('en-GB', options).replace(',', '');
}
