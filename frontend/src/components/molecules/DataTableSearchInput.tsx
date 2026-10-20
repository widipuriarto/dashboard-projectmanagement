import * as React from "react";
import type { Table } from "@tanstack/react-table";
import { Search, ChevronDown, Check, X } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { getColumnDisplayTitle } from "@/components/organisms/columns";

interface DataTableSearchInputProps<TData> {
  table: Table<TData>;
  className?: string;
  disabled?: boolean;
}

export function DataTableSearchInput<TData>({
  table,
  className,
  disabled = false,
}: DataTableSearchInputProps<TData>) {
  const [query, setQuery] = React.useState("");
  const [targetColumn, setTargetColumn] = React.useState("all");
  const [isDropdownOpen, setIsDropdownOpen] = React.useState(false);
  const [columnSearchQuery, setColumnSearchQuery] = React.useState("");
  const [isFocused, setIsFocused] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  // Keyboard shortcut listener: Ctrl+F or Cmd+F focuses search input
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (disabled) return;
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "f") {
        e.preventDefault();
        inputRef.current?.focus();
        inputRef.current?.select();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Extract all searchable data columns (excluding actions and row number)
  const searchableColumns = React.useMemo(() => {
    return table
      .getAllColumns()
      .filter((col) => col.id !== "actions" && col.id !== "nomor")
      .map((col) => ({
        id: col.id,
        label: getColumnDisplayTitle(col.id),
      }));
  }, [table]);

  // Filter columns list by user input inside the dropdown
  const filteredColumns = React.useMemo(() => {
    if (!columnSearchQuery.trim()) return searchableColumns;
    const q = columnSearchQuery.toLowerCase().trim();
    return searchableColumns.filter(
      (col) =>
        col.label.toLowerCase().includes(q) || col.id.toLowerCase().includes(q)
    );
  }, [searchableColumns, columnSearchQuery]);

  // Active column title displayed on the trigger button
  const activeColumnLabel = React.useMemo(() => {
    if (targetColumn === "all") return "All Columns";
    const found = searchableColumns.find((c) => c.id === targetColumn);
    return found ? found.label : getColumnDisplayTitle(targetColumn);
  }, [targetColumn, searchableColumns]);

  // Dynamic input placeholder based on selected column
  const placeholderText = React.useMemo(() => {
    if (targetColumn === "all") return "Search all columns...";
    return `Search in ${activeColumnLabel}...`;
  }, [targetColumn, activeColumnLabel]);

  // Synchronize search state with TanStack Table global filter
  React.useEffect(() => {
    if (!query.trim()) {
      table.setGlobalFilter(undefined);
    } else {
      table.setGlobalFilter({
        query: query.trim().toLowerCase(),
        targetColumn,
      });
    }
  }, [query, targetColumn, table]);

  return (
    <div
      className={cn(
        "relative flex items-center h-10 w-full md:w-[420px] bg-white border border-slate-200 rounded-lg shadow-sm transition-all",
        disabled
          ? "opacity-80 pointer-events-none cursor-not-allowed bg-slate-100/70 border-slate-300 shadow-2xs"
          : "hover:border-telkom-navy focus-within:border-telkom-navy focus-within:ring-1 focus-within:ring-telkom-navy",
        className
      )}
    >
      {/* Search Icon */}
      <Search className={cn("h-4 w-4 ml-3 shrink-0 pointer-events-none select-none", disabled ? "text-slate-500" : "text-slate-400 group-hover:text-telkom-navy")} />

      {/* Column Selector Popover Trigger */}
      <Popover open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
        <PopoverTrigger
          data-testid="search-column-dropdown"
          className={cn(
            "inline-flex items-center gap-1.5 h-7 px-2.5 mx-1 rounded-md text-xs font-semibold cursor-pointer select-none transition-all shrink-0 outline-none",
            disabled
              ? "text-slate-700"
              : targetColumn !== "all"
              ? "bg-telkom-navy/10 text-telkom-navy hover:bg-telkom-navy/15"
              : "text-slate-600 hover:text-telkom-navy hover:bg-slate-100"
          )}
          title="Select target column to search"
        >
          <span className="max-w-[125px] truncate">{activeColumnLabel}</span>
          <ChevronDown className={cn("h-3 w-3 shrink-0", disabled ? "text-slate-500" : "text-slate-400")} />
        </PopoverTrigger>

        <PopoverContent
          align="start"
          sideOffset={8}
          className="w-64 p-2 rounded-2xl shadow-xl border border-slate-200 bg-white"
        >
          {/* Quick Filter Input inside Dropdown */}
          <div className="relative mb-1.5">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none select-none" />
            <input
              type="text"
              placeholder="Search column..."
              value={columnSearchQuery}
              onChange={(e) => setColumnSearchQuery(e.target.value)}
              className="w-full h-8 pl-8 pr-7 text-xs bg-slate-50/60 border border-slate-200/60 rounded-lg text-slate-700 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-telkom-navy/60 focus:ring-1 focus:ring-telkom-navy/20 transition-all"
            />
            {columnSearchQuery && (
              <button
                type="button"
                onClick={() => setColumnSearchQuery("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs cursor-pointer p-0.5 leading-none"
              >
                ✕
              </button>
            )}
          </div>

          {/* Scrollable Column Options List */}
          <div className="max-h-60 overflow-y-auto space-y-0.5 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            {/* Option: All Columns */}
            <button
              type="button"
              data-testid="search-column-all"
              onClick={() => {
                setTargetColumn("all");
                setIsDropdownOpen(false);
                setColumnSearchQuery("");
              }}
              className={cn(
                "w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-colors text-left cursor-pointer",
                targetColumn === "all"
                  ? "bg-telkom-navy text-white font-semibold shadow-xs"
                  : "text-slate-700 hover:bg-slate-100 font-medium"
              )}
            >
              <span>All Columns</span>
              {targetColumn === "all" && (
                <Check className="h-3.5 w-3.5 text-white shrink-0" />
              )}
            </button>

            <div className="h-px bg-slate-100 my-1" />

            {/* Individual Columns */}
            {filteredColumns.map((col) => {
              const isSelected = targetColumn === col.id;
              return (
                <button
                  key={col.id}
                  data-testid={`search-column-${col.id}`}
                  type="button"
                  onClick={() => {
                    setTargetColumn(col.id);
                    setIsDropdownOpen(false);
                    setColumnSearchQuery("");
                  }}
                  className={cn(
                    "w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-colors text-left cursor-pointer",
                    isSelected
                      ? "bg-telkom-navy text-white font-semibold shadow-xs"
                      : "text-slate-700 hover:bg-slate-100 font-medium"
                  )}
                >
                  <span className="truncate mr-2">{col.label}</span>
                  {isSelected && (
                    <Check className="h-3.5 w-3.5 text-white shrink-0" />
                  )}
                </button>
              );
            })}

            {filteredColumns.length === 0 && (
              <div className="py-4 text-center text-xs text-slate-400">
                No column found
              </div>
            )}
          </div>
        </PopoverContent>
      </Popover>

      {/* Hairline Vertical Divider */}
      <div className={cn("h-4 w-px mx-1 shrink-0 select-none", disabled ? "bg-slate-300" : "bg-slate-200")} />

      {/* Search Input Field */}
      <input
        ref={inputRef}
        type="text"
        data-testid="search-input"
        disabled={disabled}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        placeholder={placeholderText}
        className={cn(
          "flex-1 h-full min-w-0 bg-transparent px-2 text-sm outline-none border-0 focus:ring-0 focus:outline-none",
          disabled ? "text-slate-600 placeholder:text-slate-500 cursor-not-allowed" : "text-slate-800 placeholder:text-slate-400"
        )}
      />

      {/* Keyboard Shortcut Hint (visible only when input is empty and not focused) */}
      {!query && !isFocused && (
        <kbd className={cn(
          "hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 mr-2.5 text-[10px] font-semibold rounded select-none pointer-events-none border",
          disabled
            ? "text-slate-500 bg-slate-200/60 border-slate-300"
            : "text-slate-400 bg-slate-100 border-slate-200/80"
        )}>
          Ctrl F
        </kbd>
      )}

      {/* Clear Input Button */}
      {query && (
        <button
          type="button"
          data-testid="search-clear-button"
          onClick={() => {
            setQuery("");
            inputRef.current?.focus();
          }}
          className="p-1 mr-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 cursor-pointer transition-colors shrink-0"
          title="Clear search text"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}

