import * as React from "react";
import { cn } from "@/lib/utils";

export interface AuthInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  trailingIcon?: React.ReactNode;
  error?: string;
}

export const AuthInput = React.forwardRef<HTMLInputElement, AuthInputProps>(
  ({ className, type = "text", trailingIcon, error, disabled, ...props }, ref) => {
    return (
      <div
        className={cn(
          "relative flex items-center w-full h-11 rounded-lg border bg-white overflow-hidden transition-all",
          error
            ? "border-red-400 focus-within:border-red-500 focus-within:ring-1 focus-within:ring-red-500/20"
            : "border-slate-300 hover:border-slate-400 focus-within:border-telkom-navy focus-within:ring-1 focus-within:ring-telkom-navy/20",
          disabled && "bg-slate-50 opacity-60 cursor-not-allowed",
          className
        )}
      >
        <input
          ref={ref}
          type={type}
          disabled={disabled}
          className={cn(
            "w-full h-full bg-transparent px-3.5 text-sm text-slate-800 placeholder:text-slate-400 outline-none border-0 focus:ring-0 rounded-lg",
            trailingIcon && "pr-10"
          )}
          {...props}
        />
        {trailingIcon && (
          <div className="absolute right-3.5 flex items-center pointer-events-none select-none text-slate-400 z-10">
            {trailingIcon}
          </div>
        )}
      </div>
    );
  }
);

AuthInput.displayName = "AuthInput";
