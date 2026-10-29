import type { Table, ColumnFiltersState } from "@tanstack/react-table";
import { RotateCcw } from "lucide-react";
import { FILTER_CATEGORIES } from "@/lib/table-constants";

export interface DataTableActiveFiltersProps<TData> {
  table: Table<TData>;
  columnFilters: ColumnFiltersState;
}

/**
 * Molecule rendering active table filter pill badges with individual remove and clear all triggers.
 */
export function DataTableActiveFilters<TData>({
  table,
  columnFilters,
}: DataTableActiveFiltersProps<TData>) {
  if (columnFilters.length === 0) return null;

  return (
    <div className="flex items-start justify-end gap-2.5 -mt-2 pt-0.5 w-full">
      {/* Left Column: Filter chips that wrap without intruding under Clear all */}
      <div className="flex flex-wrap items-center justify-end gap-1.5 flex-1 min-w-0">
        <span className="text-xs text-slate-400 font-medium mr-1 select-none shrink-0">
          Active filters:
        </span>
        {columnFilters.map((filter) => {
          const category = FILTER_CATEGORIES.find((c) => c.id === filter.id);
          const label = category ? category.label : filter.id;
          const values = Array.isArray(filter.value)
            ? (filter.value as string[])
            : [String(filter.value)];

          return values.map((val) => (
            <span
              key={`${filter.id}-${val}`}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-white border border-slate-300/80 text-slate-700 shadow-none transition-colors"
            >
              <span className="text-slate-400 font-normal">{label}:</span>
              <span className="text-telkom-navy font-semibold">{val}</span>
              <button
                type="button"
                onClick={() => {
                  const next = values.filter((v) => v !== val);
                  table
                    .getColumn(filter.id)
                    ?.setFilterValue(next.length > 0 ? next : undefined);
                }}
                className="hover:text-telkom-red text-slate-400 p-0.5 rounded cursor-pointer leading-none transition-colors"
                title={`Remove ${label}: ${val}`}
              >
                ✕
              </button>
            </span>
          ));
        })}
      </div>

      {/* Right Column: Divider | and Clear all button locked at top-right */}
      <div className="shrink-0 flex items-center gap-2.5 self-start">
        <span className="text-slate-300 text-xs select-none leading-none">|</span>
        <button
          type="button"
          data-testid="clear-all-filters"
          onClick={() => table.resetColumnFilters()}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-white border border-telkom-red/80 text-telkom-red hover:bg-telkom-red hover:text-white hover:border-telkom-red active:bg-red-700 transition-all cursor-pointer shadow-none"
          title="Clear all active filters"
        >
          <RotateCcw className="h-3 w-3" />
          Clear all
        </button>
      </div>
    </div>
  );
}

