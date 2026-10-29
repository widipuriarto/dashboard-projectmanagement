/**
 * Centralized singleton formatters and date string helpers.
 * Initialized once at module scope to prevent garbage collection pauses during virtualized scrolling.
 */

export const idrCurrencyFormatter = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});

export const monthYearFormatter = new Intl.DateTimeFormat("id-ID", {
  month: "long",
  year: "numeric",
});

export const dateTimeFormatter = new Intl.DateTimeFormat("id-ID", {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
});

/**
 * Formats ISO date-time string into localized Indonesian date-time representation.
 */
export function formatDateTime(val?: string | null): string {
  if (!val) return "-";
  const date = new Date(val);
  if (isNaN(date.getTime())) return String(val);
  return dateTimeFormatter.format(date);
}

/**
 * Normalizes and formats month-year strings (e.g. "2026-05-01" or "2026-05") into localized month-year text.
 */
export function formatMonthYearKey(val?: string | null): string {
  if (!val) return "-";
  const match = String(val).match(/^(\d{4})-(\d{2})/);
  if (match) {
    const year = parseInt(match[1], 10);
    const month = parseInt(match[2], 10) - 1;
    const date = new Date(year, month, 1);
    return monthYearFormatter.format(date);
  }
  const date = new Date(val);
  if (isNaN(date.getTime())) return String(val).trim() || "-";
  return monthYearFormatter.format(date);
}

