import * as React from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ProjectPM } from "@/components/organisms/columns";

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  project: ProjectPM | null;
  isDeleting?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export function DeleteConfirmationModal({
  isOpen,
  project,
  isDeleting = false,
  onCancel,
  onConfirm,
}: DeleteConfirmationModalProps) {
  React.useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isDeleting) {
        onCancel();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isDeleting, onCancel]);

  if (!isOpen || !project) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-[2px] p-4 animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isDeleting) {
          onCancel();
        }
      }}
    >
      <div
        data-testid="delete-confirmation-modal"
        className="relative rounded-2xl border border-slate-200/90 bg-white p-6 shadow-2xl max-w-md w-full space-y-5 animate-in zoom-in-95 duration-200 select-none"
      >
        {/* Warning Icon Badge */}
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-rose-50 border border-rose-100 text-rose-600 shadow-2xs">
          <Trash2 className="h-6 w-6 stroke-[2]" />
        </div>

        {/* Modal Text Content */}
        <div className="space-y-2 text-center">
          <h3
            id="delete-modal-title"
            className="text-lg font-bold text-slate-800 tracking-tight"
          >
            Delete Project?
          </h3>
          <p className="text-sm text-slate-600 leading-relaxed px-2">
            Are you sure you want to delete{" "}
            <span className="font-bold font-mono text-telkom-navy break-all">
              {project.project_id_pm}
            </span>
            ? This action cannot be undone and will permanently remove this record from the repository.
          </p>
        </div>

        {/* Project Name Framed Container */}
        <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-3.5 text-center shadow-2xs">
          <span className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1 select-none">
            Nama Proyek
          </span>
          <p className="text-xs sm:text-sm font-semibold text-slate-800 leading-snug line-clamp-3 break-words">
            {project.nama_proyek || "-"}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <Button
            type="button"
            data-testid="delete-modal-cancel"
            variant="outline"
            onClick={onCancel}
            disabled={isDeleting}
            className="w-full h-10 rounded-lg text-sm font-medium border-slate-200 hover:bg-slate-100 text-slate-700 cursor-pointer"
          >
            Cancel
          </Button>

          <Button
            type="button"
            data-testid="delete-modal-confirm"
            onClick={onConfirm}
            disabled={isDeleting}
            className="w-full h-10 rounded-lg text-sm font-semibold bg-telkom-red hover:bg-red-700 active:bg-red-800 text-white shadow-xs cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isDeleting ? (
              <>
                <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                <span>Deleting...</span>
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4" />
                <span>Delete</span>
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

