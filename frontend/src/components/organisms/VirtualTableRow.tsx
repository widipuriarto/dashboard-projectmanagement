import * as React from "react";
import { flexRender, type Row } from "@tanstack/react-table";
import { TableCell, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import {
  LOCKED_COLUMNS,
  OVERFLOW_ENABLED_COLUMN_IDS,
} from "@/lib/table-constants";

export interface VirtualTableRowProps<TData> {
  row: Row<TData>;
  virtualRowIndex: number;
  isRowHighlighted: boolean;
  highlightVariant?: "sky" | "grey";
  isExpanded: boolean;
  lastPinnedId: string | undefined;
  isScrolledX: boolean;
  columnsSignature: string;
  measureElement?: (node: HTMLTableRowElement | null) => void;
  onCellDoubleClick?: (
    e: React.MouseEvent<HTMLTableCellElement>,
    columnId: string,
    value: unknown
  ) => void;
}

/**
 * High-performance virtualized table row with pinned sticky columns and memoization.
 */
export const VirtualTableRow = React.memo(
  function VirtualTableRow<TData>({
    row,
    virtualRowIndex,
    isRowHighlighted,
    highlightVariant = "sky",
    isExpanded,
    lastPinnedId,
    isScrolledX,
    measureElement,
    onCellDoubleClick,
  }: VirtualTableRowProps<TData>) {
    return (
      <TableRow
        ref={measureElement}
        data-testid="table-row"
        data-index={virtualRowIndex}
        data-state={row.getIsSelected() && "selected"}
        className={cn(
          "group",
          isExpanded ? "h-auto" : "h-11",
          isRowHighlighted && (
            highlightVariant === "grey"
              ? "bg-slate-100 font-medium transition-colors duration-700"
              : "bg-sky-50/90 font-medium transition-colors duration-700"
          )
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
                "py-1.5 px-3 text-ellipsis whitespace-nowrap border-b-[1.5px] border-slate-200",
                isLastPinned ? "overflow-visible" : "overflow-hidden",
                isOverflowEligible && "cursor-default",
                isRowHighlighted
                  ? isPinned
                    ? highlightVariant === "grey"
                      ? "sticky z-10 bg-slate-100 text-slate-800 font-medium transition-colors duration-700"
                      : "sticky z-10 bg-sky-50 text-sky-950 font-semibold transition-colors duration-700"
                    : highlightVariant === "grey"
                    ? "bg-slate-100/90 text-slate-800 font-medium transition-colors duration-700"
                    : "bg-sky-50/90 text-sky-950 font-medium transition-colors duration-700"
                  : isPinned
                  ? "sticky z-10 bg-white text-slate-700 group-hover:bg-slate-100"
                  : "bg-white text-slate-700 group-hover:bg-slate-100",
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
      prev.highlightVariant === next.highlightVariant &&
      prev.isExpanded === next.isExpanded &&
      prev.lastPinnedId === next.lastPinnedId &&
      prev.isScrolledX === next.isScrolledX &&
      prev.columnsSignature === next.columnsSignature &&
      prev.onCellDoubleClick === next.onCellDoubleClick
    );
  }
) as <TData>(props: VirtualTableRowProps<TData>) => React.ReactElement;
