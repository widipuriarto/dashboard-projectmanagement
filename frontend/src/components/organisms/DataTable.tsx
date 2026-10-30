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
import { DataTableActiveFilters } from "@/components/molecules/DataTableActiveFilters";
import { VirtualTableRow } from "@/components/organisms/VirtualTableRow";
import { normalizeOrdersData, flattenOrderSidPairs } from "@/lib/orderParser";
import {
  CellOverflowPopover,
  type CellOverflowData,
} from "@/components/molecules/CellOverflowPopover";
import { cn } from "@/lib/utils";
import {
  LOCKED_COLUMNS,
  MANDATORY_COLUMN_IDS,
  OVERFLOW_ENABLED_COLUMN_IDS,
  FILTER_CATEGORIES,
  STORAGE_KEY_VISIBILITY,
  STORAGE_KEY_ORDER,
  STORAGE_KEY_FILTERS,
  STORAGE_KEY_SORTING,
  customGlobalFilterFn,
  getColumnDisplayTitle,
} from "@/lib/table-constants";
import type { ProjectPM } from "@/types/project";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  actionSlot?: React.ReactNode;
  isLoading?: boolean;
  isCreateMode?: boolean;
  isFormMode?: boolean;
  isTrashMode?: boolean;
  createFormSlot?: React.ReactNode;
  highlightedRowId?: string | null;
  highlightVariant?: "sky" | "grey";
  onEdit?: (row: TData) => void;
  onDelete?: (row: TData) => void;
  onRestore?: (row: TData) => void;
  onPermanentDelete?: (row: TData) => void;
  onTrashClick?: () => void;
  onExportExcel?: (
    rows: TData[],
    visibleColumns: Array<{ key: string; header: string }>
  ) => void;
  onExportCsv?: (
    rows: TData[],
    visibleColumns: Array<{ key: string; header: string }>
  ) => void;
}

const EMPTY_SORTING: SortingState = [];

