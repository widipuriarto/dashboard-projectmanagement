import * as React from "react";
import { cn } from "@/lib/utils";

interface CurrencyInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange" | "value"> {
  value?: number | string | null;
  onChange?: (value: number | null) => void;
  prefix?: string;
}

const numberFormatter = new Intl.NumberFormat("id-ID");

const formatNumberToDisplay = (val?: number | string | null): string => {
  if (val === undefined || val === null || val === "") return "";
  const num = typeof val === "number" ? val : parseFloat(String(val).replace(/\D/g, ""));
  if (isNaN(num)) return "";
  return numberFormatter.format(num);
};

export const CurrencyInput = React.forwardRef<HTMLInputElement, CurrencyInputProps>(
  ({ className, value, onChange, prefix = "Rp", disabled, placeholder = "0", ...props }, ref) => {
    const [displayValue, setDisplayValue] = React.useState<string>(() =>
      formatNumberToDisplay(value)
    );

    React.useEffect(() => {
      setDisplayValue(formatNumberToDisplay(value));
    }, [value]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value;
      // Strip all non-digit characters
      const cleanDigits = raw.replace(/\D/g, "");

      if (!cleanDigits) {
        setDisplayValue("");
        if (onChange) onChange(null);
        return;
      }

      const numericVal = parseInt(cleanDigits, 10);
      setDisplayValue(numberFormatter.format(numericVal));

      if (onChange) {
        onChange(numericVal);
      }
    };

    return (
      <div
        className={cn(
          "relative flex items-center w-full rounded-lg border border-slate-200 bg-white shadow-2xs transition-all focus-within:border-telkom-navy focus-within:ring-2 focus-within:ring-telkom-navy/15",
          disabled && "bg-slate-50 opacity-60 cursor-not-allowed",
          className
        )}
      >
        {prefix && (
          <span className="flex items-center justify-center pl-3 pr-2 text-xs font-semibold text-slate-400 select-none">
            {prefix}
          </span>
        )}
        <input
          {...props}
          ref={ref}
          type="text"
          inputMode="numeric"
          disabled={disabled}
          placeholder={placeholder}
          value={displayValue}
          onChange={handleChange}
          className="w-full h-10 py-2 pr-3 text-sm text-slate-800 placeholder:text-slate-400 bg-transparent outline-none disabled:cursor-not-allowed font-medium text-left"
        />
      </div>
    );
  }
);

CurrencyInput.displayName = "CurrencyInput";

