import * as React from "react";
import { ArrowUp, ArrowDown, ArrowUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Column } from "@tanstack/react-table";
import type { ProjectPM } from "@/types/project";

export type SortType = "alpha" | "date" | "number";

export interface DataTableSortHeaderProps {
  column: Column<ProjectPM, unknown>;
  title: string;
  align?: "center" | "left";
  sortType?: SortType;
  className?: string;
  testId?: string;
}

/**
 * Universal header cell molecule with 3-state cyclic direct-click sort toggle
 * (Unsorted -> Ascending -> Descending -> Normal/Reset) positioned on the right side.
 */
export function DataTableSortHeader({
  column,
  title,
  align = "center",
  sortType = "alpha",
  className,
  testId,
}: DataTableSortHeaderProps) {
  const isSorted = column.getIsSorted(); // "asc" | "desc" | false

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    // 3-state cycle: Default/Unsorted (false) -> Ascending (false) -> Descending (true) -> Reset/Normal (clear)
    if (!isSorted) {
      column.toggleSorting(false);
    } else if (isSorted === "asc") {
      column.toggleSorting(true);
    } else {
      column.clearSorting();
    }
  };

  const getTooltip = () => {
    if (!isSorted) {
      if (sortType === "alpha") return "Sort Ascending (A - Z)";
      if (sortType === "date") return "Sort: Earliest First";
      if (sortType === "number") return "Sort: Smallest First";
      return "Sort: Ascending";
    }
    if (isSorted === "asc") {
      if (sortType === "alpha") return "Sort Descending (Z - A)";
      if (sortType === "date") return "Sort: Latest First";
      if (sortType === "number") return "Sort: Largest First";
      return "Sort: Descending";
    }
    return "Reset Sort (Kembali Normal)";
  };

  const buttonElement = (
    <button
      type="button"
      data-testid={testId || `sort-${column.id}`}
      onClick={handleToggle}
      className={cn(
        "group/sort h-6.5 w-6.5 inline-flex items-center justify-center rounded-md transition-all cursor-pointer select-none outline-none shrink-0",
        "border",
        isSorted
          ? "border-telkom-navy text-telkom-navy bg-white/70 shadow-2xs hover:bg-white"
          : "border-transparent text-slate-400 bg-transparent hover:border-telkom-navy hover:text-telkom-navy hover:bg-slate-200/50",
        "active:bg-slate-200/80 focus-visible:ring-2 focus-visible:ring-telkom-navy/30"
      )}
      title={getTooltip()}
      aria-label={`Sort by ${title}`}
    >
      {isSorted === "desc" ? (
        <ArrowUp className="h-3.5 w-3.5 stroke-[2.5] text-telkom-navy transition-colors" />
      ) : isSorted === "asc" ? (
        <ArrowDown className="h-3.5 w-3.5 stroke-[2.5] text-telkom-navy transition-colors" />
      ) : (
        <ArrowUpDown className="h-3.5 w-3.5 stroke-[2] transition-colors group-hover/sort:text-telkom-navy" />
      )}
    </button>
  );

  if (align === "left") {
    return (
      <div
        className={cn(
          "flex items-center justify-between w-full min-h-[26px] gap-2.5",
          className
        )}
      >
        <span
          className="font-semibold text-telkom-navy select-none text-left truncate min-w-0 flex-1"
          title={title}
        >
          {title}
        </span>
        <div className="shrink-0 mr-3 flex items-center">
          {buttonElement}
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex items-center justify-between w-full min-h-[26px] gap-2",
        className
      )}
    >
      {/* Symmetrical left spacer matching right button (26px) + margin-right (12px) = 38px to maintain true visual center */}
      <div
        className="w-[38px] shrink-0 pointer-events-none select-none"
        aria-hidden="true"
      />
      <span
        className="font-semibold text-telkom-navy select-none text-center truncate min-w-0 flex-1 px-1"
        title={title}
      >
        {title}
      </span>
      <div className="w-[38px] shrink-0 flex items-center">
        <div className="mr-3">
          {buttonElement}
        </div>
      </div>
    </div>
  );
}
