import { cn } from "@/lib/utils";

export interface CheckboxProps {
  checked: boolean;
  onChange?: () => void;
  disabled?: boolean;
  className?: string;
  id?: string;
  title?: string;
  "aria-label"?: string;
}

export function Checkbox({
  checked,
  onChange,
  disabled = false,
  className,
  id,
  title,
  "aria-label": ariaLabel,
}: CheckboxProps) {
  return (
    <button
      id={id}
      type="button"
      role="checkbox"
      aria-checked={checked}
      aria-label={ariaLabel}
      title={title}
      disabled={disabled}
      onClick={(e) => {
        e.stopPropagation();
        (e.currentTarget as HTMLElement)?.blur();
        if (!disabled && onChange) {
          onChange();
        }
      }}
      className={cn(
        "h-4 w-4 rounded-[4px] flex items-center justify-center transition-all shrink-0 outline-none select-none",
        disabled
          ? "bg-slate-200 text-white cursor-not-allowed opacity-90"
          : checked
          ? "bg-telkom-navy text-white hover:bg-[#001f4d] cursor-pointer shadow-none"
          : "border-2 border-slate-300 bg-white hover:border-slate-400 cursor-pointer",
        className
      )}
    >
      {(checked || disabled) && (
        <svg
          className="h-3 w-3 stroke-[3] text-white pointer-events-none"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M4.5 12.75l6 6 9-13.5"
          />
        </svg>
      )}
    </button>
  );
}

