import * as React from "react";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";

export interface PasswordInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  error?: string;
}

export const PasswordInput = React.forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ className, error, disabled, ...props }, ref) => {
    const [showPassword, setShowPassword] = React.useState(false);

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
          type={showPassword ? "text" : "password"}
          disabled={disabled}
          className="w-full h-full bg-transparent px-3.5 pr-11 text-sm text-slate-800 placeholder:text-slate-400 outline-none border-0 focus:ring-0 rounded-lg"
          {...props}
        />
        <button
          type="button"
          tabIndex={-1}
          disabled={disabled}
          onClick={() => setShowPassword((prev) => !prev)}
          className="absolute right-2.5 z-10 flex items-center justify-center h-7 w-7 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer select-none"
          title={showPassword ? "Hide password" : "Show password"}
          aria-label={showPassword ? "Hide password" : "Show password"}
        >
          {showPassword ? (
            <EyeOff className="h-4 w-4" />
          ) : (
            <Eye className="h-4 w-4" />
          )}
        </button>
      </div>
    );
  }
);

PasswordInput.displayName = "PasswordInput";
