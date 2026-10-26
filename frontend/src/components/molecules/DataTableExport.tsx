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
  onExportExcel?: () => void;
  onExportPdf?: () => void;
}

export function DataTableExport({
  className,
  disabled = false,
  onExportExcel,
  onExportPdf,
}: DataTableExportProps) {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger
        data-testid="export-button"
        disabled={disabled}
        className={cn(
          buttonVariants({ variant: "outline", size: "lg" }),
          "group/export h-10 rounded-md flex items-center justify-center cursor-pointer px-2 sm:px-2.5 gap-1 sm:gap-1.5 shadow-sm transition-all text-xs sm:text-sm",
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
              : "text-slate-500 group-hover/export:text-telkom-navy"
          )}
        >
          export_notes
        </span>
        <span
          className={cn(
            "font-medium truncate transition-colors",
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
            "h-3.5 w-3.5 transition-colors shrink-0 -mr-0.5",
            disabled
              ? "!text-slate-500"
              : isOpen
              ? "text-telkom-navy"
              : "text-slate-400 group-hover/export:text-telkom-navy"
          )}
        />
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        sideOffset={4}
        className="w-56 p-1.5 shadow-xl border-none ring-0 rounded-xl bg-white/95 backdrop-blur-md"
      >
        <DropdownMenuItem
          data-testid="export-excel-option"
          onClick={onExportExcel}
          className="cursor-pointer py-2 px-2.5 rounded-lg text-xs sm:text-sm font-medium text-slate-700 hover:bg-slate-100 focus:bg-slate-100 flex items-center gap-2.5 transition-colors focus:[--accent-foreground:inherit]"
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

        <DropdownMenuItem
          data-testid="export-pdf-option"
          onClick={onExportPdf}
          className="cursor-pointer py-2 px-2.5 rounded-lg text-xs sm:text-sm font-medium text-slate-700 hover:bg-slate-100 focus:bg-slate-100 flex items-center gap-2.5 transition-colors focus:[--accent-foreground:inherit]"
        >
          <div className="h-7 w-7 rounded-md bg-red-50 !text-telkom-red border border-red-100 flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[18px] leading-none select-none !text-telkom-red">
              picture_as_pdf
            </span>
          </div>
          <div className="flex flex-col text-left">
            <span className="!text-slate-800 font-semibold leading-tight text-xs sm:text-sm">
              Export PDF
            </span>
            <span className="text-[10px] !text-slate-400 leading-tight">
              Document (.pdf)
            </span>
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

