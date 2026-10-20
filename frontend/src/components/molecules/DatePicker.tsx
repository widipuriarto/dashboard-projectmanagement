import * as React from "react";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, X } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

import { MONTH_NAMES, DAY_LABELS } from "@/lib/date-constants";

interface DatePickerProps {
  id?: string;
  value?: string | null;
  onChange?: (dateString: string) => void;
  placeholder?: string;
  disabled?: boolean;
  error?: string;
  className?: string;
}

export function DatePicker({
  value,
  onChange,
  placeholder = "Pilih tanggal...",
  disabled = false,
  error,
  className,
}: DatePickerProps) {
  const [isOpen, setIsOpen] = React.useState(false);

  // Parse initial date from YYYY-MM-DD
  const parsedDate = React.useMemo(() => {
    if (!value) return null;
    const match = String(value).match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (!match) return null;
    const y = parseInt(match[1], 10);
    const m = parseInt(match[2], 10) - 1;
    const d = parseInt(match[3], 10);
    return new Date(y, m, d);
  }, [value]);

  // Calendar view navigation state (Month & Year)
  const [viewYear, setViewYear] = React.useState<number>(() => {
    return parsedDate ? parsedDate.getFullYear() : new Date().getFullYear();
  });
  const [viewMonth, setViewMonth] = React.useState<number>(() => {
    return parsedDate ? parsedDate.getMonth() : new Date().getMonth();
  });

  // Keep view in sync when value changes externally
  React.useEffect(() => {
    if (parsedDate) {
      setViewYear(parsedDate.getFullYear());
      setViewMonth(parsedDate.getMonth());
    }
  }, [parsedDate]);

  // Format display text for input trigger
  const displayLabel = React.useMemo(() => {
    if (!parsedDate) return null;
    const day = String(parsedDate.getDate()).padStart(2, "0");
    const month = MONTH_NAMES[parsedDate.getMonth()];
    const year = parsedDate.getFullYear();
    return `${day} ${month} ${year}`;
  }, [parsedDate]);

  // Calendar calculations
  const daysInCurrentMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const daysInPrevMonth = new Date(viewYear, viewMonth, 0).getDate();

  // Day of week index for 1st day of month (0 = Sunday -> 6 = Saturday)
  // Convert so Monday = 0, Sunday = 6
  const firstDayIndex = (new Date(viewYear, viewMonth, 1).getDay() + 6) % 7;

  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((prev) => prev - 1);
    } else {
      setViewMonth((prev) => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((prev) => prev + 1);
    } else {
      setViewMonth((prev) => prev + 1);
    }
  };

  const handleSelectDay = (day: number) => {
    const formattedY = viewYear;
    const formattedM = String(viewMonth + 1).padStart(2, "0");
    const formattedD = String(day).padStart(2, "0");
    const dateStr = `${formattedY}-${formattedM}-${formattedD}`;
    if (onChange) {
      onChange(dateStr);
    }
    setIsOpen(false);
  };

  const handleSelectToday = () => {
    const today = new Date();
    const formattedY = today.getFullYear();
    const formattedM = String(today.getMonth() + 1).padStart(2, "0");
    const formattedD = String(today.getDate()).padStart(2, "0");
    const dateStr = `${formattedY}-${formattedM}-${formattedD}`;
    setViewYear(formattedY);
    setViewMonth(today.getMonth());
    if (onChange) {
      onChange(dateStr);
    }
    setIsOpen(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onChange) {
      onChange("");
    }
  };

  // Generate selectable years for quick dropdown (-10 to +10 years from current)
  const currentYear = new Date().getFullYear();
  const yearOptions = React.useMemo(() => {
    const list: number[] = [];
    for (let y = currentYear - 10; y <= currentYear + 10; y++) {
      list.push(y);
    }
    return list;
  }, [currentYear]);

  const today = new Date();
  const isTodayMonth = today.getFullYear() === viewYear && today.getMonth() === viewMonth;
  const todayDate = today.getDate();

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger
        disabled={disabled}
        type="button"
        className={cn(
          "w-full h-10 px-3 rounded-lg border bg-white text-sm shadow-2xs transition-all flex items-center justify-between text-left outline-none select-none cursor-pointer group",
          error
            ? "border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-500/15"
            : isOpen
            ? "border-telkom-navy ring-2 ring-telkom-navy/15"
            : "border-slate-200 hover:border-slate-300 focus:border-telkom-navy focus:ring-2 focus:ring-telkom-navy/15",
          disabled && "bg-slate-50 opacity-60 cursor-not-allowed pointer-events-none",
          className
        )}
      >
        <div className="flex items-center min-w-0 flex-1">
          <CalendarIcon className="h-4 w-4 text-slate-400 mr-2 shrink-0 group-hover:text-telkom-navy transition-colors" />
          <span
            className={cn(
              "truncate",
              displayLabel ? "text-slate-800 font-medium" : "text-slate-400 font-normal"
            )}
          >
            {displayLabel || placeholder}
          </span>
        </div>

        {displayLabel && !disabled ? (
          <button
            type="button"
            onClick={handleClear}
            className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors ml-1"
            title="Clear date"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        ) : null}
      </PopoverTrigger>

      <PopoverContent
        align="start"
        side="bottom"
        sideOffset={6}
        className="w-[280px] sm:w-[300px] p-3 rounded-2xl border border-slate-200/90 bg-white shadow-xl z-50 duration-150"
      >
        {/* Calendar Header with Month/Year Navigation */}
        <div className="flex items-center justify-between mb-3 px-1">
          <button
            type="button"
            onClick={handlePrevMonth}
            className="h-7 w-7 rounded-lg border border-slate-200/80 hover:bg-slate-100 flex items-center justify-center text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
            title="Previous month"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-xs sm:text-sm text-slate-800">
              {MONTH_NAMES[viewMonth]}
            </span>
            <select
              value={viewYear}
              onChange={(e) => setViewYear(parseInt(e.target.value, 10))}
              className="font-semibold text-xs sm:text-sm text-slate-800 bg-transparent border-0 outline-none cursor-pointer hover:text-telkom-navy"
            >
              {yearOptions.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            onClick={handleNextMonth}
            className="h-7 w-7 rounded-lg border border-slate-200/80 hover:bg-slate-100 flex items-center justify-center text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
            title="Next month"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        {/* Day of Week Labels */}
        <div className="grid grid-cols-7 gap-1 text-center mb-1.5">
          {DAY_LABELS.map((day) => (
            <span
              key={day}
              className="text-[11px] font-semibold text-slate-400 select-none py-1"
            >
              {day}
            </span>
          ))}
        </div>

        {/* Days Grid */}
        <div className="grid grid-cols-7 gap-1 text-center select-none">
          {/* Previous month padding days */}
          {Array.from({ length: firstDayIndex }).map((_, i) => {
            const dayNum = daysInPrevMonth - firstDayIndex + i + 1;
            return (
              <div
                key={`prev-${i}`}
                className="h-8 flex items-center justify-center text-xs text-slate-300 font-normal pointer-events-none"
              >
                {dayNum}
              </div>
            );
          })}

          {/* Current month days */}
          {Array.from({ length: daysInCurrentMonth }).map((_, i) => {
            const dayNum = i + 1;
            const isSelected =
              parsedDate &&
              parsedDate.getFullYear() === viewYear &&
              parsedDate.getMonth() === viewMonth &&
              parsedDate.getDate() === dayNum;
            const isToday = isTodayMonth && todayDate === dayNum;

            return (
              <button
                key={`current-${dayNum}`}
                type="button"
                onClick={() => handleSelectDay(dayNum)}
                className={cn(
                  "h-8 w-8 mx-auto flex items-center justify-center text-xs rounded-lg transition-all cursor-pointer font-medium",
                  isSelected
                    ? "bg-telkom-navy text-white font-semibold shadow-xs hover:bg-telkom-navy"
                    : isToday
                    ? "border border-telkom-navy/40 text-telkom-navy font-semibold hover:bg-slate-100"
                    : "text-slate-700 hover:bg-slate-100 hover:text-slate-900"
                )}
              >
                {dayNum}
              </button>
            );
          })}
        </div>

        {/* Footer Shortcuts */}
        <div className="flex items-center justify-between pt-3 mt-2 border-t border-slate-100 px-1">
          <button
            type="button"
            onClick={handleSelectToday}
            className="text-xs font-semibold text-telkom-navy hover:underline cursor-pointer"
          >
            Hari Ini
          </button>
          {displayLabel && (
            <button
              type="button"
              onClick={handleClear}
              className="text-xs font-medium text-slate-500 hover:text-red-600 transition-colors cursor-pointer"
            >
              Kosongkan
            </button>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

