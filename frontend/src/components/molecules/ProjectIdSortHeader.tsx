import { ArrowUp, ArrowDown } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Column } from "@tanstack/react-table";
import type { ProjectPM } from "@/types/project";

export interface ProjectIdSortHeaderProps {
  column: Column<ProjectPM, unknown>;
}

/**
 * Header cell molecule with ascending/descending sort toggle button for Project ID PM.
 */
export function ProjectIdSortHeader({ column }: ProjectIdSortHeaderProps) {
  const isDesc = column.getIsSorted() === "desc";

  const handleToggle = () => {
    column.toggleSorting(!isDesc);
  };

  return (
    <div className="relative flex items-center justify-center w-full min-h-[26px]">
      <button
        type="button"
        data-testid="sort-project-id"
        onClick={handleToggle}
        className={cn(
          "absolute -left-2.5 top-1/2 -translate-y-1/2 h-6.5 w-6.5 inline-flex items-center justify-center rounded-md transition-all cursor-pointer select-none outline-none",
          "bg-transparent text-telkom-navy border border-transparent",
          "hover:border-telkom-navy active:bg-slate-200/60 focus-visible:ring-2 focus-visible:ring-telkom-navy/30"
        )}
        title={
          isDesc
            ? "Sort: Descending (Click for Ascending)"
            : "Sort: Ascending (Click for Descending)"
        }
        aria-label="Toggle sort order"
      >
        {isDesc ? (
          <ArrowUp className="h-3.5 w-3.5 stroke-[2.5] text-telkom-navy" />
        ) : (
          <ArrowDown className="h-3.5 w-3.5 stroke-[2.5] text-telkom-navy" />
        )}
      </button>

      <span className="font-semibold text-telkom-navy select-none text-center">
        ID PROJECT PM
      </span>
    </div>
  );
}

