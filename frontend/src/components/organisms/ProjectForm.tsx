import * as React from "react";
import { Database } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { UnsavedChangesModal } from "@/components/molecules/UnsavedChangesModal";
import { useNavigationGuard } from "@/context/NavigationGuardContext";
import { useToast } from "@/context/ToastContext";
import { supabase } from "@/lib/supabase";
import { serializeOrdersData, isUrl } from "@/lib/orderParser";
import type { OrdersData } from "@/types/orders";
import type { ProjectPM } from "@/types/project";
import { useProjectSequence } from "@/hooks/useProjectSequence";
import {
  formatProjectIdPm,
  allocateNextProjectCredentials,
} from "@/lib/projectSequence";
import {
  type ProjectFormData,
  mapInitialFormData,
  getPmBySegment,
  ProjectFormBasicInfo,
  ProjectFormContract,
  ProjectFormDelivery,
  ProjectFormBast,
  ProjectFormStatus,
  YearMismatchModal,
} from "@/components/molecules/project-form";

export type { ProjectFormData };

interface ProjectFormProps {
  mode?: "create" | "edit";
  initialData?: ProjectPM | null;
  onCancel: () => void;
  onSuccess: (newProject: ProjectPM) => void;
  existingProjects?: ProjectPM[];
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
    const [isYearMismatchModalOpen, setIsYearMismatchModalOpen] = React.useState(false);
    const [mismatchYears, setMismatchYears] = React.useState<{
      fromYear: number;
      toYear: number;
      syncToDateYear?: boolean;
    } | null>(null);
    const { registerGuard } = useNavigationGuard();
    const { showToast } = useToast();
    const pendingDiscardActionRef = React.useRef<(() => void) | null>(null);

    // Synchronize form state when initialData changes
    React.useEffect(() => {
      setFormData(mapInitialFormData(initialData));
      setErrors({});
      setHasSubmitAttempted(false);
    }, [initialData]);

    const { generatedProjectId, activeProjectSeq, allocateCredentials } = useProjectSequence({
      existingProjects,
      initialData,
      isEditMode,
      tahunKontrak: formData.tahun_kontrak,
      witel: formData.witel,
      segment: formData.segment,
    });

    // Calculate live SLA days preview if dates are entered
    const liveSlaDays = React.useMemo(() => {
      if (!formData.tanggal_request_dr || !formData.tanggal_close_dr) return "";
      const req = new Date(formData.tanggal_request_dr);
      const close = new Date(formData.tanggal_close_dr);
      if (isNaN(req.getTime()) || isNaN(close.getTime())) return "";
      const diff = Math.ceil(Math.abs(close.getTime() - req.getTime()) / (1000 * 60 * 60 * 24));
      return `${diff} Hari`;
    }, [formData.tanggal_request_dr, formData.tanggal_close_dr]);

