import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export interface AuthCheckboxProps {
  id?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
}

export function AuthCheckbox({
  id = "remember-me",
  checked,
  onChange,
  label = "Remember me",
  disabled,
}: AuthCheckboxProps) {
  return (
    <label
      htmlFor={id}
      className={cn(
        "inline-flex items-center gap-2 select-none cursor-pointer group",
        disabled && "opacity-50 cursor-not-allowed"
      )}
    >
      <div
        className={cn(
          "h-4 w-4 rounded border flex items-center justify-center transition-all duration-150 shrink-0",
          checked
            ? "bg-telkom-navy border-telkom-navy text-white shadow-2xs"
            : "bg-white border-slate-300 hover:border-slate-400 group-hover:border-slate-400",
          "focus-within:ring-2 focus-within:ring-telkom-navy/20"
        )}
      >
        <input
          id={id}
          type="checkbox"
          checked={checked}
          disabled={disabled}
          onChange={(e) => onChange(e.target.checked)}
          className="sr-only"
        />
        {checked && <Check className="h-3 w-3 stroke-[3]" />}
      </div>
      {label && (
        <span className="text-xs font-medium text-slate-600 group-hover:text-slate-800 transition-colors">
          {label}
        </span>
      )}
    </label>
  );
}

