import * as React from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";

export interface CellOverflowData {
  text: string;
  anchorRect: DOMRect | { top: number; left: number; width: number; height: number };
}

export interface CellOverflowPopoverProps {
  data: CellOverflowData | null;
  onClose: () => void;
}

export function CellOverflowPopover({
  data,
  onClose,
}: CellOverflowPopoverProps) {
  const popoverRef = React.useRef<HTMLDivElement>(null);

  // Clear any accidental browser word-selection on open
  React.useEffect(() => {
    if (data && typeof window !== "undefined") {
      window.getSelection()?.removeAllRanges();
      const timer = setTimeout(() => {
        window.getSelection()?.removeAllRanges();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [data]);

  // Close on Escape key
  React.useEffect(() => {
    if (!data) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [data, onClose]);

  // Close on click outside
  React.useEffect(() => {
    if (!data) return;

    const handlePointerDown = (e: MouseEvent | TouchEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handlePointerDown, true);
    return () => document.removeEventListener("mousedown", handlePointerDown, true);
  }, [data, onClose]);

  // Close on window resize
  React.useEffect(() => {
    if (!data) return;

    const handleDismiss = () => {
      onClose();
    };

    window.addEventListener("resize", handleDismiss);
    return () => window.removeEventListener("resize", handleDismiss);
  }, [data, onClose]);

  if (!data || !data.text || !data.text.trim()) return null;

  const rect = data.anchorRect;

  // Calculate intelligent viewport bounds
  const minWidth = Math.max(rect.width, 240);
  const maxWidth = Math.min(500, typeof window !== "undefined" ? window.innerWidth - 32 : 500);

  // Keep fixed to original anchor left, ensuring it stays within viewport
  let left = rect.left;
  if (typeof window !== "undefined" && left + minWidth > window.innerWidth - 16) {
    left = Math.max(16, window.innerWidth - minWidth - 16);
  }

  // Ensure popover does not overflow off-screen vertically
  let top = rect.top;
  const estimatedHeight = 180;
  const rectBottom = "bottom" in rect && typeof rect.bottom === "number" ? rect.bottom : rect.top + rect.height;
  if (typeof window !== "undefined" && top + estimatedHeight > window.innerHeight - 16) {
    top = Math.max(16, rectBottom - estimatedHeight);
  }

  return createPortal(
    <div
      ref={popoverRef}
      data-testid="cell-overflow-popover"
      onDoubleClick={(e) => {
        // Prevent accidental double-click word-selection inside the popover
        e.stopPropagation();
        if (typeof window !== "undefined") {
          window.getSelection()?.removeAllRanges();
        }
      }}
      style={{
        position: "fixed",
        top: `${top}px`,
        left: `${left}px`,
        minWidth: `${minWidth}px`,
        maxWidth: `${maxWidth}px`,
        zIndex: 60,
      }}
      className={cn(
        "rounded-[4px] border border-telkom-navy bg-white p-2.5",
        "animate-in fade-in zoom-in-95 duration-150 outline-none max-h-[260px] overflow-y-auto [scrollbar-width:thin]"
      )}
    >
      <p className="text-xs text-slate-800 font-normal leading-relaxed break-words whitespace-pre-wrap select-text cursor-text">
        {data.text}
      </p>
    </div>,
    document.body
  );
}
