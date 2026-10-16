import * as React from "react";
import { cn } from "@/lib/utils";

interface FormSectionProps {
  title: string;
  badge?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

export function FormSection({
  title,
  badge,
  description,
  children,
  className,
}: FormSectionProps) {
  return (
    <section className={cn("space-y-4 w-full", className)}>
      {/* Section Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold uppercase tracking-wider text-telkom-navy select-none">
              {title}
            </h3>
            {badge && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-telkom-navy/10 text-telkom-navy">
                {badge}
              </span>
            )}
          </div>
          {description && (
            <p className="text-xs text-slate-400 font-normal">{description}</p>
          )}
        </div>
      </div>

      {/* 2-Column Responsive Grid Content */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
        {children}
      </div>
    </section>
  );
}

