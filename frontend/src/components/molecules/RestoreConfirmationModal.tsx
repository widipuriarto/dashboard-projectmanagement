import * as React from "react";
import { Button } from "@/components/ui/button";
import type { ProjectPM } from "@/types/project";

interface RestoreConfirmationModalProps {
  isOpen: boolean;
  project: ProjectPM | null;
  isRestoring?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export function RestoreConfirmationModal({
  isOpen,
  project,
  isRestoring = false,
  onCancel,
  onConfirm,
}: RestoreConfirmationModalProps) {
  React.useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isRestoring) {
        onCancel();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isRestoring, onCancel]);

  if (!isOpen || !project) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="restore-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-[2px] p-4 animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isRestoring) {
          onCancel();
        }
      }}
    >
      <div
        data-testid="restore-confirmation-modal"
        className="relative rounded-md border-none bg-white p-6 shadow-2xl max-w-md w-full space-y-5 animate-in zoom-in-95 duration-200 select-none"
      >
        {/* Restore Icon Badge */}
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 shadow-2xs">
          <span className="material-symbols-outlined text-[24px] leading-none select-none">
            undo
          </span>
        </div>

        {/* Modal Text Content */}
        <div className="space-y-2 text-center">
          <h3
            id="restore-modal-title"
            className="text-lg font-bold text-slate-800 tracking-tight"
          >
            Restore Project?
          </h3>
          <p className="text-sm text-slate-600 leading-relaxed px-2">
            Are you sure you want to restore{" "}
            <span className="font-bold font-mono text-telkom-navy break-all">
              {project.project_id_pm}
            </span>
            ? This project will be returned to the active Master Repository.
          </p>
        </div>

        {/* Project Name Framed Container */}
        <div className="rounded-md bg-slate-50/80 p-3.5 text-center shadow-2xs">
          <span className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1 select-none">
            Nama Project
          </span>
          <p className="text-xs sm:text-sm font-semibold text-slate-800 leading-snug line-clamp-3 break-words">
            {project.nama_proyek || "-"}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <Button
            type="button"
            data-testid="restore-modal-cancel"
            variant="outline"
            onClick={onCancel}
            disabled={isRestoring}
            className="w-full h-10 rounded-md text-sm font-medium border border-transparent bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
          >
            Cancel
          </Button>

          <Button
            type="button"
            data-testid="restore-modal-confirm"
            onClick={onConfirm}
            disabled={isRestoring}
            className="w-full h-10 rounded-md text-sm font-semibold bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white shadow-xs cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isRestoring ? (
              <>
                <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                <span>Restoring...</span>
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-[18px] leading-none select-none">
                  undo
                </span>
                <span>Restore</span>
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

