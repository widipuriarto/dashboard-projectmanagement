import * as React from "react";
import { ChevronDown, Check } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export interface SelectOption {
  value: string;
  label: string;
}

export interface CustomSelectProps {
  id?: string;
  value?: string;
  onChange?: (value: string) => void;
  options: (string | SelectOption)[];
  placeholder?: string;
  disabled?: boolean;
  error?: string;
  className?: string;
  "data-testid"?: string;
}

export function CustomSelect({
  value,
  onChange,
  options,
  placeholder = "Pilih opsi...",
  disabled = false,
  error,
  className,
  "data-testid": testId,
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [highlightedIndex, setHighlightedIndex] = React.useState<number>(-1);
  const triggerRef = React.useRef<HTMLButtonElement>(null);
  const optionsRef = React.useRef<(HTMLButtonElement | null)[]>([]);
  const [menuWidth, setMenuWidth] = React.useState<number | undefined>();

  const normalizedOptions = React.useMemo<SelectOption[]>(() => {
    return options.map((opt) => {
      if (typeof opt === "string") {
        return { value: opt, label: opt };
      }
      return opt;
    });
  }, [options]);

  const selectedOption = React.useMemo(() => {
    return normalizedOptions.find((opt) => opt.value === value);
  }, [normalizedOptions, value]);

  // Synchronize dropdown width with trigger button width on open
  React.useEffect(() => {
    if (isOpen && triggerRef.current) {
      setMenuWidth(triggerRef.current.offsetWidth);
    }
  }, [isOpen]);

  // Sync highlighted option index when opening dropdown
  React.useEffect(() => {
    if (isOpen) {
      const idx = normalizedOptions.findIndex((opt) => opt.value === value);
      setHighlightedIndex(idx >= 0 ? idx : 0);
    } else {
      setHighlightedIndex(-1);
    }
  }, [isOpen, value, normalizedOptions]);

  // Auto-scroll highlighted element into visible view
  React.useEffect(() => {
    if (isOpen && highlightedIndex >= 0 && optionsRef.current[highlightedIndex]) {
      optionsRef.current[highlightedIndex]?.scrollIntoView({
        block: "nearest",
      });
    }
  }, [isOpen, highlightedIndex]);

  const handleSelect = (val: string) => {
    if (onChange) {
      onChange(val);
    }
    setIsOpen(false);
    triggerRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;

    if (!isOpen) {
      if (
        e.key === "ArrowDown" ||
        e.key === "ArrowUp" ||
        e.key === "Enter" ||
        e.key === " "
      ) {
        e.preventDefault();
        setIsOpen(true);
      }
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIndex((prev) =>
        prev < normalizedOptions.length - 1 ? prev + 1 : 0
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex((prev) =>
        prev > 0 ? prev - 1 : normalizedOptions.length - 1
      );
    } else if (e.key === "Home") {
      e.preventDefault();
      setHighlightedIndex(0);
    } else if (e.key === "End") {
      e.preventDefault();
      setHighlightedIndex(normalizedOptions.length - 1);
    } else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      if (highlightedIndex >= 0 && highlightedIndex < normalizedOptions.length) {
        handleSelect(normalizedOptions[highlightedIndex].value);
      }
    } else if (e.key === "Escape") {
      e.preventDefault();
      setIsOpen(false);
      triggerRef.current?.focus();
    } else if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
      // Typeahead navigation
      const char = e.key.toLowerCase();
      const matchIdx = normalizedOptions.findIndex((opt, idx) => {
        if (idx <= highlightedIndex) return false;
        return opt.label.toLowerCase().startsWith(char);
      });
      if (matchIdx >= 0) {
        setHighlightedIndex(matchIdx);
      } else {
        const wrapIdx = normalizedOptions.findIndex((opt) =>
          opt.label.toLowerCase().startsWith(char)
        );
        if (wrapIdx >= 0) setHighlightedIndex(wrapIdx);
      }
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger
        ref={triggerRef}
        data-testid={testId}
        disabled={disabled}
        type="button"
        onKeyDown={handleKeyDown}
        className={cn(
          "w-full h-10 px-3 rounded-lg border bg-white text-sm shadow-2xs transition-all flex items-center justify-between text-left outline-none select-none cursor-pointer",
          error
            ? "border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-500/15"
            : isOpen
            ? "border-telkom-navy ring-2 ring-telkom-navy/15"
            : "border-slate-200 hover:border-slate-300 focus:border-telkom-navy focus:ring-2 focus:ring-telkom-navy/15",
          disabled && "bg-slate-50 opacity-60 cursor-not-allowed pointer-events-none",
          className
        )}
      >
        <span
          className={cn(
            "truncate flex-1 pr-2",
            selectedOption ? "text-slate-800 font-medium" : "text-slate-400 font-normal"
          )}
        >
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown
          className={cn(
            "h-4 w-4 text-slate-400 shrink-0 transition-transform duration-200",
            isOpen && "rotate-180 text-telkom-navy"
          )}
        />
      </PopoverTrigger>

      <PopoverContent
        align="start"
        side="bottom"
        sideOffset={4}
        onKeyDown={handleKeyDown}
        style={{ width: menuWidth ? `${menuWidth}px` : "auto", minWidth: menuWidth ? `${menuWidth}px` : "180px" }}
        className="p-1.5 rounded-xl border border-slate-200/90 bg-white shadow-xl max-h-64 overflow-y-auto space-y-0.5 z-50 duration-150 [scrollbar-width:thin]"
      >
        {normalizedOptions.map((opt, idx) => {
          const isSelected = opt.value === value;
          const isHighlighted = idx === highlightedIndex;
          return (
            <button
              key={opt.value}
              data-testid={`select-option-${opt.value}`}
              ref={(el) => {
                optionsRef.current[idx] = el;
              }}
              type="button"
              onClick={() => handleSelect(opt.value)}
              onMouseEnter={() => setHighlightedIndex(idx)}
              className={cn(
                "w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm text-left transition-colors cursor-pointer select-none",
                isSelected
                  ? "bg-telkom-navy/10 text-telkom-navy font-semibold"
                  : isHighlighted
                  ? "bg-slate-100 text-slate-900 font-medium"
                  : "text-slate-700 hover:bg-slate-100 hover:text-slate-900 font-medium"
              )}
            >
              <span className="truncate mr-2">{opt.label}</span>
              {isSelected && <Check className="h-4 w-4 text-telkom-navy shrink-0" />}
            </button>
          );
        })}
      </PopoverContent>
    </Popover>
  );
}
