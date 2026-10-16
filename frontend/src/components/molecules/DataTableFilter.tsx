import * as React from "react";
import type { Table } from "@tanstack/react-table";
import { Search, RotateCcw } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  FILTER_CATEGORIES,
  type FilterCategory,
  getSlaCategory,
  formatMonthYearKey,
  STORAGE_KEY_FILTERS,
} from "@/components/organisms/columns";

const ID_MONTH_ORDER: Record<string, number> = {
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

function parseMonthYearSortKey(str: string): number {
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

interface DataTableFilterProps<TData> {
  table: Table<TData>;
  className?: string;
  disabled?: boolean;
}

interface FilterCheckboxProps {
  checked: boolean;
  onChange: () => void;
}

function FilterCheckbox({ checked, onChange }: FilterCheckboxProps) {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onChange();
      }}
      className={cn(
        "h-4 w-4 rounded-[4px] flex items-center justify-center transition-all shrink-0 cursor-pointer",
        checked
          ? "bg-[#1877F2] text-white hover:bg-[#166fe5] shadow-xs"
          : "border-2 border-slate-300 bg-white hover:border-slate-400"
      )}
    >
      {checked && (
        <svg
          className="h-3 w-3 stroke-[3] text-white"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M4.5 12.75l6 6 9-13.5"
          />
        </svg>
      )}
    </button>
  );
}

