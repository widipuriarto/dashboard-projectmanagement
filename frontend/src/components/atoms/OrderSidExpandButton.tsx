import * as React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export interface OrderSidExpandButtonProps {
  count: number;
  isExpanded: boolean;
  onToggle: (e: React.MouseEvent) => void;
  position: "left" | "right";
}

/**
 * Toggle pill atom for expanding/collapsing multi-Order or multi-SID child items.
 */
export function OrderSidExpandButton({
  count,
  isExpanded,
  onToggle,
  position,
}: OrderSidExpandButtonProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={cn(
        "absolute top-1/2 -translate-y-1/2 h-6 w-[40px] inline-flex items-center justify-center gap-[3px] rounded-full border border-telkom-navy bg-white text-telkom-navy transition-all cursor-pointer select-none outline-none",
        "hover:bg-telkom-navy hover:text-white active:opacity-90 focus-visible:ring-2 focus-visible:ring-telkom-navy/30",
        position === "left" ? "left-2" : "right-2"
      )}
      aria-label={isExpanded ? "Collapse child rows" : "Expand child rows"}
    >
      <span className="text-[11px] font-semibold leading-none tabular-nums text-center">
        {count}
      </span>
      <ChevronDown
        className={cn(
          "h-3 w-3 shrink-0 stroke-[2.5] transition-transform duration-200 ease-in-out",
          isExpanded && "rotate-180"
        )}
      />
    </button>
  );
}