    // Track if any form field has been modified from base initial state
    const isDirty = React.useMemo(() => {
      if (isSubmitting) return false;
      return (Object.keys(formData) as Array<keyof ProjectFormData>).some((key) => {
        if (key === "orders_data") {
          return JSON.stringify(formData.orders_data || []) !== JSON.stringify(baseInitialData.orders_data || []);
        }
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

    const updateField = <K extends keyof ProjectFormData>(key: K, value: ProjectFormData[K]) => {
      setFormData((prev) => {
        const next = { ...prev, [key]: value };
        // Auto-fill PM based on selected Segment (If DGS: Filipus Tito, else: Achadin)
        if (key === "segment") {
          next.pm = getPmBySegment(value as string);
        }
        // Auto-sync contract year when contract date is entered or changed
        if (key === "tgl_kontrak" && typeof value === "string" && value) {
          const parts = value.split("-");
          const extractedYear = parseInt(parts[0], 10);
          if (!isNaN(extractedYear) && extractedYear > 1900) {
            next.tahun_kontrak = extractedYear;
          }
        }
        // Keep string representations in sync with structured orders_data
        if (key === "orders_data") {
          const serialized = serializeOrdersData(value as OrdersData);
          next.no_order = serialized.no_order;
          next.sid = serialized.sid;
        }
        return next;
      });
      if (errors[key] || (key === "tgl_kontrak" && errors.tahun_kontrak)) {
        setErrors((prev) => {
          const next = { ...prev };
          delete next[key];
          if (key === "tgl_kontrak") {
            delete next.tahun_kontrak;
          }
          return next;
        });
      }
    };

    const setFieldError = React.useCallback((field: string, error: string | null) => {
      setErrors((prev) => {
        if (!error) {
          if (!prev[field]) return prev;
          const next = { ...prev };
          delete next[field];
          return next;
        }
        return { ...prev, [field]: error };
      });
    }, []);

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
    if (!formData.nama_proyek.trim()) errs.nama_proyek = "Nama Project wajib diisi";
    if (!formData.nama_pelanggan.trim()) errs.nama_pelanggan = "Nama Pelanggan wajib diisi";
    if (!formData.nama_mitra.trim()) errs.nama_mitra = "Nama Mitra wajib diisi";
    if (!formData.tahun_kontrak) errs.tahun_kontrak = "Tahun Kontrak wajib diisi";
    if (!formData.status_email_handover) errs.status_email_handover = "Status Email Handover wajib dipilih";
    if (!formData.status_dokumen_obl) errs.status_dokumen_obl = "Status Dokumen OBL wajib dipilih";

    if (formData.orders_data && formData.orders_data.length > 0) {
      formData.orders_data.forEach((ord, oIdx) => {
        const oVal = ord.order_id.trim();
        if (oVal && !isUrl(oVal) && !/^1-\d{11}$/.test(oVal)) {
          errs[`order_${oIdx}`] = "No Order wajib format 1-(11 digit)";
        }
        ord.sids.forEach((s, sIdx) => {
          const sVal = s.sid.trim();
          if (
            sVal &&
            !isUrl(sVal) &&
            !/^1-\d{11}$/.test(sVal) &&
            !/^\d{10}$/.test(sVal)
          ) {
            errs[`sid_${oIdx}_${sIdx}`] = "SID wajib format 1-(11 digit)";
          }
        });
      });
    }
    if (formData.id_digireview.trim() && !/^\d{6}$/.test(formData.id_digireview.trim())) {
      errs.id_digireview = "ID DIGIREVIEW wajib 6 digit";
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const checkYearMismatch = (): {
    fromYear: number;
    toYear: number;
    syncToDateYear?: boolean;
  } | null => {
    const currentFormYear = formData.tahun_kontrak;
    const parts = formData.tgl_kontrak ? formData.tgl_kontrak.split("-") : [];
    const tglYear = parts.length > 0 ? parseInt(parts[0], 10) : null;
    const validTglYear = tglYear && !isNaN(tglYear) && tglYear > 1900 ? tglYear : null;

    // Check 1: In Edit Mode, contract year changed from the original database value
    if (isEditMode && initialData?.tahun_kontrak != null) {
      const origYear = Number(initialData.tahun_kontrak);
      if (currentFormYear && currentFormYear !== origYear) {
        return {
          fromYear: origYear,
          toYear: currentFormYear,
        };
      }
    }

    // Check 2: Discrepancy between contract date year and contract year input
    if (validTglYear && currentFormYear && validTglYear !== currentFormYear) {
      return {
        fromYear: currentFormYear,
        toYear: validTglYear,
        syncToDateYear: true,
      };
    }

    return null;
  };

  const executeSaveProject = async (overrideYear?: number) => {
    setIsSubmitting(true);

    try {
      const finalTahunKontrak = overrideYear ?? formData.tahun_kontrak;
      const serializedOrders = serializeOrdersData(formData.orders_data);

      if (isEditMode && initialData) {
        const finalProjectId = overrideYear
          ? formatProjectIdPm(
              finalTahunKontrak,
              formData.witel,
              formData.segment,
              activeProjectSeq
            )
          : generatedProjectId;

        // Construct sanitized payload for Supabase UPDATE
        const payload: Record<string, unknown> = {
          project_id_pm: finalProjectId,
          tahun_kontrak: finalTahunKontrak,
          witel: formData.witel,
          segment: formData.segment,
          nama_proyek: formData.nama_proyek.trim(),
          nama_pelanggan: formData.nama_pelanggan.trim(),
          nama_mitra: formData.nama_mitra.trim(),
          pm: formData.pm || null,
          idlop: formData.idlop.trim() || null,
          status_email_handover: formData.status_email_handover || null,
          note_email_handover: formData.note_email_handover.trim() || null,
          status_dokumen_obl: formData.status_dokumen_obl || null,
          jenis_kontrak: formData.jenis_kontrak || null,
          nomor_kl_sp_wo_nopes: formData.nomor_kl_sp_wo_nopes.trim() || null,
          tgl_kontrak: formData.tgl_kontrak || null,
          nilai_kontrak_obl: formData.nilai_kontrak_obl,
          quote_number: formData.quote_number.trim() || null,
          no_order: serializedOrders.no_order.trim() || null,
          sid: serializedOrders.sid.trim() || null,
          orders_data: formData.orders_data && formData.orders_data.length > 0 ? formData.orders_data : null,
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
          description: `${formData.nama_proyek || finalProjectId} has been updated.`,
          duration: 5000,
        });

        if (data && data.length > 0) {
          onSuccess(data[0]);
        } else {
          onSuccess({ ...initialData, ...payload });
        }
        return;
      }

      // Allocate next credentials using encapsulated sequence allocator or target year
      const { finalProjectId, nextNomor } = overrideYear
        ? await allocateNextProjectCredentials(
            existingProjects,
            formData.witel,
            formData.segment,
            finalTahunKontrak
          )
        : await allocateCredentials();

      // Construct sanitized payload for Supabase projects table
      // Note: waktu_penyelesaian_bast is generated automatically by PostgreSQL
      const payload: Record<string, unknown> = {
        nomor: nextNomor,
        project_id_pm: finalProjectId,
        tahun_kontrak: finalTahunKontrak,
        witel: formData.witel,
        segment: formData.segment,
        nama_proyek: formData.nama_proyek.trim(),
        nama_pelanggan: formData.nama_pelanggan.trim(),
        nama_mitra: formData.nama_mitra.trim(),
        pm: formData.pm || null,
        idlop: formData.idlop.trim() || null,
        status_email_handover: formData.status_email_handover || null,
        note_email_handover: formData.note_email_handover.trim() || null,
        status_dokumen_obl: formData.status_dokumen_obl || null,
        jenis_kontrak: formData.jenis_kontrak || null,
        nomor_kl_sp_wo_nopes: formData.nomor_kl_sp_wo_nopes.trim() || null,
        tgl_kontrak: formData.tgl_kontrak || null,
        nilai_kontrak_obl: formData.nilai_kontrak_obl,
        quote_number: formData.quote_number.trim() || null,
        no_order: serializedOrders.no_order.trim() || null,
        sid: serializedOrders.sid.trim() || null,
        orders_data: formData.orders_data && formData.orders_data.length > 0 ? formData.orders_data : null,
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
        onSuccess(data[0] as ProjectPM);
      } else {
        onSuccess(payload as ProjectPM);
      }
    } catch (err: unknown) {
      console.error("Unexpected error saving project:", err);
      const errorMsg = err instanceof Error ? err.message : String(err);
      showToast({
        type: "error",
        title: "Unexpected Error",
        description: errorMsg,
        duration: 5000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setHasSubmitAttempted(true);
    if (!validateForm()) {
      return;
    }

    // Check if there is a contract year mismatch between date and input
    const mismatch = checkYearMismatch();
    if (mismatch) {
      setMismatchYears(mismatch);
      setIsYearMismatchModalOpen(true);
      return;
    }

    await executeSaveProject();
  };

  const handleConfirmMismatchModal = async () => {
    if (!mismatchYears) return;
    const targetYear = mismatchYears.toYear;
    setIsYearMismatchModalOpen(false);
    if (mismatchYears.syncToDateYear) {
      setFormData((prev) => ({ ...prev, tahun_kontrak: targetYear }));
    }
    await executeSaveProject(targetYear);
  };

  const handleCancelMismatchModal = () => {
    setIsYearMismatchModalOpen(false);
  };

  return (
    <div className="relative flex flex-col h-full w-full bg-white rounded-md overflow-hidden isolate">
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

      {/* Year Mismatch Confirmation Modal */}
      {mismatchYears && (
        <YearMismatchModal
          isOpen={isYearMismatchModalOpen}
          fromYear={mismatchYears.fromYear}
          toYear={mismatchYears.toYear}
          isSubmitting={isSubmitting}
          onCancel={handleCancelMismatchModal}
          onConfirm={handleConfirmMismatchModal}
        />
      )}

      {/* Sticky Header styled to match Repository Table Header */}
      <div
        className={cn(
          "flex items-center justify-between h-11 px-4 sm:px-6 border-b border-slate-300/80 bg-[#DFE6F0] sticky top-0 z-30 select-none rounded-t-md",
          (isDiscardModalOpen || isYearMismatchModalOpen) && "pointer-events-none"
        )}
      >
        <div className="flex items-center gap-1.5 sm:gap-2">
          <button
            type="button"
            data-testid="btn-header-back"
            onClick={handleAttemptCancel}
            className="inline-flex items-center justify-center h-8 w-8 rounded-md text-telkom-navy border border-transparent transition-all select-none cursor-pointer shrink-0 hover:bg-white hover:border-slate-300/80 hover:text-telkom-navy active:bg-white active:border-slate-300/80 active:text-telkom-navy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-telkom-navy"
            title="Master Repository"
            aria-label="Back to Master Repository"
          >
            <Database className="h-4 w-4 text-telkom-navy" />
          </button>
          <span className="material-symbols-outlined text-[9.5px] text-slate-500 select-none leading-none">
            arrow_forward_ios
          </span>
          <div className="flex items-center gap-1.5 h-8 px-2.5 rounded-md bg-white border border-slate-300/80 text-xs sm:text-sm font-semibold text-telkom-navy shadow-none">
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
          errors={errors}
          setFieldError={setFieldError}
        />

        <ProjectFormBast
          formData={formData}
          updateField={updateField}
          liveSlaDays={liveSlaDays}
          errors={errors}
          setFieldError={setFieldError}
        />

        <ProjectFormStatus
          formData={formData}
          updateField={updateField}
        />

        {/* Footer Form with Cancel & Save Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-6 border-t border-slate-200">
          {/* Mandatory fields alert banner when validation fails */}
          {hasSubmitAttempted && Object.keys(errors).length > 0 ? (
            <div data-testid="form-validation-banner" className="flex items-center text-xs font-semibold text-rose-600 bg-rose-50 border border-rose-200/80 px-3 py-2 rounded-md animate-in fade-in duration-200 mr-auto">
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
              className="h-10 px-5 rounded-md border-slate-200 text-slate-700 hover:bg-slate-100 cursor-pointer font-medium text-sm transition-all"
            >
              Cancel
            </Button>

            <Button
              type="submit"
              data-testid="btn-save-project"
              disabled={isSubmitting || (isEditMode && !isDirty)}
              className="h-10 px-6 rounded-md bg-telkom-navy hover:bg-[#003d82] active:bg-[#002047] text-white shadow-xs cursor-pointer font-semibold text-sm transition-all flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none"
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
