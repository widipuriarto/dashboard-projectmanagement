import * as React from "react";
import type { Table } from "@tanstack/react-table";
import { Search } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  MANDATORY_COLUMN_IDS,
  getColumnDisplayTitle,
  STORAGE_KEY_VISIBILITY,
  STORAGE_KEY_ORDER,
} from "@/components/organisms/columns";

interface DataTableViewOptionsProps<TData> {
  table: Table<TData>;
  className?: string;
  disabled?: boolean;
}

import { Checkbox } from "@/components/atoms/Checkbox";

export function DataTableViewOptions<TData>({
  table,
  className,
  disabled = false,
}: DataTableViewOptionsProps<TData>) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [draggedColId, setDraggedColId] = React.useState<string | null>(null);
  const [dragOverColId, setDragOverColId] = React.useState<string | null>(null);
  const [dropPosition, setDropPosition] = React.useState<"top" | "bottom" | null>(null);
  const isDraggingRef = React.useRef(false);
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);

  // Retrieve current column order and visibility from table state
  const columnOrder = table.getState().columnOrder;
  const columnVisibility = table.getState().columnVisibility;
  const allColumns = table.getAllColumns();

  const columnMap = React.useMemo(() => {
    return new Map(allColumns.map((c) => [c.id, c]));
  }, [allColumns]);

  const orderedColumns = React.useMemo(() => {
    if (columnOrder && columnOrder.length > 0) {
      const ordered = columnOrder
        .map((id) => columnMap.get(id))
        .filter(Boolean) as typeof allColumns;
      // Include any columns that might not yet be in columnOrder
      const missing = allColumns.filter((c) => !columnOrder.includes(c.id));
      return [...ordered, ...missing];
    }
    return allColumns;
  }, [columnOrder, columnMap, allColumns]);

  // Separate mandatory and non-mandatory columns
  const mandatoryCols = React.useMemo(() => {
    return orderedColumns.filter((col) =>
      MANDATORY_COLUMN_IDS.includes(col.id as any)
    );
  }, [orderedColumns]);

  const reorderableCols = React.useMemo(() => {
    return orderedColumns.filter(
      (col) => !MANDATORY_COLUMN_IDS.includes(col.id as any)
    );
  }, [orderedColumns]);

  // Reactive column visibility checker
  const isColVisible = React.useCallback(
    (colId: string) => {
      return columnVisibility[colId] !== false;
    },
    [columnVisibility]
  );

  // Filter reorderable columns by search query
  const filteredReorderableCols = React.useMemo(() => {
    if (!searchQuery.trim()) return reorderableCols;
    const query = searchQuery.toLowerCase().trim();
    return reorderableCols.filter((col) => {
      const title = getColumnDisplayTitle(col.id).toLowerCase();
      return title.includes(query) || col.id.toLowerCase().includes(query);
    });
  }, [reorderableCols, searchQuery]);

  // Count visible non-mandatory columns reactively
  const visibleReorderableCount = React.useMemo(() => {
    return reorderableCols.filter((col) => isColVisible(col.id)).length;
  }, [reorderableCols, isColVisible]);

  // Total visible columns in table including mandatory columns
  const totalVisibleCount = React.useMemo(() => {
    return mandatoryCols.length + visibleReorderableCount;
  }, [mandatoryCols.length, visibleReorderableCount]);

  // Toggle visibility with auto-reordering:
  // Checked: moves to the bottom of checked columns (under previously checked)
  // Unchecked: moves to the row immediately below the checked columns (NOT all the way to the bottom)
  const handleToggleColumn = (column: (typeof allColumns)[0]) => {
    // 1. Blur currently focused element to prevent browser auto-scrolling to repositioned node
    if (typeof document !== "undefined" && document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }

    const container = scrollContainerRef.current;
    const prevScrollTop = container ? container.scrollTop : 0;

    // 2. Identify the anchor element to keep the view firmly in place
    const currentReorderableIds = reorderableCols.map((c) => c.id);
    const colIndex = currentReorderableIds.indexOf(column.id);
    const anchorId = currentReorderableIds[colIndex + 1] || currentReorderableIds[colIndex - 1];

    let prevAnchorTop = 0;
    if (container && anchorId) {
      const anchorEl = container.querySelector(
        `[data-testid="column-item-${anchorId}"]`
      ) as HTMLElement | null;
      if (anchorEl) {
        prevAnchorTop = anchorEl.getBoundingClientRect().top;
      }
    }

    const isCurrentlyChecked = isColVisible(column.id);
    const willBeChecked = !isCurrentlyChecked;

    // Toggle column visibility in TanStack table
    column.toggleVisibility(willBeChecked);

    // Separate other checked and unchecked columns excluding the current column
    const checkedIds = currentReorderableIds.filter(
      (id) => id !== column.id && isColVisible(id)
    );
    const uncheckedIds = currentReorderableIds.filter(
      (id) => id !== column.id && !isColVisible(id)
    );

    // In both checking and unchecking, place column.id immediately after checkedIds:
    // - If checked: becomes the last checked column (above unchecked columns)
    // - If unchecked: becomes the first unchecked column (immediately below the checked columns)
    const newReorderableOrder = [...checkedIds, column.id, ...uncheckedIds];
    const fullOrder = [
      ...Array.from(MANDATORY_COLUMN_IDS),
      ...newReorderableOrder,
    ];

    table.setColumnOrder(fullOrder);
    try {
      localStorage.setItem(STORAGE_KEY_ORDER, JSON.stringify(fullOrder));
    } catch (e) {
      console.error(e);
    }

    // 3. Keep scroll position firmly anchored so the user's viewport never jumps away
    requestAnimationFrame(() => {
      if (!container) return;
      if (anchorId) {
        const anchorEl = container.querySelector(
          `[data-testid="column-item-${anchorId}"]`
        ) as HTMLElement | null;
        if (anchorEl && prevAnchorTop) {
          const newAnchorTop = anchorEl.getBoundingClientRect().top;
          const delta = newAnchorTop - prevAnchorTop;
          container.scrollTop = prevScrollTop + delta;
          return;
        }
      }
      container.scrollTop = prevScrollTop;
    });
  };

  const handleRowClick = (column: (typeof allColumns)[0]) => {
    if (isDraggingRef.current) return;
    handleToggleColumn(column);
  };

  const handleShowAll = () => {
    const visibilityUpdate: Record<string, boolean> = {};
    allColumns.forEach((col) => {
      visibilityUpdate[col.id] = true;
    });
    table.setColumnVisibility(visibilityUpdate);
  };

  const handleHideAll = () => {
    const visibilityUpdate: Record<string, boolean> = {};
    allColumns.forEach((col) => {
      visibilityUpdate[col.id] = MANDATORY_COLUMN_IDS.includes(col.id as any);
    });
    table.setColumnVisibility(visibilityUpdate);
  };

  const handleResetDefault = () => {
    // Reset visibility to all visible
    table.resetColumnVisibility();
    try {
      localStorage.removeItem(STORAGE_KEY_VISIBILITY);
    } catch (e) {
      console.error(e);
    }

    // Reset column order to default definitions order
    const defaultOrder = allColumns.map((c) => c.id);
    table.setColumnOrder(defaultOrder);
    try {
      localStorage.removeItem(STORAGE_KEY_ORDER);
    } catch (e) {
      console.error(e);
    }

    setSearchQuery("");
  };

  // Drag and drop handlers with sleek drag ghost and clean navy drop line
  const handleDragStart = (e: React.DragEvent, colId: string) => {
    isDraggingRef.current = true;
    setDraggedColId(colId);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", colId);

    // Create a sleek, compact floating drag preview pill instead of bulky browser ghost
    const dragGhost = document.createElement("div");
    dragGhost.innerText = getColumnDisplayTitle(colId);
    dragGhost.style.position = "absolute";
    dragGhost.style.top = "-9999px";
    dragGhost.style.left = "-9999px";
    dragGhost.style.padding = "5px 12px";
    dragGhost.style.background = "#ffffff";
    dragGhost.style.color = "#002B66";
    dragGhost.style.fontSize = "12px";
    dragGhost.style.fontWeight = "600";
    dragGhost.style.borderRadius = "6px";
    dragGhost.style.border = "1.5px solid #002B66";
    dragGhost.style.boxShadow = "0 6px 16px rgba(0, 43, 102, 0.16)";
    dragGhost.style.pointerEvents = "none";
    dragGhost.style.zIndex = "99999";
    document.body.appendChild(dragGhost);

    e.dataTransfer.setDragImage(dragGhost, 20, 15);

    setTimeout(() => {
      if (document.body.contains(dragGhost)) {
        document.body.removeChild(dragGhost);
      }
    }, 0);
  };

  const handleDragOver = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";

    if (targetId === draggedColId) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const offset = e.clientY - rect.top;
    const isTop = offset < rect.height / 2;
    const nextPos = isTop ? "top" : "bottom";

    if (dragOverColId !== targetId || dropPosition !== nextPos) {
      setDragOverColId(targetId);
      setDropPosition(nextPos);
    }
  };

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (!draggedColId || draggedColId === targetId) {
      handleDragEnd();
      return;
    }

    const currentIds = reorderableCols.map((c) => c.id);
    if (!currentIds.includes(draggedColId) || !currentIds.includes(targetId)) {
      handleDragEnd();
      return;
    }

    // Robust reorder logic: remove dragged item first, find target index, then insert
    const withoutDragged = currentIds.filter((id) => id !== draggedColId);
    const targetIndex = withoutDragged.indexOf(targetId);

    if (targetIndex === -1) {
      handleDragEnd();
      return;
    }

    const insertIndex = dropPosition === "bottom" ? targetIndex + 1 : targetIndex;
    withoutDragged.splice(insertIndex, 0, draggedColId);

    const fullOrder = [
      ...Array.from(MANDATORY_COLUMN_IDS),
      ...withoutDragged,
    ];

    table.setColumnOrder(fullOrder);

    try {
      localStorage.setItem(STORAGE_KEY_ORDER, JSON.stringify(fullOrder));
    } catch (err) {
      console.error(err);
    }

    handleDragEnd();
  };

  const handleDragEnd = () => {
    setDraggedColId(null);
    setDragOverColId(null);
    setDropPosition(null);
    setTimeout(() => {
      isDraggingRef.current = false;
    }, 100);
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger
        data-testid="columns-button"
        disabled={disabled}
        className={cn(
          buttonVariants({ variant: "outline", size: "lg" }),
          "group/options h-10 rounded-md flex items-center justify-center cursor-pointer px-2 sm:px-4 gap-1.5 sm:gap-2 shadow-sm transition-all text-xs sm:text-sm",
          disabled
            ? "!opacity-80 disabled:!opacity-80 pointer-events-none cursor-not-allowed !bg-slate-100/70 !border-slate-300 !text-slate-700 shadow-2xs"
            : isOpen
            ? "border-telkom-navy bg-slate-50 text-telkom-navy shadow-inner"
            : "border-transparent bg-white hover:bg-slate-50 hover:border-telkom-navy hover:text-telkom-navy active:bg-slate-100",
          className
        )}
      >
        <span
          className={cn(
            "material-symbols-outlined text-[18px] sm:text-[20px] transition-colors leading-none select-none",
            disabled
              ? "!text-slate-500"
              : isOpen
              ? "text-telkom-navy"
              : "text-slate-500 group-hover/options:text-telkom-navy"
          )}
        >
          table_eye
        </span>
        <span
          className={cn(
            "font-medium truncate transition-colors",
            disabled
              ? "!text-slate-700"
              : isOpen
              ? "text-telkom-navy"
              : "text-slate-600 group-hover/options:text-telkom-navy"
          )}
        >
          Columns
        </span>
      </PopoverTrigger>

      <PopoverContent align="end" className="w-[calc(100vw-32px)] sm:w-80 max-w-80 p-3 shadow-xl border-none rounded-2xl">
        {/* Search Input with refined hairline border */}
        <div className="relative mb-2.5">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none select-none" />
          <input
            type="text"
            placeholder="Search columns..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-8 pl-8 pr-7 text-xs bg-slate-50/60 border border-slate-200/60 rounded-lg text-slate-700 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-telkom-navy/60 focus:ring-1 focus:ring-telkom-navy/20 transition-all"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs cursor-pointer p-0.5 leading-none"
            >
              ✕
            </button>
          )}
        </div>

        {/* Counter and Bulk Action Bar */}
        <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100 text-xs">
          <span className="text-slate-500 font-medium">
            {totalVisibleCount} of {allColumns.length} visible
          </span>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              data-testid="columns-show-all"
              onClick={handleShowAll}
              className="text-blue-600 hover:text-blue-800 font-medium cursor-pointer transition-colors px-1"
            >
              Show all
            </button>
            <span className="text-slate-300">|</span>
            <button
              type="button"
              data-testid="columns-hide-all"
              onClick={handleHideAll}
              className="text-slate-500 hover:text-slate-800 font-medium cursor-pointer transition-colors px-1"
            >
              Hide all
            </button>
            <span className="text-slate-300">|</span>
            <button
              type="button"
              data-testid="columns-reset"
              onClick={handleResetDefault}
              className="text-slate-500 hover:text-telkom-navy font-medium cursor-pointer transition-colors px-1"
              title="Reset columns and order to default"
            >
              Reset
            </button>
          </div>
        </div>

        {/* Scrollable Column List with Hidden Scrollbar */}
        <div
          ref={scrollContainerRef}
          className="max-h-[320px] overflow-y-auto space-y-0.5 divide-y-0 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
        >
          {/* Mandatory / Locked Columns Section (Clean background without gray shade) */}
          {!searchQuery && mandatoryCols.length > 0 && (
            <div className="space-y-0.5 pb-1 mb-1 border-b border-slate-100">
              {mandatoryCols.map((column) => {
                const label = getColumnDisplayTitle(column.id);
                return (
                  <div
                    key={column.id}
                    data-testid={`column-mandatory-${column.id}`}
                    className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg text-slate-500 cursor-default select-none"
                    title="Mandatory column (cannot be hidden or reordered)"
                  >
                    <Checkbox checked={true} disabled={true} />
                    <span className="text-xs font-medium text-slate-600 flex-1 truncate">
                      {label}
                    </span>
                    {/* Empty placeholder on the right: no drag handle, no lock icon */}
                    <div className="w-5" />
                  </div>
                );
              })}
            </div>
          )}

          {/* Reorderable Columns Section */}
          {filteredReorderableCols.length > 0 ? (
            filteredReorderableCols.map((column) => {
              const label = getColumnDisplayTitle(column.id);
              const isChecked = isColVisible(column.id);
              const isDragging = draggedColId === column.id;
              const isOver = dragOverColId === column.id;
              const canDrag = !searchQuery.trim();

              return (
                <div
                  key={column.id}
                  data-testid={`column-item-${column.id}`}
                  draggable={canDrag}
                  onDragStart={(e) => canDrag && handleDragStart(e, column.id)}
                  onDragOver={(e) => canDrag && handleDragOver(e, column.id)}
                  onDrop={(e) => canDrag && handleDrop(e, column.id)}
                  onDragEnd={handleDragEnd}
                  onClick={() => handleRowClick(column)}
                  className={cn(
                    "group relative flex items-center gap-2.5 px-2 py-1.5 rounded-lg text-slate-700 transition-all select-none cursor-pointer",
                    "hover:bg-slate-100/80",
                    isDragging && "opacity-35 bg-slate-50",
                    !canDrag && "cursor-pointer"
                  )}
                >
                  {/* Clean Navy Drop Indicator Line */}
                  {isOver && dropPosition === "top" && (
                    <div className="absolute -top-0.5 left-2 right-2 h-[2px] bg-telkom-navy rounded-full z-10 pointer-events-none" />
                  )}
                  {isOver && dropPosition === "bottom" && (
                    <div className="absolute -bottom-0.5 left-2 right-2 h-[2px] bg-telkom-navy rounded-full z-10 pointer-events-none" />
                  )}

                  <Checkbox
                    checked={isChecked}
                    onChange={() => handleToggleColumn(column)}
                  />

                  <span className="text-xs font-normal text-slate-700 flex-1 truncate group-hover:text-slate-900">
                    {label}
                  </span>

                  {/* Drag Handle on the Right */}
                  {canDrag ? (
                    <span
                      title="Drag to reorder column"
                      onClick={(e) => e.stopPropagation()}
                      className="material-symbols-outlined text-[18px] text-slate-400 group-hover:text-slate-700 hover:bg-slate-200/50 rounded p-0.5 transition-colors leading-none cursor-grab active:cursor-grabbing select-none"
                    >
                      drag_indicator
                    </span>
                  ) : (
                    <div className="w-5" />
                  )}
                </div>
              );
            })
          ) : (
            <div className="py-6 text-center text-xs text-slate-400">
              No columns match &quot;{searchQuery}&quot;
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}