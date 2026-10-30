import * as React from "react";
import { Calendar, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface YearMismatchModalProps {
  isOpen: boolean;
  fromYear: number;
  toYear: number;
  isSubmitting?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export function YearMismatchModal({
  isOpen,
  fromYear,
  toYear,
  isSubmitting = false,
  onCancel,
  onConfirm,
}: YearMismatchModalProps) {
  React.useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isSubmitting) {
        onCancel();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isSubmitting, onCancel]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="year-mismatch-title"
      aria-describedby="year-mismatch-description"
      className="absolute inset-x-0 bottom-0 top-11 z-20 flex items-center justify-center bg-slate-900/35 backdrop-blur-[1px] p-4 animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isSubmitting) {
          onCancel();
        }
      }}
    >
      <div
        data-testid="year-mismatch-modal"
        className="relative rounded-md border-none bg-white p-6 shadow-2xl max-w-sm sm:max-w-md w-full space-y-5 animate-in zoom-in-95 duration-200 select-none text-center"
      >
        {/* Calendar Icon Badge */}
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-700 shadow-2xs">
          <Calendar className="h-6 w-6 stroke-[2]" />
        </div>

        {/* Modal Text Content */}
        <div className="space-y-2 text-center">
          <h3
            id="year-mismatch-title"
            className="text-base font-bold text-slate-800 tracking-tight"
          >
            Change Tahun Kontrak?
          </h3>
          <p
            id="year-mismatch-description"
            className="text-sm text-slate-600 leading-relaxed px-2"
          >
            Are you sure you want to change and save Tahun Kontrak from{" "}
            <span className="font-bold text-slate-900">{fromYear}</span> to{" "}
            <span className="font-bold text-slate-900">{toYear}</span>?
          </p>
        </div>

        {/* Visual Year Comparison Badge */}
        <div className="flex items-center justify-center gap-3 rounded-md bg-slate-50/80 p-3.5 text-center shadow-2xs border border-slate-100">
          <span className="font-bold text-base text-slate-900">{fromYear}</span>
          <ArrowRight className="h-4 w-4 text-slate-400" />
          <span className="font-bold text-base text-slate-900">{toYear}</span>
        </div>

        {/* Action Buttons: Cancel and Save */}
        <div className="grid grid-cols-2 gap-3 pt-1">
          <Button
            type="button"
            data-testid="btn-year-mismatch-cancel"
            variant="outline"
            disabled={isSubmitting}
            onClick={onCancel}
            className="w-full h-10 rounded-md text-sm font-medium border border-transparent bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
          >
            Cancel
          </Button>

          <Button
            type="button"
            data-testid="btn-year-mismatch-confirm"
            disabled={isSubmitting}
            onClick={onConfirm}
            className="w-full h-10 rounded-md text-sm font-semibold bg-telkom-navy hover:bg-[#003d82] active:bg-[#002047] text-white shadow-xs cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                <span>Saving...</span>
              </>
            ) : (
              <span>Save</span>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
