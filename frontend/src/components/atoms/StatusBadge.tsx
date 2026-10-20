import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export type StatusVariant = "success" | "warning" | "destructive" | "default";

export interface StatusBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
    variant?: StatusVariant;
    children: React.ReactNode;
}

const VARIANT_STYLES: Record<StatusVariant, string> = {
  success: "bg-[#10B981]/15 text-[#10B981] hover:bg-[#10B981]/25",
  warning: "bg-amber-500/15 text-amber-700 hover:bg-amber-500/25",
  destructive: "bg-[#ED1C24]/15 text-[#ED1C24] hover:bg-[#ED1C24]/25",
  default: "bg-slate-100 text-slate-700 hover:bg-slate-200",
};

export function StatusBadge({ 
  variant = "default", 
  children, 
  className, 
  ...props 
}: StatusBadgeProps) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "rounded-full px-2.5 py-0.5 text-[12px] font-bold shadow-none border-transparent",
        VARIANT_STYLES[variant],
        className
      )}
      {...props}
    >
      {children}
    </Badge>
  );
}