import * as React from "react";
import { Database } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UnsavedChangesModal } from "@/components/molecules/UnsavedChangesModal";
import { useNavigationGuard } from "@/context/NavigationGuardContext";
import { useToast } from "@/context/ToastContext";
import { supabase } from "@/lib/supabase";
import {
  STORAGE_KEY_HIGHEST_SEQ,
  STORAGE_KEY_HIGHEST_NOMOR,
  type ProjectPM,
} from "./columns";
import {
  type ProjectFormData,
  mapInitialFormData,
  ProjectFormBasicInfo,
  ProjectFormContract,
  ProjectFormDelivery,
  ProjectFormBast,
  ProjectFormStatus,
} from "@/components/molecules/project-form";

export type { ProjectFormData };
export { mapInitialFormData };

interface ProjectFormProps {
  mode?: "create" | "edit";
  initialData?: ProjectPM | null;
  onCancel: () => void;
  onSuccess: (newProject: any) => void;
  existingProjects?: any[];
}

export interface ProjectFormHandle {
  attemptCancel: () => void;
}

export const ProjectForm = React.forwardRef<ProjectFormHandle, ProjectFormProps>(
  function ProjectForm(
    { mode = "create", initialData = null, onCancel, onSuccess, existingProjects = [] },
    ref
  ) {
    const isEditMode = mode === "edit" && Boolean(initialData);

    const baseInitialData = React.useMemo(
      () => mapInitialFormData(initialData),
      [initialData]
    );

    const [formData, setFormData] = React.useState<ProjectFormData>(baseInitialData);
    const [errors, setErrors] = React.useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = React.useState(false);
    const [hasSubmitAttempted, setHasSubmitAttempted] = React.useState(false);
    const [isDiscardModalOpen, setIsDiscardModalOpen] = React.useState(false);
    const { registerGuard } = useNavigationGuard();
    const { showToast } = useToast();
    const pendingDiscardActionRef = React.useRef<(() => void) | null>(null);

    // Synchronize form state when initialData changes
    React.useEffect(() => {
      setFormData(mapInitialFormData(initialData));
      setErrors({});
      setHasSubmitAttempted(false);
    }, [initialData]);

    // Compute next sequential project index from existing projects and high-water mark (for Create mode)
    const nextProjectSeq = React.useMemo(() => {
      let max = 0;
      existingProjects.forEach((p) => {
        const match = String(p.project_id_pm || "").match(/(\d+)$/);
        if (match) {
          const n = parseInt(match[1], 10);
          if (!isNaN(n) && n > max) max = n;
        }
      });

      let storedMax = 0;
      try {
        const saved = localStorage.getItem(STORAGE_KEY_HIGHEST_SEQ);
        if (saved) {
          const parsed = parseInt(saved, 10);
          if (!isNaN(parsed) && parsed > storedMax) storedMax = parsed;
        }
      } catch (e) {
        console.error("Failed to read highest sequence from localStorage", e);
      }

      const effectiveMax = Math.max(max, storedMax);
      try {
        if (effectiveMax > storedMax) {
          localStorage.setItem(STORAGE_KEY_HIGHEST_SEQ, String(effectiveMax));
        }
      } catch (e) {
        console.error("Failed to update highest sequence in localStorage", e);
      }

      return String(effectiveMax + 1).padStart(3, "0");
    }, [existingProjects]);

    // In edit mode, retain original sequence number from initialData.project_id_pm
    const activeProjectSeq = React.useMemo(() => {
      if (isEditMode && initialData?.project_id_pm) {
        const match = String(initialData.project_id_pm).match(/(\d+)$/);
        if (match) {
          return match[1];
        }
      }
      return nextProjectSeq;
    }, [isEditMode, initialData, nextProjectSeq]);

    // Reactive dynamic project_id_pm generation
    const generatedProjectId = React.useMemo(() => {
      const y = formData.tahun_kontrak || "YYYY";
      const w = formData.witel || "WITEL";
      const s = formData.segment || "SEGMENT";
      return `${y}-${w}-${s}-${activeProjectSeq}`;
    }, [formData.tahun_kontrak, formData.witel, formData.segment, activeProjectSeq]);

    // Calculate live SLA days preview if dates are entered
    const liveSlaDays = React.useMemo(() => {
      if (!formData.tanggal_request_dr || !formData.tanggal_close_dr) return "-";
      const req = new Date(formData.tanggal_request_dr);
      const close = new Date(formData.tanggal_close_dr);
      if (isNaN(req.getTime()) || isNaN(close.getTime())) return "-";
      const diff = Math.ceil(Math.abs(close.getTime() - req.getTime()) / (1000 * 60 * 60 * 24));
      return `${diff} Hari`;
    }, [formData.tanggal_request_dr, formData.tanggal_close_dr]);

    // Track if any form field has been modified from base initial state
    const isDirty = React.useMemo(() => {
      if (isSubmitting) return false;
      return (Object.keys(formData) as Array<keyof ProjectFormData>).some((key) => {
        const current = formData[key] ?? "";
        const original = baseInitialData[key] ?? "";
        return current !== original;
      });
    }, [formData, baseInitialData, isSubmitting]);

    // Register navigation guard with context whenever form is dirty
    React.useEffect(() => {
      if (!isDirty) return;

      const unregister = registerGuard({
        isDirty: true,
        requestDiscard: (proceed) => {
          pendingDiscardActionRef.current = proceed;
          setIsDiscardModalOpen(true);
        },
      });

      return unregister;
    }, [isDirty, registerGuard]);

    // Warn on browser tab reload/close if there are unsaved changes
    React.useEffect(() => {
      const handleBeforeUnload = (e: BeforeUnloadEvent) => {
        if (isDirty && !isSubmitting) {
          e.preventDefault();
          e.returnValue = "";
        }
      };
      window.addEventListener("beforeunload", handleBeforeUnload);
      return () => window.removeEventListener("beforeunload", handleBeforeUnload);
    }, [isDirty, isSubmitting]);

    const updateField = (key: keyof ProjectFormData, value: any) => {
      setFormData((prev) => ({ ...prev, [key]: value }));
      if (errors[key]) {
        setErrors((prev) => {
          const next = { ...prev };
          delete next[key];
          return next;
        });
      }
    };

    const handleAttemptCancel = () => {
      if (isDirty) {
        pendingDiscardActionRef.current = () => onCancel();
        setIsDiscardModalOpen(true);
      } else {
        onCancel();
      }
    };

    React.useImperativeHandle(ref, () => ({
      attemptCancel: handleAttemptCancel,
    }));

    const validateForm = (): boolean => {
      const errs: Record<string, string> = {};

    if (!formData.segment) errs.segment = "Segmen wajib dipilih";
    if (!formData.witel) errs.witel = "Witel wajib dipilih";
    if (!formData.nama_proyek.trim()) errs.nama_proyek = "Nama Proyek wajib diisi";
    if (!formData.nama_pelanggan.trim()) errs.nama_pelanggan = "Nama Pelanggan wajib diisi";
    if (!formData.nama_mitra.trim()) errs.nama_mitra = "Nama Mitra wajib diisi";
    if (!formData.tahun_kontrak) errs.tahun_kontrak = "Tahun Proyek wajib diisi";
    if (!formData.status_email_handover) errs.status_email_handover = "Status Email Handover wajib dipilih";
    if (!formData.status_dokumen_obl) errs.status_dokumen_obl = "Status Dokumen OBL wajib dipilih";

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setHasSubmitAttempted(true);
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      if (isEditMode && initialData) {
        // Construct sanitized payload for Supabase UPDATE
        const payload: Record<string, any> = {
          project_id_pm: generatedProjectId,
          tahun_kontrak: formData.tahun_kontrak,
          witel: formData.witel,
          segment: formData.segment,
          nama_proyek: formData.nama_proyek.trim(),
          nama_pelanggan: formData.nama_pelanggan.trim(),
          nama_mitra: formData.nama_mitra.trim(),
          pm: formData.pm || null,
          idlop: formData.idlop.trim() || null,
          status_email_handover: formData.status_email_handover === "OK",
          note_email_handover: formData.note_email_handover.trim() || null,
          status_dokumen_obl: formData.status_dokumen_obl || null,
          jenis_kontrak: formData.jenis_kontrak || null,
          nomor_kl_sp_wo_nopes: formData.nomor_kl_sp_wo_nopes.trim() || null,
          tgl_kontrak: formData.tgl_kontrak || null,
          nilai_kontrak_obl: formData.nilai_kontrak_obl,
          quote_number: formData.quote_number.trim() || null,
          no_order: formData.no_order.trim() || null,
          sid: formData.sid.trim() || null,
          jenis_layanan: formData.jenis_layanan.trim() || null,
          status_delivery_project: formData.status_delivery_project || null,
          jenis_dok_delivery: formData.jenis_dok_delivery.trim() || null,
          status_dokumen_delivery: formData.status_dokumen_delivery || null,
          id_digireview: formData.id_digireview.trim() || null,
          no_bast_telkom: formData.no_bast_telkom.trim() || null,
          tanggal_request_dr: formData.tanggal_request_dr || null,
          tanggal_close_dr: formData.tanggal_close_dr || null,
          hardfile_bast: formData.hardfile_bast || null,
          tanggal_bast: formData.tanggal_bast || null,
          tahun_bast: formData.tahun_bast || null,
          status_order: formData.status_order || null,
          status_gr: formData.status_gr.trim() || null,
          bulan_bc: formData.bulan_bc || null,
          komitmen_bc: formData.komitmen_bc || null,
          ket_update: formData.ket_update.trim() || null,
          file_bast: formData.file_bast.trim() || null,
          file_bapl: formData.file_bapl.trim() || null,
          updated_at: new Date().toISOString(),
        };

        let query = supabase.from("projects").update(payload);
        if (initialData.id) {
          query = query.eq("id", initialData.id);
        } else if (initialData.nomor) {
          query = query.eq("nomor", initialData.nomor);
        } else {
          query = query.eq("project_id_pm", initialData.project_id_pm);
        }

        const { data, error } = await query.select();

        if (error) {
          console.error("Failed to update project in Supabase:", error);
          showToast({
            type: "error",
            title: "Failed to Update Project",
            description: error.message || "Failed to update record in database.",
            duration: 5000,
          });
          return;
        }

        showToast({
          type: "success",
          title: "Project Successfully Updated",
          description: `${formData.nama_proyek || generatedProjectId} has been updated.`,
          duration: 5000,
        });

        if (data && data.length > 0) {
          onSuccess(data[0]);
        } else {
          onSuccess({ ...initialData, ...payload });
        }
        return;
      }

      // Query highest project sequence from existing data, DB, and high-water mark
      let maxProjectSeq = 0;
      existingProjects.forEach((p) => {
        const match = String(p.project_id_pm || "").match(/(\d+)$/);
        if (match) {
          const n = parseInt(match[1], 10);
          if (!isNaN(n) && n > maxProjectSeq) maxProjectSeq = n;
        }
      });

      try {
        const { data: latestProjects } = await supabase
          .from("projects")
          .select("project_id_pm")
          .order("created_at", { ascending: false })
          .limit(30);

        if (latestProjects) {
          latestProjects.forEach((p) => {
            const match = String(p.project_id_pm || "").match(/(\d+)$/);
            if (match) {
              const n = parseInt(match[1], 10);
              if (!isNaN(n) && n > maxProjectSeq) maxProjectSeq = n;
            }
          });
        }
      } catch (seqErr) {
        console.warn("Could not query latest project sequence, using local maximum", seqErr);
      }

      try {
        const savedSeq = localStorage.getItem(STORAGE_KEY_HIGHEST_SEQ);
        if (savedSeq) {
          const parsed = parseInt(savedSeq, 10);
          if (!isNaN(parsed) && parsed > maxProjectSeq) maxProjectSeq = parsed;
        }
      } catch (e) {
        console.error("Failed to read highest sequence from localStorage", e);
      }

      const finalSeqNum = maxProjectSeq + 1;
      const finalSeqStr = String(finalSeqNum).padStart(3, "0");
      try {
        localStorage.setItem(STORAGE_KEY_HIGHEST_SEQ, String(finalSeqNum));
      } catch (e) {
        console.error("Failed to update highest sequence in localStorage", e);
      }

      const finalProjectId = `${formData.tahun_kontrak || "YYYY"}-${formData.witel || "WITEL"}-${formData.segment || "SEGMENT"}-${finalSeqStr}`;

      // Determine next sequential nomor (strictly monotonic forward)
      let maxNomor = 0;
      existingProjects.forEach((p) => {
        const n = typeof p.nomor === "number" ? p.nomor : parseInt(String(p.nomor), 10);
        if (!isNaN(n) && n > maxNomor) maxNomor = n;
      });

      try {
        const savedNomor = localStorage.getItem(STORAGE_KEY_HIGHEST_NOMOR);
        if (savedNomor) {
          const parsed = parseInt(savedNomor, 10);
          if (!isNaN(parsed) && parsed > maxNomor) maxNomor = parsed;
        }
      } catch (e) {
        console.error("Failed to read highest nomor from localStorage", e);
      }

      const nextNomor = maxNomor + 1;
      try {
        localStorage.setItem(STORAGE_KEY_HIGHEST_NOMOR, String(nextNomor));
      } catch (e) {
        console.error("Failed to update highest nomor in localStorage", e);
      }

      // Construct sanitized payload for Supabase projects table
      // Note: waktu_penyelesaian_bast is generated automatically by PostgreSQL
      const payload: Record<string, any> = {
        nomor: nextNomor,
        project_id_pm: finalProjectId,
        tahun_kontrak: formData.tahun_kontrak,
        witel: formData.witel,
        segment: formData.segment,
        nama_proyek: formData.nama_proyek.trim(),
        nama_pelanggan: formData.nama_pelanggan.trim(),
        nama_mitra: formData.nama_mitra.trim(),
        pm: formData.pm || null,
        idlop: formData.idlop.trim() || null,
        status_email_handover: formData.status_email_handover === "OK",
        note_email_handover: formData.note_email_handover.trim() || null,
        status_dokumen_obl: formData.status_dokumen_obl || null,
        jenis_kontrak: formData.jenis_kontrak || null,
        nomor_kl_sp_wo_nopes: formData.nomor_kl_sp_wo_nopes.trim() || null,
        tgl_kontrak: formData.tgl_kontrak || null,
        nilai_kontrak_obl: formData.nilai_kontrak_obl,
        quote_number: formData.quote_number.trim() || null,
        no_order: formData.no_order.trim() || null,
        sid: formData.sid.trim() || null,
        jenis_layanan: formData.jenis_layanan.trim() || null,
        status_delivery_project: formData.status_delivery_project || null,
        jenis_dok_delivery: formData.jenis_dok_delivery.trim() || null,
        status_dokumen_delivery: formData.status_dokumen_delivery || null,
        id_digireview: formData.id_digireview.trim() || null,
        no_bast_telkom: formData.no_bast_telkom.trim() || null,
        tanggal_request_dr: formData.tanggal_request_dr || null,
        tanggal_close_dr: formData.tanggal_close_dr || null,
        hardfile_bast: formData.hardfile_bast || null,
        tanggal_bast: formData.tanggal_bast || null,
        tahun_bast: formData.tahun_bast || null,
        status_order: formData.status_order || null,
        status_gr: formData.status_gr.trim() || null,
        bulan_bc: formData.bulan_bc || null,
        komitmen_bc: formData.komitmen_bc || null,
        ket_update: formData.ket_update.trim() || null,
        file_bast: formData.file_bast.trim() || null,
        file_bapl: formData.file_bapl.trim() || null,
      };

      const { data, error } = await supabase.from("projects").insert([payload]).select();

      if (error) {
        console.error("Failed to insert project into Supabase:", error);
        showToast({
          type: "error",
          title: "Failed to Save Project",
          description: error.message || "Failed to insert record into database.",
          duration: 5000,
        });
        return;
      }

      showToast({
        type: "success",
        title: "Project Successfully Added",
        description: `${formData.nama_proyek || finalProjectId} has been added to repository.`,
        duration: 5000,
      });

      if (data && data.length > 0) {
        onSuccess(data[0]);
      } else {
        onSuccess(payload);
      }
    } catch (err: any) {
      console.error("Unexpected error saving project:", err);
      showToast({
        type: "error",
        title: "Unexpected Error",
        description: err.message || String(err),
        duration: 5000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative flex flex-col h-full w-full bg-white rounded-lg overflow-hidden isolate">
      {/* Centered In-Container Discard Confirmation Modal */}
      <UnsavedChangesModal
        isOpen={isDiscardModalOpen}
        onCancel={() => {
          setIsDiscardModalOpen(false);
          pendingDiscardActionRef.current = null;
        }}
        onDiscard={() => {
          setIsDiscardModalOpen(false);
          const action = pendingDiscardActionRef.current;
          pendingDiscardActionRef.current = null;
          if (action) {
            action();
          } else {
            onCancel();
          }
        }}
      />

      {/* Sticky Header with Breadcrumbs mirroring Navbar style */}
      <div className="flex items-center justify-between h-14 px-6 border-b border-slate-200 bg-slate-100 sticky top-0 z-20 select-none rounded-t-lg">
        <div className="flex items-center gap-1.5 sm:gap-2">
          <button
            type="button"
            data-testid="btn-header-back"
            onClick={handleAttemptCancel}
            className="inline-flex items-center justify-center h-8 w-8 rounded-md text-slate-600 border border-transparent transition-all select-none cursor-pointer shrink-0 hover:text-slate-900 hover:bg-white hover:border-slate-200/80 active:bg-slate-100/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-telkom-navy"
            title="Master Repository"
            aria-label="Back to Master Repository"
          >
            <Database className="h-4 w-4 text-slate-600 hover:text-telkom-navy" />
          </button>
          <span className="material-symbols-outlined text-[9.5px] text-slate-400 select-none leading-none">
            arrow_forward_ios
          </span>
          <div className="flex items-center gap-1.5 h-8 px-2.5 rounded-md bg-white border border-slate-200/80 text-xs sm:text-sm font-semibold text-telkom-navy">
            {isEditMode ? (
              <>
                <span className="material-symbols-outlined text-[16px] text-telkom-navy leading-none select-none">
                  edit_square
                </span>
                <span>Edit Project</span>
              </>
            ) : (
              <span>+ Add Project</span>
            )}
          </div>
        </div>
      </div>

      {/* Scrollable Form Content */}
      <form
        data-testid="project-form"
        onSubmit={handleSubmit}
        className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8 hide-scrollbar"
      >
        {/* Atomic Form Sections */}
        <ProjectFormBasicInfo
          formData={formData}
          updateField={updateField}
          errors={errors}
          generatedProjectId={generatedProjectId}
        />

        <ProjectFormContract
          formData={formData}
          updateField={updateField}
          errors={errors}
        />

        <ProjectFormDelivery
          formData={formData}
          updateField={updateField}
        />

        <ProjectFormBast
          formData={formData}
          updateField={updateField}
          liveSlaDays={liveSlaDays}
        />

        <ProjectFormStatus
          formData={formData}
          updateField={updateField}
        />

        {/* Footer Form with Cancel & Save Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-6 border-t border-slate-200">
          {/* Mandatory fields alert banner when validation fails */}
          {hasSubmitAttempted && Object.keys(errors).length > 0 ? (
            <div data-testid="form-validation-banner" className="flex items-center text-xs font-semibold text-rose-600 bg-rose-50 border border-rose-200/80 px-3 py-2 rounded-lg animate-in fade-in duration-200 mr-auto">
              <span>Kolom bertanda (*) wajib diisi</span>
            </div>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-3 ml-auto">
            <Button
              type="button"
              data-testid="btn-cancel-project"
              variant="outline"
              onClick={handleAttemptCancel}
              disabled={isSubmitting}
              className="h-10 px-5 rounded-lg border-slate-200 text-slate-700 hover:bg-slate-100 cursor-pointer font-medium text-sm transition-all"
            >
              Cancel
            </Button>

            <Button
              type="submit"
              data-testid="btn-save-project"
              disabled={isSubmitting || (isEditMode && !isDirty)}
              className="h-10 px-6 rounded-lg bg-telkom-navy hover:bg-[#003d82] active:bg-[#002047] text-white shadow-xs cursor-pointer font-semibold text-sm transition-all flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none"
            >
              {isSubmitting ? (
                <>
                  <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  <span>{isEditMode ? "Saving Changes..." : "Saving..."}</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[18px] leading-none select-none">
                    save
                  </span>
                  <span>{isEditMode ? "Save Changes" : "Save Project"}</span>
                </>
              )}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
});