export function DataTable<TData, TValue>({
  columns,
  data,
  actionSlot,
  isLoading = false,
  isCreateMode = false,
  isFormMode,
  isTrashMode = false,
  createFormSlot,
  highlightedRowId = null,
  highlightVariant = "sky",
  onEdit,
  onDelete,
  onRestore,
  onPermanentDelete,
  onTrashClick,
  onExportExcel,
  onExportCsv,
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
  const [globalFilter, setGlobalFilter] = React.useState<unknown>(undefined);
  const [expandedRows, setExpandedRows] = React.useState<Record<string, boolean>>({});

  const toggleRowExpand = React.useCallback((rowId: string) => {
    setExpandedRows((prev) => ({ ...prev, [rowId]: !prev[rowId] }));
  }, []);
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
    const allIds = columns.map((col) => {
      const c = col as { id?: string; accessorKey?: string };
      return (c.id || c.accessorKey || "") as string;
    }).filter(Boolean);
    if (typeof window === "undefined") return allIds;
    try {
      const saved = localStorage.getItem(STORAGE_KEY_ORDER);
      if (saved) {
        const parsed = JSON.parse(saved) as string[];
        if (Array.isArray(parsed) && parsed.length > 0) {
          const mandatory = Array.from(MANDATORY_COLUMN_IDS) as string[];
          const validSaved = parsed.filter(
            (id) => !mandatory.includes(id) && allIds.includes(id)
          );
          const missing = allIds.filter(
            (id) => !mandatory.includes(id) && !validSaved.includes(id)
          );
          return [...mandatory, ...validSaved, ...missing];
        }
      }
    } catch (e) {
      console.error("Failed to parse column order from localStorage", e);
    }
    return allIds;
  });

  const meta = React.useMemo(
    () => ({
      isTrashView: isTrashMode,
      onEdit: onEdit as ((row: unknown) => void) | undefined,
      onDelete: onDelete as ((row: unknown) => void) | undefined,
      onRestore: onRestore as ((row: unknown) => void) | undefined,
      onPermanentDelete: onPermanentDelete as ((row: unknown) => void) | undefined,
      expandedRows,
      toggleRowExpand,
    }),
    [
      isTrashMode,
      onEdit,
      onDelete,
      onRestore,
      onPermanentDelete,
      expandedRows,
      toggleRowExpand,
    ]
  );

  const table = useReactTable({
    data,
    columns,
    getRowId: (row: TData, index: number) => {
      const r = row as { project_id_pm?: string | number };
      return r?.project_id_pm ? String(r.project_id_pm) : String(index);
    },
    meta,
    globalFilterFn: customGlobalFilterFn,
    getColumnCanGlobalFilter: (column) => column.id !== "actions" && column.id !== "nomor",
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
        const mandatory = Array.from(MANDATORY_COLUMN_IDS) as string[];
        const nonMandatory = next.filter((id) => !mandatory.includes(id));
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
      sorting: isTrashMode ? EMPTY_SORTING : sorting,
      globalFilter,
      columnVisibility,
      columnOrder,
      columnFilters,
    },
  });

  const { rows } = table.getRowModel();
  const parentRef = React.useRef<HTMLDivElement>(null);
  const lastScrollPosRef = React.useRef<{ top: number; left: number }>({ top: 0, left: 0 });
  const [isScrolledX, setIsScrolledX] = React.useState(false);
  const [activeOverflow, setActiveOverflow] = React.useState<CellOverflowData | null>(null);

  const prevScrollTopRef = React.useRef(0);

  const handleCellDoubleClick = React.useCallback(
    (e: React.MouseEvent<HTMLTableCellElement>, columnId: string, value: unknown) => {
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
      lastScrollPosRef.current = { top: el.scrollTop, left: el.scrollLeft };

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [table, columnVisibility, columnOrder]);

  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: (index) => {
      const row = rows[index];
      if (row && expandedRows[row.id]) {
        const pairs = flattenOrderSidPairs(normalizeOrdersData(row.original as unknown as ProjectPM));
        return Math.max(44, pairs.length * 44);
      }
      return 44;
    },
    overscan: 5,
  });

  // Re-measure virtual rows whenever expandedRows state changes
  React.useEffect(() => {
    rowVirtualizer.measure();
  }, [expandedRows, rowVirtualizer]);

  // Scroll position preservation & auto-scroll to highlighted row
  React.useEffect(() => {
    if (isFormActive) return;

    const el = parentRef.current;
    if (!el) return;

    const { top, left } = lastScrollPosRef.current;

    if (highlightedRowId && rows.length > 0) {
      const targetIndex = rows.findIndex(
        (r) => (r.original as unknown as ProjectPM)?.project_id_pm === highlightedRowId
      );

      if (targetIndex >= 0) {
        if (highlightVariant === "grey") {
          // Returning from Cancel in Edit mode: restore exact previous scroll coordinates
          const timeoutId = setTimeout(() => {
            if (parentRef.current) {
              parentRef.current.scrollTop = top;
              parentRef.current.scrollLeft = left;
            }
          }, 50);
          return () => clearTimeout(timeoutId);
        } else {
          // Successfully saved/added new project: instant jump into view (zero latency)
          const timeoutId = setTimeout(() => {
            rowVirtualizer.scrollToIndex(targetIndex, {
              align: "center",
              behavior: "auto",
            });
            if (parentRef.current && left > 0) {
              parentRef.current.scrollLeft = left;
            }
          }, 30);
          return () => clearTimeout(timeoutId);
        }
      }
    } else {
      // Returning without highlight (e.g. Cancel/Back on Add Project): restore exact scroll coordinates
      if (top > 0 || left > 0) {
        const timeoutId = setTimeout(() => {
          if (parentRef.current) {
            parentRef.current.scrollTop = top;
            parentRef.current.scrollLeft = left;
          }
        }, 50);
        return () => clearTimeout(timeoutId);
      }
    }
  }, [isFormActive, highlightedRowId, highlightVariant, rows, rowVirtualizer]);

  const virtualRows = rowVirtualizer.getVirtualItems();
  const totalSize = rowVirtualizer.getTotalSize();

  // Auto-collapse expanded rows when user scrolls far away and the row leaves the virtualized view
  React.useEffect(() => {
    const activeExpandedKeys = Object.keys(expandedRows).filter(
      (key) => expandedRows[key]
    );
    if (activeExpandedKeys.length === 0) return;

    const renderedRowIds = new Set(
      virtualRows.map((vr) => rows[vr.index]?.id).filter(Boolean)
    );

    const hasScrolledOut = activeExpandedKeys.some(
      (id) => !renderedRowIds.has(id)
    );

    if (hasScrolledOut) {
      setExpandedRows((prev) => {
        let changed = false;
        const next = { ...prev };
        for (const id of activeExpandedKeys) {
          if (!renderedRowIds.has(id)) {
            delete next[id];
            changed = true;
          }
        }
        return changed ? next : prev;
      });
    }
  }, [virtualRows, rows, expandedRows]);

  const columnOrderState = table.getState().columnOrder;
  const columnVisibilityState = table.getState().columnVisibility;
  const columnSizingState = table.getState().columnSizing;

  const columnsSignature = React.useMemo(() => {
    return table
      .getVisibleLeafColumns()
      .map((c) => `${c.id}:${c.getSize()}`)
      .join(",");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [table, columnOrderState, columnVisibilityState, columnSizingState]);

  const paddingTop = virtualRows.length > 0 ? virtualRows[0].start : 0;
  const paddingBottom = virtualRows.length > 0
    ? totalSize - virtualRows[virtualRows.length - 1].end
    : 0;

  const handleExportExcelClick = React.useCallback(() => {
    const displayedRows = table.getRowModel().rows.map((r) => r.original);
    const visibleColumns = table
      .getVisibleLeafColumns()
      .filter((col) => col.id !== "actions")
      .map((col) => ({
        key: col.id,
        header: getColumnDisplayTitle(col.id, isTrashMode),
      }));

    onExportExcel?.(displayedRows, visibleColumns);
  }, [table, isTrashMode, onExportExcel]);

  const handleExportCsvClick = React.useCallback(() => {
    const displayedRows = table.getRowModel().rows.map((r) => r.original);
    const visibleColumns = table
      .getVisibleLeafColumns()
      .filter((col) => col.id !== "actions")
      .map((col) => ({
        key: col.id,
        header: getColumnDisplayTitle(col.id, isTrashMode),
      }));

    onExportCsv?.(displayedRows, visibleColumns);
  }, [table, isTrashMode, onExportCsv]);

  return (
    <div className="space-y-4 flex flex-col flex-1 min-h-0">
      {/* Responsive Table Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2.5 md:gap-4 w-full">
        {/* Mobile Row 1: Action Slot (Add Project / Back) / Left Item on Desktop */}
        <div className="w-full md:w-auto md:flex md:items-center md:gap-3">
          <div className="w-full md:w-auto [&>button]:w-full md:[&>button]:w-[136px] [&>button]:justify-center">
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
              disabled={isFormActive || isTrashMode}
              onExportExcel={handleExportExcelClick}
              onExportCsv={handleExportCsvClick}
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
                "group/trash h-10 w-full rounded-md flex items-center justify-center cursor-pointer px-1 sm:px-2 gap-1 transition-all text-xs border border-slate-300/80 bg-white hover:bg-slate-50 hover:border-telkom-red hover:text-telkom-red active:bg-slate-100",
                isTrashMode && "!bg-red-50 !border-telkom-red !text-telkom-red shadow-2xs font-semibold",
                isFormActive &&
                  "!opacity-80 disabled:!opacity-80 pointer-events-none cursor-not-allowed !bg-slate-100/70 !border-slate-300 !text-slate-700 shadow-2xs"
              )}
            >
              <span
                className={cn(
                  "material-symbols-outlined text-[18px] transition-colors leading-none select-none",
                  isFormActive
                    ? "!text-slate-500"
                    : isTrashMode
                    ? "!text-telkom-red"
                    : "text-slate-500 group-hover/trash:text-telkom-red"
                )}
              >
                restore_from_trash
              </span>
              <span
                className={cn(
                  "font-medium truncate transition-colors",
                  isFormActive
                    ? "!text-slate-700"
                    : isTrashMode
                    ? "!text-telkom-red font-semibold"
                    : "text-slate-600 group-hover/trash:text-telkom-red"
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
              disabled={isFormActive || isTrashMode}
              onExportExcel={handleExportExcelClick}
              onExportCsv={handleExportCsvClick}
            />
            <Button
              data-testid="trash-button"
              variant="outline"
              size="lg"
              disabled={isFormActive}
              onClick={onTrashClick}
              className={cn(
                "group/trash h-10 min-h-10 max-h-10 shrink-0 w-full md:w-[120px] rounded-md flex items-center justify-center cursor-pointer px-2 sm:px-2.5 gap-1 sm:gap-1.5 transition-all text-xs sm:text-sm border border-slate-300/80 bg-white hover:bg-slate-50 hover:border-telkom-red hover:text-telkom-red active:bg-slate-100",
                isTrashMode && "!bg-red-50 !border-telkom-red !text-telkom-red shadow-2xs font-semibold",
                isFormActive &&
                  "!opacity-80 disabled:!opacity-80 pointer-events-none cursor-not-allowed !bg-slate-100/70 !border-slate-300 !text-slate-700 shadow-2xs"
              )}
            >
              <span
                className={cn(
                  "material-symbols-outlined text-[18px] sm:text-[20px] transition-colors leading-none select-none",
                  isFormActive
                    ? "!text-slate-500"
                    : isTrashMode
                    ? "!text-telkom-red"
                    : "text-slate-500 group-hover/trash:text-telkom-red"
                )}
              >
                restore_from_trash
              </span>
              <span
                className={cn(
                  "font-medium whitespace-nowrap transition-colors",
                  isFormActive
                    ? "!text-slate-700"
                    : isTrashMode
                    ? "!text-telkom-red font-semibold"
                    : "text-slate-600 group-hover/trash:text-telkom-red"
                )}
              >
                Trash
              </span>
            </Button>
          </div>
        </div>
      </div>

      {/* Active Filter Chips / Pills */}
      {!isFormActive && (
        <DataTableActiveFilters table={table} columnFilters={columnFilters} />
      )}

      {/* Main Table or Form Content Frame */}
      <div 
        className="rounded-lg bg-white border border-slate-300/80 shadow-sm flex-1 min-h-0 w-full relative overflow-hidden flex flex-col isolate"
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
          <TableHeader className="bg-[#DFE6F0] sticky top-0 z-30">
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
                          "text-telkom-navy font-semibold h-11 group/resizer text-ellipsis bg-[#DFE6F0] border-b border-slate-300/80",
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
                    (row.original as unknown as ProjectPM)?.project_id_pm === highlightedRowId;

                  return (
                    <VirtualTableRow
                      key={row.id}
                      row={row}
                      virtualRowIndex={virtualRow.index}
                      isRowHighlighted={isRowHighlighted}
                      highlightVariant={highlightVariant}
                      isExpanded={Boolean(expandedRows[row.id])}
                      lastPinnedId={lastPinnedId}
                      isScrolledX={isScrolledX}
                      columnsSignature={columnsSignature}
                      measureElement={rowVirtualizer.measureElement}
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