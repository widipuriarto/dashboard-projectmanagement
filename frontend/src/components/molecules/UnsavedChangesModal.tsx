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
      className="absolute inset-x-0 bottom-0 top-11 z-20 flex items-center justify-center bg-slate-900/35 backdrop-blur-[1px] p-4 animate-in fade-in duration-200"
    >
      <div
        data-testid="unsaved-changes-modal"
        className="rounded-md border-none bg-white p-6 shadow-2xl max-w-sm w-full text-center space-y-5 animate-in zoom-in-95 duration-200 select-none"
      >
        <p className="text-base font-bold text-slate-800 tracking-tight">
          Discard unsaved changes?
        </p>

        <div className="grid grid-cols-2 gap-3 pt-1">
          <Button
            type="button"
            data-testid="unsaved-modal-cancel"
            variant="outline"
            onClick={onCancel}
            className="w-full h-10 rounded-md text-sm font-medium border border-transparent bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
          >
            Cancel
          </Button>

          <Button
            type="button"
            data-testid="unsaved-modal-discard"
            onClick={onDiscard}
            className="w-full h-10 rounded-md text-sm font-medium bg-telkom-red hover:bg-red-700 active:bg-red-800 text-white shadow-xs cursor-pointer"
          >
            Discard
          </Button>
        </div>
      </div>
    </div>
  );
}
