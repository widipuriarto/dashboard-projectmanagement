import * as React from "react";
import { CustomSelect } from "@/components/molecules/CustomSelect";
import { cn } from "@/lib/utils";

interface MonthYearPickerProps {
  id?: string;
  value?: string | null;
  onChange?: (val: string | null) => void;
  disabled?: boolean;
  className?: string;
}

import { MONTH_OPTIONS } from "@/lib/date-constants";

export function MonthYearPicker({
  value,
  onChange,
  disabled = false,
  className,
}: MonthYearPickerProps) {
  // Parse incoming value like '2024-03-01' or '2024-03'
  const parsed = React.useMemo(() => {
    if (!value) return { month: "", year: "" };
    const match = String(value).match(/^(\d{4})-(\d{2})/);
    if (match) {
      return { year: match[1], month: match[2] };
    }
    return { month: "", year: "" };
  }, [value]);

  const currentYear = new Date().getFullYear();
  // Generate list of selectable years (from current - 5 to current + 6)
  const years = React.useMemo(() => {
    const list: string[] = [];
    for (let y = currentYear - 5; y <= currentYear + 6; y++) {
      list.push(String(y));
    }
    return list;
  }, [currentYear]);

  const handleMonthChange = (newMonth: string) => {
    if (!newMonth) {
      if (onChange) onChange(null);
      return;
    }
    const targetYear = parsed.year || String(currentYear);
    if (onChange) {
      onChange(`${targetYear}-${newMonth}-01`);
    }
  };

  const handleYearChange = (newYear: string) => {
    if (!newYear) {
      if (onChange) onChange(null);
      return;
    }
    const targetMonth = parsed.month || "01";
    if (onChange) {
      onChange(`${newYear}-${targetMonth}-01`);
    }
  };

  return (
    <div className={cn("grid grid-cols-2 gap-2 w-full", className)}>
      <CustomSelect
        disabled={disabled}
        value={parsed.month}
        onChange={handleMonthChange}
        options={MONTH_OPTIONS as any}
        placeholder="Pilih Bulan..."
      />

      <CustomSelect
        disabled={disabled}
        value={parsed.year}
        onChange={handleYearChange}
        options={years}
        placeholder="Pilih Tahun..."
      />
    </div>
  );
}

