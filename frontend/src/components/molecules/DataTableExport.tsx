import * as React from "react";
import { ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface DataTableExportProps {
  className?: string;
  disabled?: boolean;
  onExportCsv?: () => void;
  onExportExcel?: () => void;
}

export function DataTableExport({
  className,
  disabled = false,
  onExportCsv,
  onExportExcel,
}: DataTableExportProps) {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger
        data-testid="export-button"
        disabled={disabled}
        className={cn(
          buttonVariants({ variant: "outline", size: "lg" }),
          "group/export h-10 min-h-10 max-h-10 shrink-0 w-full md:w-[120px] rounded-md flex items-center justify-center cursor-pointer px-2 sm:px-2.5 gap-1 sm:gap-1.5 transition-all text-xs sm:text-sm",
          disabled
            ? "!opacity-80 disabled:!opacity-80 pointer-events-none cursor-not-allowed !bg-slate-100/70 !border-slate-300 !text-slate-700 shadow-2xs"
            : isOpen
            ? "border-telkom-navy bg-slate-50 text-telkom-navy"
            : "border-slate-300/80 bg-white hover:bg-slate-50 hover:border-telkom-navy hover:text-telkom-navy active:bg-slate-100",
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
              : "text-slate-500 group-hover/export:text-telkom-navy"
          )}
        >
          export_notes
        </span>
        <span
          className={cn(
            "font-medium whitespace-nowrap transition-colors",
            disabled
              ? "!text-slate-700"
              : isOpen
              ? "text-telkom-navy"
              : "text-slate-600 group-hover/export:text-telkom-navy"
          )}
        >
          Export
        </span>
        <ChevronDown
          className={cn(
            "h-3.5 w-3.5 transition-transform duration-200 shrink-0 -mr-0.5",
            disabled
              ? "!text-slate-500"
              : isOpen
              ? "rotate-180 text-telkom-navy"
              : "text-slate-400 group-hover/export:text-telkom-navy"
          )}
        />
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        sideOffset={6}
        className="w-56 p-1.5 shadow-md border border-telkom-navy ring-0 rounded-md bg-white"
      >
        {/* Row 1: CSV Export */}
        <DropdownMenuItem
          data-testid="export-csv-option"
          onClick={onExportCsv}
          className="cursor-pointer py-2 px-2.5 rounded-md text-xs sm:text-sm font-medium text-slate-700 hover:bg-slate-100 focus:bg-slate-100 flex items-center gap-2.5 transition-colors focus:[--accent-foreground:inherit]"
        >
          <div className="h-7 w-7 rounded-md bg-blue-50 !text-blue-600 border border-blue-100 flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[18px] leading-none select-none !text-blue-600">
              csv
            </span>
          </div>
          <div className="flex flex-col text-left">
            <span className="!text-slate-800 font-semibold leading-tight text-xs sm:text-sm">
              Export CSV
            </span>
            <span className="text-[10px] !text-slate-400 leading-tight">
              Comma-separated (.csv)
            </span>
          </div>
        </DropdownMenuItem>

        {/* Row 2: Excel Export */}
        <DropdownMenuItem
          data-testid="export-excel-option"
          onClick={onExportExcel}
          className="cursor-pointer py-2 px-2.5 rounded-md text-xs sm:text-sm font-medium text-slate-700 hover:bg-slate-100 focus:bg-slate-100 flex items-center gap-2.5 transition-colors focus:[--accent-foreground:inherit]"
        >
          <div className="h-7 w-7 rounded-md bg-emerald-50 !text-emerald-600 border border-emerald-100 flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[18px] leading-none select-none !text-emerald-600">
              table
            </span>
          </div>
          <div className="flex flex-col text-left">
            <span className="!text-slate-800 font-semibold leading-tight text-xs sm:text-sm">
              Export Excel
            </span>
            <span className="text-[10px] !text-slate-400 leading-tight">
              Spreadsheet (.xlsx)
            </span>
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

