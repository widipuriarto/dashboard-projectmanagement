import * as React from "react";
import { cn } from "@/lib/utils";

interface FormFieldProps {
  label: string;
  required?: boolean;
  lockIcon?: boolean;
  colSpan?: 1 | 2;
  error?: string;
  topError?: string;
  hint?: string;
  children: React.ReactNode;
  className?: string;
}

export function FormField({
  label,
  required = false,
  lockIcon = false,
  colSpan = 1,
  error,
  topError,
  hint,
  children,
  className,
}: FormFieldProps) {
  return (
    <div
      className={cn(
        "space-y-1.5 w-full",
        colSpan === 2 && "col-span-1 md:col-span-2",
        className
      )}
    >
      <div className="flex items-center justify-between">
        <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 select-none">
          <span>{label}</span>
          {required && (
            <span className="text-telkom-red font-bold text-sm leading-none ml-0.5" title="Mandatory Field">
              *
            </span>
          )}
          {lockIcon && (
            <span
              className="material-symbols-outlined text-[13px] text-slate-400 select-none leading-none"
              title="Read-Only Field"
            >
              lock
            </span>
          )}
        </label>
        {topError ? (
          <span className="text-[11px] font-medium text-telkom-red animate-in fade-in duration-150">
            {topError}
          </span>
        ) : hint ? (
          <span className="text-[11px] text-slate-400 font-normal">{hint}</span>
        ) : null}
      </div>

      <div>{children}</div>

      {error && (
        <p className="text-xs text-telkom-red font-medium flex items-center gap-1 animate-in fade-in duration-150">
          <span>•</span>
          <span>{error}</span>
        </p>
      )}
    </div>
  );
}

