export const MONTH_NAMES: readonly string[] = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
] as const;

export interface MonthOption {
  value: string;
  label: string;
}

export const MONTH_OPTIONS: readonly MonthOption[] = MONTH_NAMES.map((name, index) => ({
  value: String(index + 1).padStart(2, "0"),
  label: name,
}));

export const DAY_LABELS: readonly string[] = [
  "Sen",
  "Sel",
  "Rab",
  "Kam",
  "Jum",
  "Sab",
  "Min",
] as const;

export const ID_MONTH_ORDER: Record<string, number> = {
  januari: 1,
  februari: 2,
  maret: 3,
  april: 4,
  mei: 5,
  juni: 6,
  juli: 7,
  agustus: 8,
  september: 9,
  oktober: 10,
  november: 11,
  desember: 12,
};

export function parseMonthYearSortKey(str?: string | null): number {
  if (!str || str === "-") return -1;
  const parts = str.trim().split(/\s+/);
  if (parts.length === 2) {
    const monthNum = ID_MONTH_ORDER[parts[0].toLowerCase()] || 0;
    const yearNum = parseInt(parts[1], 10);
    if (!isNaN(yearNum) && monthNum > 0) {
      return yearNum * 100 + monthNum;
    }
  }
  return 0;
}

