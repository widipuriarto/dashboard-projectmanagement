import * as React from "react";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, ChevronDown, X } from "lucide-react";
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
  const [isYearPickerOpen, setIsYearPickerOpen] = React.useState(false);

  // Keep view in sync when value changes externally
  React.useEffect(() => {
    if (parsedDate) {
      setViewYear(parsedDate.getFullYear());
      setViewMonth(parsedDate.getMonth());
    }
  }, [parsedDate]);

  // Reset year picker view when calendar closes
  React.useEffect(() => {
    if (!isOpen) {
      setIsYearPickerOpen(false);
    }
  }, [isOpen]);

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
          "w-full h-10 px-3 rounded-lg border bg-white text-sm transition-all flex items-center justify-between text-left outline-none focus:outline-none focus-visible:outline-none ring-0 focus:ring-0 focus-visible:ring-0 select-none cursor-pointer group",
          error
            ? "border-red-400 focus:border-red-500"
            : isOpen
            ? "border-telkom-navy ring-0 outline-none"
            : "border-slate-400 hover:border-slate-500 focus:border-telkom-navy",
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
        className="w-[300px] p-3 rounded-2xl border-none bg-white shadow-xl z-50 duration-75 hide-scrollbar"
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
            <button
              type="button"
              onClick={() => setIsYearPickerOpen((prev) => !prev)}
              className={cn(
                "inline-flex items-center gap-1 font-semibold text-xs sm:text-sm px-2 py-0.5 rounded-md transition-colors cursor-pointer border border-transparent select-none",
                isYearPickerOpen
                  ? "bg-telkom-navy text-white hover:bg-telkom-navy shadow-2xs"
                  : "text-slate-800 hover:bg-slate-100 hover:text-telkom-navy"
              )}
              title="Pilih tahun"
            >
              <span>{viewYear}</span>
              <ChevronDown
                className={cn(
                  "h-3 w-3 text-slate-400 transition-transform duration-100",
                  isYearPickerOpen && "rotate-180 text-white"
                )}
              />
            </button>
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

        {isYearPickerOpen ? (
          <div className="py-1">
            <div className="flex items-center justify-between mb-2 px-1">
              <span className="text-xs font-semibold text-slate-500">Pilih Tahun</span>
              <button
                type="button"
                onClick={() => setIsYearPickerOpen(false)}
                className="text-xs font-medium text-telkom-navy hover:underline cursor-pointer"
              >
                Kembali ke Kalender
              </button>
            </div>
            <div className="grid grid-cols-4 gap-1.5 max-h-[220px] overflow-y-auto hide-scrollbar p-0.5">
              {yearOptions.map((y) => {
                const isSelectedYear = y === viewYear;
                const isSystemYear = y === currentYear;
                return (
                  <button
                    key={y}
                    type="button"
                    onClick={() => {
                      setViewYear(y);
                      setIsYearPickerOpen(false);
                    }}
                    className={cn(
                      "h-9 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center justify-center border-0 outline-none select-none",
                      isSelectedYear
                        ? "bg-telkom-navy text-white shadow-xs font-bold"
                        : isSystemYear
                        ? "border border-telkom-navy/40 text-telkom-navy hover:bg-slate-100 font-semibold"
                        : "text-slate-700 hover:bg-slate-100 hover:text-slate-900"
                    )}
                  >
                    {y}
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          <>
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
                      "h-8 w-8 mx-auto flex items-center justify-center text-xs rounded-lg transition-all cursor-pointer font-medium border-0 outline-none",
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

              {/* Next month padding days to maintain consistent 6-row height */}
              {Array.from({ length: 42 - (firstDayIndex + daysInCurrentMonth) }).map((_, i) => {
                const dayNum = i + 1;
                return (
                  <div
                    key={`next-${i}`}
                    className="h-8 flex items-center justify-center text-xs text-slate-300 font-normal pointer-events-none"
                  >
                    {dayNum}
                  </div>
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
          </>
        )}
      </PopoverContent>
    </Popover>
  );
}

