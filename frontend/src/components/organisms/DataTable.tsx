import * as React from "react";
import {
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  type VisibilityState,
  type Row,
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
import { Button } from "@/components/ui/button";
import { DataTableFilter } from "@/components/molecules/DataTableFilter";
import { DataTableViewOptions } from "@/components/molecules/DataTableViewOptions";
import { DataTableSearchInput } from "@/components/molecules/DataTableSearchInput";
import { DataTableExport } from "@/components/molecules/DataTableExport";
import {
  CellOverflowPopover,
  type CellOverflowData,
} from "@/components/molecules/CellOverflowPopover";
import { cn } from "@/lib/utils";
import {
  MANDATORY_COLUMN_IDS,
  OVERFLOW_ENABLED_COLUMN_IDS,
  FILTER_CATEGORIES,
  STORAGE_KEY_VISIBILITY,
  STORAGE_KEY_ORDER,
  STORAGE_KEY_FILTERS,
  STORAGE_KEY_SORTING,
  idrCurrencyFormatter,
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

  // Special case: Rupiah formatted currency for nilai_kontrak_obl using singleton formatter
  if (columnId === "nilai_kontrak_obl" && typeof rawVal === "number") {
    const formatted = idrCurrencyFormatter.format(rawVal).toLowerCase();
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
  isFormMode?: boolean;
  createFormSlot?: React.ReactNode;
  highlightedRowId?: string | null;
  onEdit?: (row: TData) => void;
  onDelete?: (row: TData) => void;
  onTrashClick?: () => void;
  onExportExcel?: () => void;
  onExportPdf?: () => void;
}

interface VirtualTableRowProps<TData> {
  row: Row<TData>;
  virtualRowIndex: number;
  isRowHighlighted: boolean;
  lastPinnedId: string | undefined;
  isScrolledX: boolean;
  columnsSignature: string;
  onCellDoubleClick?: (e: React.MouseEvent<HTMLTableCellElement>, columnId: string, value: any) => void;
}

const VirtualTableRow = React.memo(
  function VirtualTableRow<TData>({
    row,
    virtualRowIndex,
    isRowHighlighted,
    lastPinnedId,
    isScrolledX,
    onCellDoubleClick,
  }: VirtualTableRowProps<TData>) {
    return (
      <TableRow
        data-testid="table-row"
        data-index={virtualRowIndex}
        data-state={row.getIsSelected() && "selected"}
        className={cn(
          "group h-11",
          isRowHighlighted && "bg-sky-50/90 font-medium transition-colors duration-700"
        )}
      >
        {row.getVisibleCells().map((cell) => {
          const isPinned = LOCKED_COLUMNS.includes(cell.column.id);
          const isLastPinned = cell.column.id === lastPinnedId;
          const isOverflowEligible = (OVERFLOW_ENABLED_COLUMN_IDS as readonly string[]).includes(cell.column.id);

          return (
            <TableCell
              key={cell.id}
              data-testid={`table-cell-${cell.column.id}`}
              onDoubleClick={(e) => {
                if (isOverflowEligible && onCellDoubleClick) {
                  onCellDoubleClick(e, cell.column.id, cell.getValue());
                }
              }}
              className={cn(
                "py-1.5 px-3 text-ellipsis whitespace-nowrap border-b border-slate-100",
                isLastPinned ? "overflow-visible" : "overflow-hidden",
                isOverflowEligible && "cursor-default",
                isRowHighlighted
                  ? isPinned
                    ? "sticky z-10 bg-sky-50 text-sky-950 font-semibold transition-colors duration-700"
                    : "bg-sky-50/90 text-sky-950 font-medium transition-colors duration-700"
                  : isPinned
                  ? "sticky z-10 bg-white text-slate-700 group-hover:bg-slate-50"
                  : "bg-white text-slate-700 group-hover:bg-slate-50",
                isLastPinned &&
                  "after:content-[''] after:absolute after:top-0 after:bottom-0 after:right-0 after:w-2.5 after:translate-x-full after:pointer-events-none after:transition-opacity after:duration-150 after:bg-gradient-to-r after:from-slate-900/[0.07] after:to-transparent",
                isLastPinned && (isScrolledX ? "after:opacity-100" : "after:opacity-0")
              )}
              style={{
                width: cell.column.getSize(),
                left: isPinned ? `${cell.column.getStart()}px` : undefined,
              }}
            >
              {cell.column.id === "nomor" ? (
                <div className="text-center font-medium">{virtualRowIndex + 1}</div>
              ) : (
                flexRender(cell.column.columnDef.cell, cell.getContext())
              )}
            </TableCell>
          );
        })}
      </TableRow>
    );
  },
  (prev, next) => {
    return (
      prev.row.original === next.row.original &&
      prev.virtualRowIndex === next.virtualRowIndex &&
      prev.isRowHighlighted === next.isRowHighlighted &&
      prev.lastPinnedId === next.lastPinnedId &&
      prev.isScrolledX === next.isScrolledX &&
      prev.columnsSignature === next.columnsSignature &&
      prev.onCellDoubleClick === next.onCellDoubleClick
    );
  }
) as <TData>(props: VirtualTableRowProps<TData>) => React.ReactElement;

export function DataTable<TData, TValue>({
  columns,
  data,
  actionSlot,
  isLoading = false,
  isCreateMode = false,
  isFormMode,
  createFormSlot,
  highlightedRowId = null,
  onEdit,
  onDelete,
  onTrashClick,
  onExportExcel,
  onExportPdf,
}: DataTableProps<TData, TValue>) {
  const isFormActive = isFormMode ?? isCreateMode;
  const [sorting, setSorting] = React.useState<SortingState>(() => {
    const defaultSort: SortingState = [{ id: "project_id_pm", desc: false }];
    if (typeof window === "undefined") return defaultSort;
    try {
      const saved = localStorage.getItem(STORAGE_KEY_SORTING);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.filter(
            (item) =>
              item &&
              typeof item.id === "string" &&
              typeof item.desc === "boolean"
          );
        }
      }
    } catch (e) {
      console.error("Failed to parse sorting state from localStorage", e);
    }
    return defaultSort;
  });
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
    meta: {
      onEdit,
      onDelete,
    },
    globalFilterFn: customGlobalFilterFn,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: (updater) => {
      setSorting((prev) => {
        const next = typeof updater === "function" ? updater(prev) : updater;
        const sanitized = Array.isArray(next)
          ? next.filter(
              (s) => s && typeof s.id === "string" && typeof s.desc === "boolean"
            )
          : [];
        try {
          if (sanitized.length > 0) {
            localStorage.setItem(STORAGE_KEY_SORTING, JSON.stringify(sanitized));
          } else {
            localStorage.removeItem(STORAGE_KEY_SORTING);
          }
        } catch (e) {
          console.error("Failed to save sorting state to localStorage", e);
        }
        return sanitized;
      });
    },
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
  const [activeOverflow, setActiveOverflow] = React.useState<CellOverflowData | null>(null);

  const prevScrollTopRef = React.useRef(0);

  const handleCellDoubleClick = React.useCallback(
    (e: React.MouseEvent<HTMLTableCellElement>, columnId: string, value: any) => {
      if (!(OVERFLOW_ENABLED_COLUMN_IDS as readonly string[]).includes(columnId)) return;
      const textVal = value != null ? String(value).trim() : "";
      if (!textVal || textVal === "-") return;

      // Clear any accidental word-selection created by browser native double-click
      e.preventDefault();
      if (typeof window !== "undefined") {
        window.getSelection()?.removeAllRanges();
        setTimeout(() => {
          window.getSelection()?.removeAllRanges();
        }, 20);
      }

      const rect = e.currentTarget.getBoundingClientRect();
      prevScrollTopRef.current = parentRef.current ? parentRef.current.scrollTop : 0;

      setActiveOverflow({
        text: textVal,
        anchorRect: rect,
      });
    },
    []
  );

  const handleCloseOverflow = React.useCallback(() => {
    setActiveOverflow(null);
  }, []);

  React.useEffect(() => {
    const el = parentRef.current;
    if (!el) return;

    let rAFId: number | null = null;
    const handleScroll = () => {
      const currentScrollTop = el.scrollTop;

      // Vertical scroll strictly dismisses the overflow popover
      if (Math.abs(currentScrollTop - prevScrollTopRef.current) > 1) {
        setActiveOverflow(null);
      }
      // Horizontal scroll: popover stays open in its fixed place without closing

      prevScrollTopRef.current = currentScrollTop;

      if (rAFId === null) {
        rAFId = window.requestAnimationFrame(() => {
          const scrolled = el.scrollLeft > 0;
          setIsScrolledX((prev) => (prev !== scrolled ? scrolled : prev));
          rAFId = null;
        });
      }
    };

    // Run immediate check when container mounts or attaches
    const initialScrolled = el.scrollLeft > 0;
    setIsScrolledX(initialScrolled);

    el.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      el.removeEventListener("scroll", handleScroll);
      if (rAFId !== null) {
        window.cancelAnimationFrame(rAFId);
      }
    };
  }, [isFormActive]);

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
    overscan: 3,
  });

  // Smoothly auto-scroll to highlighted newly-added or edited row
  React.useEffect(() => {
    if (!isFormActive && highlightedRowId && rows.length > 0) {
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
  }, [isFormActive, highlightedRowId, rows, rowVirtualizer]);

  const virtualRows = rowVirtualizer.getVirtualItems();
  const totalSize = rowVirtualizer.getTotalSize();

  const columnsSignature = React.useMemo(() => {
    return table
      .getVisibleLeafColumns()
      .map((c) => `${c.id}:${c.getSize()}`)
      .join(",");
  }, [
    table.getState().columnOrder,
    table.getState().columnVisibility,
    table.getState().columnSizing,
  ]);

  const paddingTop = virtualRows.length > 0 ? virtualRows[0].start : 0;
  const paddingBottom = virtualRows.length > 0
    ? totalSize - virtualRows[virtualRows.length - 1].end
    : 0;

  return (
    <div className="space-y-4 flex flex-col flex-1 min-h-0">
      {/* Responsive Table Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2.5 md:gap-4 w-full">
        {/* Mobile Row 1: Action Slot (Add Project / Back) / Left Item on Desktop */}
        <div className="w-full md:w-auto md:flex md:items-center md:gap-3">
          <div className="w-full md:w-auto [&>button]:w-full md:[&>button]:w-auto [&>button]:justify-center">
            {actionSlot}
          </div>
        </div>

        {/* Mobile Row 2: 4 Utility Buttons (Filter, Columns, Export, Trash) */}
        <div className="grid grid-cols-4 gap-1.5 w-full md:hidden">
          <div className="w-full">
            <DataTableFilter table={table} className="w-full px-1 sm:px-2" disabled={isFormActive} />
          </div>
          <div className="w-full">
            <DataTableViewOptions table={table} className="w-full px-1 sm:px-2" disabled={isFormActive} />
          </div>
          <div className="w-full">
            <DataTableExport
              className="w-full px-1 sm:px-2"
              disabled={isFormActive}
              onExportExcel={onExportExcel}
              onExportPdf={onExportPdf}
            />
          </div>
          <div className="w-full">
            <Button
              data-testid="trash-button-mobile"
              variant="outline"
              size="lg"
              disabled={isFormActive}
              onClick={onTrashClick}
              className={cn(
                "group/trash h-10 w-full rounded-md flex items-center justify-center cursor-pointer px-1 sm:px-2 gap-1 shadow-sm transition-all text-xs border border-transparent bg-white hover:bg-slate-50 hover:border-telkom-navy hover:text-telkom-navy active:bg-slate-100",
                isFormActive &&
                  "!opacity-80 disabled:!opacity-80 pointer-events-none cursor-not-allowed !bg-slate-100/70 !border-slate-300 !text-slate-700 shadow-2xs"
              )}
            >
              <span
                className={cn(
                  "material-symbols-outlined text-[18px] transition-colors leading-none select-none",
                  isFormActive
                    ? "!text-slate-500"
                    : "text-slate-500 group-hover/trash:text-telkom-navy"
                )}
              >
                restore_from_trash
              </span>
              <span
                className={cn(
                  "font-medium truncate transition-colors",
                  isFormActive
                    ? "!text-slate-700"
                    : "text-slate-600 group-hover/trash:text-telkom-navy"
                )}
              >
                Trash
              </span>
            </Button>
          </div>
        </div>

        {/* Search Bar (Mobile Row 3 / Desktop Right Item) & Desktop Controls */}
        <div className="flex flex-col md:flex-row items-center gap-2.5 md:gap-3 w-full md:w-auto">
          <DataTableSearchInput
            table={table}
            className="w-full md:w-[280px] lg:w-[340px] xl:w-[400px]"
            disabled={isFormActive}
          />
          <div className="hidden md:flex items-center gap-2 lg:gap-2.5">
            <DataTableFilter table={table} disabled={isFormActive} />
            <DataTableViewOptions table={table} disabled={isFormActive} />
            <DataTableExport
              disabled={isFormActive}
              onExportExcel={onExportExcel}
              onExportPdf={onExportPdf}
            />
            <Button
              data-testid="trash-button"
              variant="outline"
              size="lg"
              disabled={isFormActive}
              onClick={onTrashClick}
              className={cn(
                "group/trash h-10 rounded-md flex items-center justify-center cursor-pointer px-2 sm:px-4 gap-1.5 sm:gap-2 shadow-sm transition-all text-xs sm:text-sm border border-transparent bg-white hover:bg-slate-50 hover:border-telkom-navy hover:text-telkom-navy active:bg-slate-100",
                isFormActive &&
                  "!opacity-80 disabled:!opacity-80 pointer-events-none cursor-not-allowed !bg-slate-100/70 !border-slate-300 !text-slate-700 shadow-2xs"
              )}
            >
              <span
                className={cn(
                  "material-symbols-outlined text-[18px] sm:text-[20px] transition-colors leading-none select-none",
                  isFormActive
                    ? "!text-slate-500"
                    : "text-slate-500 group-hover/trash:text-telkom-navy"
                )}
              >
                restore_from_trash
              </span>
              <span
                className={cn(
                  "font-medium truncate transition-colors",
                  isFormActive
                    ? "!text-slate-700"
                    : "text-slate-600 group-hover/trash:text-telkom-navy"
                )}
              >
                Trash
              </span>
            </Button>
          </div>
        </div>
      </div>

      {/* Active Filter Chips / Pills */}
      {!isFormActive && columnFilters.length > 0 && (
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
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-700 shadow-2xs transition-colors"
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
              data-testid="clear-all-filters"
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
        className="rounded-lg bg-white shadow-sm flex-1 min-h-0 w-full relative overflow-hidden flex flex-col isolate"
      >
        {isFormActive && createFormSlot ? (
          createFormSlot
        ) : (
          <div
            ref={parentRef}
            data-testid="table-scroll-container"
            className="w-full h-full overflow-auto hide-scrollbar"
            style={{ willChange: "scroll-position" }}
          >
            <table className="w-full caption-bottom text-sm border-separate border-spacing-0" style={{ width: table.getTotalSize(), tableLayout: 'fixed' }}>
          <TableHeader className="bg-slate-100 sticky top-0 z-30">
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
                          "text-telkom-navy font-semibold h-11 group/resizer text-ellipsis bg-slate-100 border-b border-slate-200",
                          isLastPinned ? "overflow-visible" : "overflow-hidden",
                          isPinned ? "sticky z-50" : "sticky top-0 z-30",
                          isLastPinned &&
                            "after:content-[''] after:absolute after:top-0 after:bottom-0 after:right-0 after:w-2 after:translate-x-full after:pointer-events-none after:transition-opacity after:duration-150 after:bg-gradient-to-r after:from-slate-900/[0.04] after:to-transparent",
                          isLastPinned && (isScrolledX ? "after:opacity-100" : "after:opacity-0")
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
                            isLastPinned ? "overflow-visible" : "overflow-hidden",
                            isPinned ? "sticky z-10 bg-white" : "bg-white",
                            isLastPinned &&
                              "after:content-[''] after:absolute after:top-0 after:bottom-0 after:right-0 after:w-2 after:translate-x-full after:pointer-events-none after:transition-opacity after:duration-150 after:bg-gradient-to-r after:from-slate-900/[0.04] after:to-transparent",
                            isLastPinned && (isScrolledX ? "after:opacity-100" : "after:opacity-0")
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
                  <TableRow className="hover:bg-transparent border-0">
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
                    <VirtualTableRow
                      key={row.id}
                      row={row}
                      virtualRowIndex={virtualRow.index}
                      isRowHighlighted={isRowHighlighted}
                      lastPinnedId={lastPinnedId}
                      isScrolledX={isScrolledX}
                      columnsSignature={columnsSignature}
                      onCellDoubleClick={handleCellDoubleClick}
                    />
                  );
                })}
                {paddingBottom > 0 && (
                  <TableRow className="hover:bg-transparent border-0">
                    <TableCell colSpan={table.getVisibleLeafColumns().length} style={{ height: `${paddingBottom}px`, padding: 0, border: 0 }} />
                  </TableRow>
                )}
              </>
            ) : (
              <TableRow>
                <TableCell
                  data-testid="table-empty-state"
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
      <CellOverflowPopover data={activeOverflow} onClose={handleCloseOverflow} />
    </div>
  );
}