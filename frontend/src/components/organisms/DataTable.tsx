import * as React from "react";
import {
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  type VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useVirtualizer } from "@tanstack/react-virtual";
import { RotateCcw } from "lucide-react";

import {
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { DataTableFilter } from "@/components/molecules/DataTableFilter";
import { DataTableViewOptions } from "@/components/molecules/DataTableViewOptions";
import { DataTableSearchInput } from "@/components/molecules/DataTableSearchInput";
import { cn } from "@/lib/utils";
import {
  MANDATORY_COLUMN_IDS,
  FILTER_CATEGORIES,
  STORAGE_KEY_VISIBILITY,
  STORAGE_KEY_ORDER,
  STORAGE_KEY_FILTERS,
} from "./columns";

const LOCKED_COLUMNS = ["actions", "nomor"];

export const customGlobalFilterFn = (
  row: any,
  columnId: string,
  filterValue: any
): boolean => {
  if (!filterValue) return true;

  const query =
    typeof filterValue === "string"
      ? filterValue.toLowerCase().trim()
      : filterValue.query;
  const targetCol =
    typeof filterValue === "string" ? "all" : filterValue.targetColumn;

  if (!query) return true;

  // If a specific target column is selected, only evaluate that column
  if (targetCol && targetCol !== "all" && columnId !== targetCol) {
    return false;
  }

  const rawVal = row.getValue(columnId);
  if (rawVal == null) return false;

  // Standard case-insensitive string matching
  const strVal = String(rawVal).toLowerCase();
  if (strVal.includes(query)) return true;

  // Special case: Rupiah formatted currency for nilai_kontrak_obl
  if (columnId === "nilai_kontrak_obl" && typeof rawVal === "number") {
    const formatted = new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
    })
      .format(rawVal)
      .toLowerCase();
    if (formatted.includes(query)) return true;
  }

  return false;
};

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  actionSlot?: React.ReactNode;
  isLoading?: boolean;
  isCreateMode?: boolean;
  createFormSlot?: React.ReactNode;
  highlightedRowId?: string | null;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  actionSlot,
  isLoading = false,
  isCreateMode = false,
  createFormSlot,
  highlightedRowId = null,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = React.useState<any>(undefined);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(() => {
    if (typeof window === "undefined") return [];
    try {
      const saved = localStorage.getItem(STORAGE_KEY_FILTERS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          const validIds = new Set(FILTER_CATEGORIES.map((c) => c.id));
          return parsed.filter(
            (item) =>
              item &&
              typeof item.id === "string" &&
              validIds.has(item.id) &&
              item.value !== undefined &&
              (!Array.isArray(item.value) || item.value.length > 0)
          );
        }
      }
    } catch (e) {
      console.error("Failed to parse column filters from localStorage", e);
    }
    return [];
  });

  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>(() => {
    if (typeof window === "undefined") return {};
    try {
      const saved = localStorage.getItem(STORAGE_KEY_VISIBILITY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          ...parsed,
          actions: true,
          nomor: true,
          project_id_pm: true,
        };
      }
    } catch (e) {
      console.error("Failed to parse column visibility from localStorage", e);
    }
    return {};
  });

  const [columnOrder, setColumnOrder] = React.useState<string[]>(() => {
    const allIds = columns.map((col) => (col.id || (col as any).accessorKey) as string);
    if (typeof window === "undefined") return allIds;
    try {
      const saved = localStorage.getItem(STORAGE_KEY_ORDER);
      if (saved) {
        const parsed = JSON.parse(saved) as string[];
        if (Array.isArray(parsed) && parsed.length > 0) {
          const mandatory = Array.from(MANDATORY_COLUMN_IDS);
          const validSaved = parsed.filter(
            (id) => !mandatory.includes(id as any) && allIds.includes(id)
          );
          const missing = allIds.filter(
            (id) => !mandatory.includes(id as any) && !validSaved.includes(id)
          );
          return [...mandatory, ...validSaved, ...missing];
        }
      }
    } catch (e) {
      console.error("Failed to parse column order from localStorage", e);
    }
    return allIds;
  });

  const table = useReactTable({
    data,
    columns,
    globalFilterFn: customGlobalFilterFn,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onGlobalFilterChange: setGlobalFilter,
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: (updater) => {
      setColumnVisibility((prev) => {
        const next = typeof updater === "function" ? updater(prev) : updater;
        const sanitized = {
          ...next,
          actions: true,
          nomor: true,
          project_id_pm: true,
        };
        try {
          localStorage.setItem(STORAGE_KEY_VISIBILITY, JSON.stringify(sanitized));
        } catch (e) {
          console.error("Failed to save column visibility", e);
        }
        return sanitized;
      });
    },
    onColumnOrderChange: (updater) => {
      setColumnOrder((prev) => {
        const next = typeof updater === "function" ? updater(prev) : updater;
        const mandatory = Array.from(MANDATORY_COLUMN_IDS);
        const nonMandatory = next.filter((id) => !mandatory.includes(id as any));
        const sanitized = [...mandatory, ...nonMandatory];
        try {
          localStorage.setItem(STORAGE_KEY_ORDER, JSON.stringify(sanitized));
        } catch (e) {
          console.error("Failed to save column order", e);
        }
        return sanitized;
      });
    },
    onColumnFiltersChange: (updater) => {
      setColumnFilters((prev) => {
        const next = typeof updater === "function" ? updater(prev) : updater;
        const sanitized = Array.isArray(next)
          ? next.filter(
              (f) =>
                f &&
                f.value !== undefined &&
                (!Array.isArray(f.value) || f.value.length > 0)
            )
          : [];
        try {
          if (sanitized.length > 0) {
            localStorage.setItem(STORAGE_KEY_FILTERS, JSON.stringify(sanitized));
          } else {
            localStorage.removeItem(STORAGE_KEY_FILTERS);
          }
        } catch (e) {
          console.error("Failed to save column filters to localStorage", e);
        }
        return sanitized;
      });
    },
    columnResizeMode: "onChange",
    state: {
      sorting,
      globalFilter,
      columnVisibility,
      columnOrder,
      columnFilters,
    },
  });

  const { rows } = table.getRowModel();
  const parentRef = React.useRef<HTMLDivElement>(null);
  const [isScrolledX, setIsScrolledX] = React.useState(false);

  React.useEffect(() => {
    const el = parentRef.current;
    if (!el) return;

    const handleScroll = () => {
      const scrolled = el.scrollLeft > 2;
      setIsScrolledX((prev) => (prev !== scrolled ? scrolled : prev));
    };

    el.addEventListener("scroll", handleScroll, { passive: true });
    return () => el.removeEventListener("scroll", handleScroll);
  }, []);

  const lastPinnedId = React.useMemo(() => {
    const visiblePinned = table
      .getVisibleLeafColumns()
      .map((c) => c.id)
      .filter((id) => LOCKED_COLUMNS.includes(id));
    return visiblePinned[visiblePinned.length - 1];
  }, [table, columnVisibility, columnOrder]);

  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 44,
    overscan: 20,
  });

  // Smoothly auto-scroll to highlighted newly-added row
  React.useEffect(() => {
    if (!isCreateMode && highlightedRowId && rows.length > 0) {
      const targetIndex = rows.findIndex(
        (r) => (r.original as any)?.project_id_pm === highlightedRowId
      );
      if (targetIndex >= 0) {
        const timeoutId = setTimeout(() => {
          rowVirtualizer.scrollToIndex(targetIndex, {
            align: "auto",
            behavior: "smooth",
          });
        }, 120);
        return () => clearTimeout(timeoutId);
      }
    }
  }, [isCreateMode, highlightedRowId, rows, rowVirtualizer]);

  const virtualRows = rowVirtualizer.getVirtualItems();
  const totalSize = rowVirtualizer.getTotalSize();

  const paddingTop = virtualRows.length > 0 ? virtualRows[0].start : 0;
  const paddingBottom = virtualRows.length > 0
    ? totalSize - virtualRows[virtualRows.length - 1].end
    : 0;

  return (
    <div className="space-y-4 flex flex-col flex-1 min-h-0">
      {/* Responsive Table Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2.5 md:gap-4 w-full">
        {/* Row 1 on Mobile: 3 equal-width buttons (Add Project, Filter, Columns) / Left Item on Desktop */}
        <div className="grid grid-cols-3 gap-2 w-full md:flex md:w-auto md:items-center md:gap-3">
          <div className="w-full md:w-auto [&>button]:w-full md:[&>button]:w-auto [&>button]:justify-center">
            {actionSlot}
          </div>
          <div className="w-full md:hidden">
            <DataTableFilter table={table} className="w-full" disabled={isCreateMode} />
          </div>
          <div className="w-full md:hidden">
            <DataTableViewOptions table={table} className="w-full" disabled={isCreateMode} />
          </div>
        </div>

        {/* Search Bar (Full-width on mobile row 2) & Desktop Controls (Search + Filter + Columns) */}
        <div className="flex flex-col md:flex-row items-center gap-2.5 md:gap-3 w-full md:w-auto">
          <DataTableSearchInput table={table} className="w-full md:w-[420px]" disabled={isCreateMode} />
          <div className="hidden md:flex items-center gap-3">
            <DataTableFilter table={table} disabled={isCreateMode} />
            <DataTableViewOptions table={table} disabled={isCreateMode} />
          </div>
        </div>
      </div>

      {/* Active Filter Chips / Pills */}
      {!isCreateMode && columnFilters.length > 0 && (
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
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200 shadow-2xs group hover:border-slate-300 transition-colors"
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
                    className="hover:text-red-600 text-slate-400 p-0.5 rounded cursor-pointer leading-none transition-colors"
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
              onClick={() => table.resetColumnFilters()}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold text-telkom-red border border-transparent bg-red-50/60 hover:border-telkom-red/40 transition-all cursor-pointer"
              title="Clear all active filters"
            >
              <RotateCcw className="h-3 w-3" />
              Clear all
            </button>
          </div>
        </div>
      )}

      {/* Main Table or Form Content Frame */}
      <div 
        className="rounded-lg border border-slate-200 bg-white shadow-sm flex-1 min-h-0 w-full relative overflow-hidden flex flex-col isolate"
      >
        {isCreateMode && createFormSlot ? (
          createFormSlot
        ) : (
          <div
            ref={parentRef}
            className="w-full h-full overflow-auto hide-scrollbar"
          >
            <table className="w-full caption-bottom text-sm border-separate border-spacing-0" style={{ width: table.getTotalSize(), tableLayout: 'fixed' }}>
          <TableHeader className="bg-slate-100 sticky top-0 z-20 shadow-[0_1px_2px_rgba(0,0,0,0.1)]">
            {table.getHeaderGroups().map((headerGroup) => {
              const visiblePinnedIds = headerGroup.headers
                .map((h) => h.column.id)
                .filter((id) => LOCKED_COLUMNS.includes(id));
              const lastPinnedId = visiblePinnedIds[visiblePinnedIds.length - 1];

              return (
                <TableRow key={headerGroup.id} className="hover:bg-transparent">
                  {headerGroup.headers.map((header) => {
                    const isPinned = LOCKED_COLUMNS.includes(header.column.id);
                    const isLastPinned = header.column.id === lastPinnedId;

                    return (
                      <TableHead 
                        key={header.id} 
                        className={cn(
                          "text-telkom-navy font-semibold h-11 relative group/resizer overflow-hidden text-ellipsis bg-slate-100 border-b border-slate-200",
                          isPinned ? "sticky z-30" : "sticky top-0 z-20",
                          isScrolledX && isLastPinned && "shadow-[4px_0_8px_-2px_rgba(0,0,0,0.08)]"
                        )}
                        style={{ 
                          width: header.getSize(),
                          left: isPinned ? `${header.getStart()}px` : undefined,
                          top: 0,
                        }}
                      >
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                        
                        {/* Resizer Handle */}
                        <div
                          onMouseDown={header.getResizeHandler()}
                          onTouchStart={header.getResizeHandler()}
                          className={`absolute right-0 top-0 h-full w-1 cursor-col-resize bg-slate-300 opacity-0 group-hover/resizer:opacity-100 transition-opacity z-10 ${
                            header.column.getIsResizing() ? "bg-blue-500 opacity-100" : ""
                          }`}
                        />
                      </TableHead>
                    );
                  })}
                </TableRow>
              );
            })}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 20 }).map((_, rowIndex) => {
                const headerGroup = table.getHeaderGroups()[0];
                const visibleHeaders = headerGroup?.headers ?? [];
                const visiblePinnedIds = visibleHeaders
                  .map((h) => h.column.id)
                  .filter((id) => LOCKED_COLUMNS.includes(id));
                const lastPinnedId = visiblePinnedIds[visiblePinnedIds.length - 1];

                return (
                  <TableRow key={`skeleton-row-${rowIndex}`} className="hover:bg-transparent">
                    {visibleHeaders.map((header) => {
                      const isPinned = LOCKED_COLUMNS.includes(header.column.id);
                      const isLastPinned = header.column.id === lastPinnedId;
                      const colId = header.column.id;

                      return (
                        <TableCell
                          key={`skeleton-cell-${header.id}-${rowIndex}`}
                          className={cn(
                            "py-2.5 border-b border-slate-100",
                            isPinned ? "sticky z-10 bg-white" : "bg-white",
                            isScrolledX && isLastPinned && "shadow-[4px_0_8px_-2px_rgba(0,0,0,0.06)]"
                          )}
                          style={{
                            width: header.getSize(),
                            left: isPinned ? `${header.getStart()}px` : undefined,
                          }}
                        >
                          <Skeleton
                            className={cn(
                              "h-4 rounded",
                              colId === "nomor"
                                ? "w-6 mx-auto"
                                : colId === "actions"
                                ? "w-8 mx-auto"
                                : "w-3/4"
                            )}
                          />
                        </TableCell>
                      );
                    })}
                  </TableRow>
                );
              })
            ) : rows.length ? (
              <>
                {paddingTop > 0 && (
                  <TableRow className="hover:bg-transparent">
                    <TableCell colSpan={table.getVisibleLeafColumns().length} style={{ height: `${paddingTop}px`, padding: 0, border: 0 }} />
                  </TableRow>
                )}
                {virtualRows.map((virtualRow) => {
                  const row = rows[virtualRow.index];
                  if (!row) return null;
                  const isRowHighlighted =
                    Boolean(highlightedRowId) &&
                    (row.original as any)?.project_id_pm === highlightedRowId;

                  return (
                    <TableRow
                      key={row.id}
                      data-index={virtualRow.index}
                      data-state={row.getIsSelected() && "selected"}
                      className={cn(
                        "group h-11 transition-colors duration-700",
                        isRowHighlighted && "bg-sky-50/90 font-medium"
                      )}
                    >
                      {row.getVisibleCells().map((cell) => {
                        const isPinned = LOCKED_COLUMNS.includes(cell.column.id);
                        const isLastPinned = cell.column.id === lastPinnedId;

                        return (
                          <TableCell 
                            key={cell.id} 
                            className={cn(
                              "py-1.5 px-3 overflow-hidden text-ellipsis whitespace-nowrap transition-colors duration-700 border-b",
                              isRowHighlighted
                                ? isPinned
                                  ? "sticky z-10 bg-sky-50 text-sky-950 font-semibold border-sky-200"
                                  : "bg-sky-50/90 text-sky-950 font-medium border-sky-200"
                                : isPinned
                                ? "sticky z-10 bg-white text-slate-700 group-hover:bg-slate-50 border-slate-100"
                                : "bg-white text-slate-700 group-hover:bg-slate-50 border-slate-100",
                              isScrolledX && isLastPinned && "shadow-[4px_0_8px_-2px_rgba(0,0,0,0.06)]"
                            )}
                            style={{ 
                              width: cell.column.getSize(),
                              left: isPinned ? `${cell.column.getStart()}px` : undefined,
                            }}
                          >
                            {cell.column.id === "nomor" ? (
                              <div className="text-center font-medium">{virtualRow.index + 1}</div>
                            ) : (
                              flexRender(
                                cell.column.columnDef.cell,
                                cell.getContext()
                              )
                            )}
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  );
                })}
                {paddingBottom > 0 && (
                  <TableRow className="hover:bg-transparent">
                    <TableCell colSpan={table.getVisibleLeafColumns().length} style={{ height: `${paddingBottom}px`, padding: 0, border: 0 }} />
                  </TableRow>
                )}
              </>
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-32 text-center text-slate-500"
                >
                  No project data available.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </table>
      </div>
        )}
      </div>
    </div>
  );
}