export function DataTableFilter<TData>({
  table,
  className,
  disabled = false,
}: DataTableFilterProps<TData>) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [activeCategory, setActiveCategory] = React.useState<FilterCategory>(
    FILTER_CATEGORIES[0]
  );
  const [optionSearchQuery, setOptionSearchQuery] = React.useState("");

  // Extract all rows to calculate available unique options and their counts
  const allRows = table.getCoreRowModel().flatRows;

  // Compute available unique values and occurrence counts per category
  const categoryOptionsMap = React.useMemo(() => {
    const map = new Map<string, Array<{ value: string; count: number }>>();

    FILTER_CATEGORIES.forEach((cat) => {
      const counts = new Map<string, number>();

      allRows.forEach((row) => {
        let val: string;
        if (cat.id === "sla_bast") {
          const dbVal = row.getValue("waktu_penyelesaian_bast");
          val = dbVal != null
            ? getSlaCategory(Number(dbVal))
            : getSlaCategory(
                row.getValue("tanggal_request_dr") as string,
                row.getValue("tanggal_close_dr") as string
              );
        } else if (cat.id === "bulan_bc" || cat.id === "komitmen_bc") {
          val = formatMonthYearKey(row.getValue(cat.id));
        } else {
          const raw = row.getValue(cat.id);
          val = raw != null && String(raw).trim() !== "" ? String(raw).trim() : "-";
        }
        counts.set(val, (counts.get(val) || 0) + 1);
      });

      let sorted: Array<{ value: string; count: number }>;

      if (cat.id === "sla_bast") {
        // Custom logical order for SLA categories
        const slaOrder = ["<= 7 Hari", "8 - 10 Hari", "> 10 Hari", "-"];
        sorted = Array.from(counts.entries())
          .sort(([valA], [valB]) => {
            const idxA = slaOrder.indexOf(valA);
            const idxB = slaOrder.indexOf(valB);
            return (idxA !== -1 ? idxA : 99) - (idxB !== -1 ? idxB : 99);
          })
          .map(([value, count]) => ({ value, count }));
      } else if (cat.id === "tahun_kontrak" || cat.id === "tahun_bast") {
        // Sort years descending (newest first, '-' last)
        sorted = Array.from(counts.entries())
          .sort(([valA], [valB]) => {
            if (valA === "-") return 1;
            if (valB === "-") return -1;
            return valB.localeCompare(valA);
          })
          .map(([value, count]) => ({ value, count }));
      } else if (cat.id === "bulan_bc" || cat.id === "komitmen_bc") {
        // Sort month-year chronologically descending (newest first, '-' last)
        sorted = Array.from(counts.entries())
          .sort(([valA], [valB]) => {
            if (valA === "-") return 1;
            if (valB === "-") return -1;
            const keyA = parseMonthYearSortKey(valA);
            const keyB = parseMonthYearSortKey(valB);
            if (keyA > 0 && keyB > 0) {
              return keyB - keyA;
            }
            return valB.localeCompare(valA);
          })
          .map(([value, count]) => ({ value, count }));
      } else {
        // Default alphabetical sort with '-' last
        sorted = Array.from(counts.entries())
          .sort(([valA], [valB]) => {
            if (valA === "-") return 1;
            if (valB === "-") return -1;
            return valA.localeCompare(valB);
          })
          .map(([value, count]) => ({ value, count }));
      }

      map.set(cat.id, sorted);
    });

    return map;
  }, [allRows]);

  // Current column filter state for all categories
  const columnFilters = table.getState().columnFilters;

  // Helper to get active selected values for a specific category
  const getSelectedValuesForCategory = React.useCallback(
    (categoryId: string): string[] => {
      const filter = columnFilters.find((f) => f.id === categoryId);
      if (!filter || !Array.isArray(filter.value)) return [];
      return filter.value as string[];
    },
    [columnFilters]
  );

  // Total active filter categories count
  const activeCategoriesCount = React.useMemo(() => {
    return FILTER_CATEGORIES.filter(
      (cat) => getSelectedValuesForCategory(cat.id).length > 0
    ).length;
  }, [FILTER_CATEGORIES, getSelectedValuesForCategory]);

  // Total individual filter items selected
  const totalSelectedFiltersCount = React.useMemo(() => {
    return FILTER_CATEGORIES.reduce((total, cat) => {
      return total + getSelectedValuesForCategory(cat.id).length;
    }, 0);
  }, [FILTER_CATEGORIES, getSelectedValuesForCategory]);

  // Options for currently selected category
  const currentCategoryOptions = React.useMemo(() => {
    const options = categoryOptionsMap.get(activeCategory.id) || [];
    if (!optionSearchQuery.trim()) return options;

    const query = optionSearchQuery.toLowerCase().trim();
    return options.filter((opt) => opt.value.toLowerCase().includes(query));
  }, [categoryOptionsMap, activeCategory.id, optionSearchQuery]);

  // Selected values for current active category
  const currentSelectedValues = getSelectedValuesForCategory(activeCategory.id);

  // Toggle single option selection
  const handleToggleOption = (value: string) => {
    const current = getSelectedValuesForCategory(activeCategory.id);
    const exists = current.includes(value);

    let next: string[];
    if (exists) {
      next = current.filter((v) => v !== value);
    } else {
      next = [...current, value];
    }

    const column = table.getColumn(activeCategory.id);
    if (column) {
      column.setFilterValue(next.length > 0 ? next : undefined);
    }
  };

  // Select all visible options for current category
  const handleSelectAllCurrent = () => {
    const allVisibleValues = currentCategoryOptions.map((o) => o.value);
    const combined = Array.from(
      new Set([...currentSelectedValues, ...allVisibleValues])
    );
    const column = table.getColumn(activeCategory.id);
    if (column) {
      column.setFilterValue(combined);
    }
  };

  // Clear all selections for current category
  const handleClearCurrent = () => {
    const column = table.getColumn(activeCategory.id);
    if (column) {
      column.setFilterValue(undefined);
    }
  };

  // Reset all filters across all categories
  const handleResetAllFilters = () => {
    table.resetColumnFilters();
    try {
      localStorage.removeItem(STORAGE_KEY_FILTERS);
    } catch (e) {
      console.error("Failed to remove column filters from localStorage", e);
    }
    setOptionSearchQuery("");
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger
        disabled={disabled}
        className={cn(
          buttonVariants({ variant: "outline", size: "lg" }),
          "group/filter h-10 rounded-lg flex items-center justify-center cursor-pointer px-2 sm:px-4 gap-1.5 sm:gap-2 shadow-sm transition-all text-xs sm:text-sm",
          disabled
            ? "!opacity-80 disabled:!opacity-80 pointer-events-none cursor-not-allowed !bg-slate-100/70 !border-slate-300 !text-slate-700 shadow-2xs"
            : isOpen || activeCategoriesCount > 0
            ? "border-telkom-navy bg-slate-50 text-telkom-navy shadow-inner"
            : "border-slate-200 bg-white hover:bg-slate-50 hover:border-telkom-navy hover:text-telkom-navy active:bg-slate-100",
          className
        )}
      >
        <span
          className={cn(
            "material-symbols-outlined text-[18px] sm:text-[20px] transition-colors leading-none select-none",
            disabled
              ? "!text-slate-500"
              : isOpen || activeCategoriesCount > 0
              ? "text-telkom-navy"
              : "text-slate-500 group-hover/filter:text-telkom-navy"
          )}
        >
          filter_alt
        </span>
        <span
          className={cn(
            "font-medium truncate transition-colors",
            disabled
              ? "!text-slate-700"
              : isOpen || activeCategoriesCount > 0
              ? "text-telkom-navy"
              : "text-slate-600 group-hover/filter:text-telkom-navy"
          )}
        >
          Filter
        </span>

        {activeCategoriesCount > 0 && (
          <span className="ml-0.5 inline-flex items-center justify-center h-4.5 min-w-4.5 px-1 rounded-full bg-telkom-navy text-white text-[10px] font-semibold leading-none">
            {totalSelectedFiltersCount}
          </span>
        )}
      </PopoverTrigger>

      <PopoverContent
        align="end"
        className="w-[calc(100vw-32px)] sm:w-[460px] max-w-[460px] p-0 shadow-xl border-slate-200 rounded-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-3.5 py-2.5 border-b border-slate-100 bg-white">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm text-slate-800">
              Filter Projects
            </span>
            {activeCategoriesCount > 0 && (
              <span className="text-[11px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                {activeCategoriesCount} active {activeCategoriesCount > 1 ? "categories" : "category"}
              </span>
            )}
          </div>

          {activeCategoriesCount > 0 && (
            <button
              type="button"
              onClick={handleResetAllFilters}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-semibold text-telkom-red border border-transparent bg-red-50/60 hover:border-telkom-red/40 transition-all cursor-pointer"
              title="Reset all filters"
            >
              <RotateCcw className="h-3 w-3" />
              Reset all
            </button>
          )}
        </div>

        {/* Master-Detail Split Pane */}
        <div className="flex h-[320px]">
          {/* Left Column: Categories List */}
          <div className="w-44 border-r border-slate-100 bg-slate-50/70 p-2 space-y-1 overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            {FILTER_CATEGORIES.map((category) => {
              const isSelected = activeCategory.id === category.id;
              const selectedCount = getSelectedValuesForCategory(category.id).length;

              return (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => {
                    setActiveCategory(category);
                    setOptionSearchQuery("");
                  }}
                  className={cn(
                    "w-full h-[34px] flex items-center justify-between px-2.5 rounded-lg text-xs transition-all text-left cursor-pointer border",
                    isSelected
                      ? "bg-white text-telkom-navy font-semibold shadow-xs border-slate-200/80"
                      : "border-transparent text-slate-600 hover:bg-slate-200/50 font-medium"
                  )}
                >
                  <span className="truncate">{category.label}</span>
                  {selectedCount > 0 && (
                    <span className="ml-1.5 shrink-0 inline-flex items-center justify-center h-4 min-w-4 px-1 rounded-full bg-telkom-navy/10 text-telkom-navy text-[10px] font-bold">
                      {selectedCount}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Right Column: Values / Checkbox List */}
          <div className="flex-1 p-3 flex flex-col min-w-0 bg-white">
            {/* Search Input for Current Category Options */}
            <div className="relative mb-2">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none select-none" />
              <input
                type="text"
                placeholder={
                  activeCategory.id === "tahun_kontrak" || activeCategory.id === "tahun_bast"
                    ? "Search year (e.g. 2024)..."
                    : activeCategory.id === "bulan_bc" || activeCategory.id === "komitmen_bc"
                    ? "Search month or year (e.g. November / 2024)..."
                    : activeCategory.id === "sla_bast"
                    ? "Search SLA (e.g. <= 7 Hari)..."
                    : `Search ${activeCategory.label.toLowerCase()}...`
                }
                value={optionSearchQuery}
                onChange={(e) => setOptionSearchQuery(e.target.value)}
                className="w-full h-8 pl-8 pr-7 text-xs bg-slate-50/60 border border-slate-200/60 rounded-lg text-slate-700 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-telkom-navy/60 focus:ring-1 focus:ring-telkom-navy/20 transition-all"
              />
              {optionSearchQuery && (
                <button
                  type="button"
                  onClick={() => setOptionSearchQuery("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs cursor-pointer p-0.5 leading-none"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Quick Actions Bar */}
            <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-slate-100 text-[11px]">
              <span className="text-slate-400">
                {currentSelectedValues.length} of {currentCategoryOptions.length} selected
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handleSelectAllCurrent}
                  className="text-blue-600 hover:text-blue-800 font-medium cursor-pointer transition-colors"
                >
                  Select all
                </button>
                <span className="text-slate-300">|</span>
                <button
                  type="button"
                  onClick={handleClearCurrent}
                  className="text-slate-500 hover:text-slate-800 font-medium cursor-pointer transition-colors"
                >
                  Clear
                </button>
              </div>
            </div>

            {/* Scrollable Checkbox List */}
            <div className="flex-1 overflow-y-auto space-y-0.5 pr-0.5 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
              {currentCategoryOptions.length > 0 ? (
                currentCategoryOptions.map((opt) => {
                  const isChecked = currentSelectedValues.includes(opt.value);

                  return (
                    <div
                      key={opt.value}
                      onClick={() => handleToggleOption(opt.value)}
                      className={cn(
                        "group flex items-center gap-2.5 px-2 py-1.5 rounded-lg text-slate-700 transition-all cursor-pointer select-none",
                        isChecked ? "bg-slate-50/80" : "hover:bg-slate-100/70"
                      )}
                    >
                      <FilterCheckbox
                        checked={isChecked}
                        onChange={() => handleToggleOption(opt.value)}
                      />

                      {activeCategory.id === "sla_bast" && (
                        <span
                          className={cn(
                            "w-2 h-2 rounded-full shrink-0",
                            opt.value === "<= 7 Hari" && "bg-emerald-500",
                            opt.value === "8 - 10 Hari" && "bg-amber-500",
                            opt.value === "> 10 Hari" && "bg-rose-500",
                            opt.value === "-" && "bg-slate-300"
                          )}
                          aria-hidden="true"
                        />
                      )}

                      <span
                        className={cn(
                          "text-xs flex-1 truncate transition-colors",
                          isChecked
                            ? "font-medium text-slate-900"
                            : "text-slate-700 group-hover:text-slate-900"
                        )}
                      >
                        {opt.value}
                      </span>

                      <span className="text-[11px] text-slate-400 shrink-0 font-normal">
                        ({opt.count})
                      </span>
                    </div>
                  );
                })
              ) : (
                <div className="py-8 text-center text-xs text-slate-400">
                  No options found
                </div>
              )}
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

