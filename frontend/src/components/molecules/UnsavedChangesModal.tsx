import { Button } from "@/components/ui/button";

interface UnsavedChangesModalProps {
  isOpen: boolean;
  onCancel: () => void;
  onDiscard: () => void;
}

export function UnsavedChangesModal({
  isOpen,
  onCancel,
  onDiscard,
}: UnsavedChangesModalProps) {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="absolute inset-0 z-50 flex items-center justify-center bg-slate-900/35 backdrop-blur-[2px] rounded-lg p-4 animate-in fade-in duration-200"
    >
      <div
        data-testid="unsaved-changes-modal"
        className="rounded-xl border border-slate-200 bg-white p-6 shadow-2xl max-w-sm w-full text-center space-y-5 animate-in zoom-in-95 duration-200 select-none"
      >
        <p className="text-base font-bold text-slate-800 tracking-tight">
          Discard Unsaved Changes?
        </p>

        <div className="grid grid-cols-2 gap-3 pt-1">
          <Button
            type="button"
            data-testid="unsaved-modal-cancel"
            variant="outline"
            onClick={onCancel}
            className="w-full h-10 rounded-lg text-sm font-medium border-slate-200 hover:bg-slate-100 text-slate-700 cursor-pointer"
          >
            Cancel
          </Button>

          <Button
            type="button"
            data-testid="unsaved-modal-discard"
            onClick={onDiscard}
            className="w-full h-10 rounded-lg text-sm font-medium bg-telkom-red hover:bg-red-700 active:bg-red-800 text-white shadow-xs cursor-pointer"
          >
            Discard
          </Button>
        </div>
      </div>
    </div>
  );
}
