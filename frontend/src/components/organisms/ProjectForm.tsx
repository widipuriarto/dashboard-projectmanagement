import * as React from "react";
import { Database } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormSection } from "@/components/molecules/FormSection";
import { FormField } from "@/components/molecules/FormField";
import { CurrencyInput } from "@/components/atoms/CurrencyInput";
import { MonthYearPicker } from "@/components/molecules/MonthYearPicker";
import { CustomSelect } from "@/components/molecules/CustomSelect";
import { DatePicker } from "@/components/molecules/DatePicker";
import { UnsavedChangesModal } from "@/components/molecules/UnsavedChangesModal";
import { useNavigationGuard } from "@/context/NavigationGuardContext";
import { useToast } from "@/context/ToastContext";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";

interface ProjectFormProps {
  onCancel: () => void;
  onSuccess: (newProject: any) => void;
  existingProjects?: any[];
}

export interface ProjectFormData {
  project_id_pm: string;
  tahun_kontrak: number | null;
  witel: string;
  segment: string;
  nama_proyek: string;
  nama_pelanggan: string;
  nama_mitra: string;
  pm: string;
  idlop: string;
  status_email_handover: string;
  status_dokumen_obl: string;
  jenis_kontrak: string;
  nomor_kl_sp_wo_nopes: string;
  tgl_kontrak: string;
  nilai_kontrak_obl: number | null;
  quote_number: string;
  note_email_handover: string;
  no_order: string;
  sid: string;
  jenis_layanan: string;
  status_delivery_project: string;
  jenis_dok_delivery: string;
  status_dokumen_delivery: string;
  id_digireview: string;
  no_bast_telkom: string;
  tanggal_request_dr: string;
  tanggal_close_dr: string;
  hardfile_bast: string;
  tanggal_bast: string;
  tahun_bast: number | null;
  status_order: string;
  status_gr: string;
  bulan_bc: string | null;
  komitmen_bc: string | null;
  ket_update: string;
  file_bast: string;
  file_bapl: string;
}

const INITIAL_FORM_DATA: ProjectFormData = {
  project_id_pm: "",
  tahun_kontrak: null,
  witel: "",
  segment: "",
  nama_proyek: "",
  nama_pelanggan: "",
  nama_mitra: "",
  pm: "",
  idlop: "",
  status_email_handover: "",
  status_dokumen_obl: "",
  jenis_kontrak: "",
  nomor_kl_sp_wo_nopes: "",
  tgl_kontrak: "",
  nilai_kontrak_obl: null,
  quote_number: "",
  note_email_handover: "",
  no_order: "",
  sid: "",
  jenis_layanan: "",
  status_delivery_project: "",
  jenis_dok_delivery: "",
  status_dokumen_delivery: "",
  id_digireview: "",
  no_bast_telkom: "",
  tanggal_request_dr: "",
  tanggal_close_dr: "",
  hardfile_bast: "",
  tanggal_bast: "",
  tahun_bast: null,
  status_order: "",
  status_gr: "",
  bulan_bc: null,
  komitmen_bc: null,
  ket_update: "",
  file_bast: "",
  file_bapl: "",
};

const WITEL_OPTIONS = ["SJU", "YJS", "SJT"];
const SEGMENT_OPTIONS = ["SME", "DBS", "DGS", "DES", "DPS", "DSS"];
const PM_OPTIONS = ["Hagia", "Anggi", "Adin", "Tito"];
const JENIS_KONTRAK_OPTIONS = ["KL", "SP", "WO", "NOPES", "SA", "KL Amandemen", "NOPES Amandemen"];
const STATUS_OBL_OPTIONS = ["NOPES/KL OK", "OBL Dalam Proses", "OBL Non DR", "P8 OK", "Drafting"];
const STATUS_DELIVERY_OPTIONS = ["Delivered", "Dalam Proses Delivery", "Belum Terlaksana"];
const STATUS_DOK_DELIVERY_OPTIONS = ["01 Closed", "02 Sirkulir TTD", "03 DR/Drafting", "04 Evidence", "05 Delivery NOK", "06 Non DR"];
const HARDFILE_BAST_OPTIONS = ["ADA", "TIDAK ADA", "PROSES", "NON DR", "BAST WITEL"];
const STATUS_ORDER_OPTIONS = ["00 BC", "01 Pending BASO", "02 Closing PJM (BIMA)"];

export interface ProjectFormHandle {
  attemptCancel: () => void;
}

export const ProjectForm = React.forwardRef<ProjectFormHandle, ProjectFormProps>(
  function ProjectForm(
    { onCancel, onSuccess, existingProjects = [] },
    ref
  ) {
    const [formData, setFormData] = React.useState<ProjectFormData>(INITIAL_FORM_DATA);
    const [errors, setErrors] = React.useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = React.useState(false);
    const [hasSubmitAttempted, setHasSubmitAttempted] = React.useState(false);
    const [isDiscardModalOpen, setIsDiscardModalOpen] = React.useState(false);
    const { registerGuard } = useNavigationGuard();
    const { showToast } = useToast();
    const pendingDiscardActionRef = React.useRef<(() => void) | null>(null);

    // Compute next sequential project index from existing projects
    const nextProjectSeq = React.useMemo(() => {
      let max = 0;
      existingProjects.forEach((p) => {
        const match = String(p.project_id_pm || "").match(/(\d+)$/);
        if (match) {
          const n = parseInt(match[1], 10);
          if (!isNaN(n) && n > max) max = n;
        }
      });
      return String(max + 1).padStart(3, "0");
    }, [existingProjects]);

    // Reactive dynamic project_id_pm generation
    const generatedProjectId = React.useMemo(() => {
      const y = formData.tahun_kontrak || "YYYY";
      const w = formData.witel || "WITEL";
      const s = formData.segment || "SEGMENT";
      return `${y}-${w}-${s}-${nextProjectSeq}`;
    }, [formData.tahun_kontrak, formData.witel, formData.segment, nextProjectSeq]);

    // Calculate live SLA days preview if dates are entered
    const liveSlaDays = React.useMemo(() => {
      if (!formData.tanggal_request_dr || !formData.tanggal_close_dr) return "-";
      const req = new Date(formData.tanggal_request_dr);
      const close = new Date(formData.tanggal_close_dr);
      if (isNaN(req.getTime()) || isNaN(close.getTime())) return "-";
      const diff = Math.ceil(Math.abs(close.getTime() - req.getTime()) / (1000 * 60 * 60 * 24));
      return `${diff} Hari`;
    }, [formData.tanggal_request_dr, formData.tanggal_close_dr]);

    // Track if any form field has been modified from initial state
    const isDirty = React.useMemo(() => {
      if (isSubmitting) return false;
      return (Object.keys(formData) as Array<keyof ProjectFormData>).some((key) => {
        return formData[key] !== INITIAL_FORM_DATA[key];
      });
    }, [formData, isSubmitting]);

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
      // Query highest project sequence from existing data & DB to avoid race conditions
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
      const finalSeqStr = String(maxProjectSeq + 1).padStart(3, "0");
      const finalProjectId = `${formData.tahun_kontrak || "YYYY"}-${formData.witel || "WITEL"}-${formData.segment || "SEGMENT"}-${finalSeqStr}`;

      // Determine next sequential nomor (total row count in database)
      let nextNomor = existingProjects.length + 1;
      try {
        const { count, error: countErr } = await supabase
          .from("projects")
          .select("*", { count: "exact", head: true });
        if (!countErr && typeof count === "number") {
          nextNomor = count + 1;
        }
      } catch (countErr) {
        console.warn("Could not query exact row count, using fallback", countErr);
        let maxNomor = 0;
        existingProjects.forEach((p) => {
          const n = typeof p.nomor === "number" ? p.nomor : parseInt(String(p.nomor), 10);
          if (!isNaN(n) && n > maxNomor) maxNomor = n;
        });
        nextNomor = maxNomor + 1;
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
      <div className="flex items-center justify-between h-14 px-6 border-b border-slate-200 bg-slate-100 sticky top-0 z-20 select-none rounded-t-lg shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
        <div className="flex items-center gap-1.5 sm:gap-2">
          <button
            type="button"
            onClick={handleAttemptCancel}
            className="inline-flex items-center justify-center h-8 w-8 rounded-md text-slate-600 border border-transparent transition-all select-none cursor-pointer shrink-0 hover:text-slate-900 hover:bg-white hover:border-slate-200/80 hover:shadow-2xs active:bg-slate-100/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-telkom-navy"
            title="Master Repository"
            aria-label="Back to Master Repository"
          >
            <Database className="h-4 w-4 text-slate-600 hover:text-telkom-navy" />
          </button>
          <span className="material-symbols-outlined text-[9.5px] text-slate-400 select-none leading-none">
            arrow_forward_ios
          </span>
          <div className="flex items-center gap-1.5 h-8 px-2.5 rounded-md bg-white border border-slate-200/80 text-xs sm:text-sm font-semibold text-telkom-navy shadow-2xs">
            <span>+ Add Project</span>
          </div>
        </div>
      </div>

      {/* Scrollable Form Content */}
      <form
        onSubmit={handleSubmit}
        className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8 hide-scrollbar"
      >
        {/* SEKSI 1: IDENTITAS & INISIASI PROYEK */}
        <FormSection
          title="1. Identitas & Inisiasi Proyek"
          description="Informasi utama dan deskripsi project"
        >
          {/* Row 1: ID PROJECT PM (Readonly preview with lock icon) & Tahun Project */}
          <FormField label="ID PROJECT PM" lockIcon>
            <Input
              type="text"
              readOnly
              value={generatedProjectId}
              className="bg-slate-50 text-slate-700 font-mono font-medium cursor-not-allowed border-slate-200 select-all"
            />
          </FormField>

          <FormField label="Tahun Project" required error={errors.tahun_kontrak}>
            <Input
              type="number"
              placeholder="Contoh: 2027"
              value={formData.tahun_kontrak ?? ""}
              onChange={(e) => updateField("tahun_kontrak", e.target.value ? parseInt(e.target.value, 10) : null)}
              className="border-slate-200 focus:border-telkom-navy"
            />
          </FormField>

          {/* Row 2: Witel & Segmen */}
          <FormField label="Witel" required error={errors.witel}>
            <CustomSelect
              value={formData.witel}
              onChange={(val) => updateField("witel", val)}
              options={WITEL_OPTIONS}
              placeholder="Pilih Witel..."
              error={errors.witel}
            />
          </FormField>

          <FormField label="Segmen" required error={errors.segment}>
            <CustomSelect
              value={formData.segment}
              onChange={(val) => updateField("segment", val)}
              options={SEGMENT_OPTIONS}
              placeholder="Pilih Segmen..."
              error={errors.segment}
            />
          </FormField>

          {/* Row 3: Nama Proyek (Col-span-2) */}
          <FormField label="Nama Project" required colSpan={2} error={errors.nama_proyek}>
            <Input
              type="text"
              placeholder="Masukkan nama project lengkap..."
              value={formData.nama_proyek}
              onChange={(e) => updateField("nama_proyek", e.target.value)}
              className="border-slate-200 focus:border-telkom-navy"
            />
          </FormField>

          {/* Row 4: Pelanggan & Mitra */}
          <FormField label="Nama Pelanggan" required error={errors.nama_pelanggan}>
            <Input
              type="text"
              placeholder="Masukkan nama pelanggan..."
              value={formData.nama_pelanggan}
              onChange={(e) => updateField("nama_pelanggan", e.target.value)}
              className="border-slate-200 focus:border-telkom-navy"
            />
          </FormField>

          <FormField label="Nama Mitra" required error={errors.nama_mitra}>
            <Input
              type="text"
              placeholder="Masukkan nama mitra..."
              value={formData.nama_mitra}
              onChange={(e) => updateField("nama_mitra", e.target.value)}
              className="border-slate-200 focus:border-telkom-navy"
            />
          </FormField>

          {/* Row 5: PM & IDLOP */}
          <FormField label="PM">
            <CustomSelect
              value={formData.pm}
              onChange={(val) => updateField("pm", val)}
              options={PM_OPTIONS}
              placeholder="Pilih PM..."
            />
          </FormField>

          <FormField label="IDLOP">
            <Input
              type="text"
              placeholder="Contoh: LOP-401428-1694593421915"
              value={formData.idlop}
              onChange={(e) => updateField("idlop", e.target.value)}
              className="border-slate-200 focus:border-telkom-navy"
            />
          </FormField>
        </FormSection>

        {/* SEKSI 2: KONTRAK & STATUS DOKUMEN OBL */}
        <FormSection
          title="2. Kontrak & Status Dokumen OBL"
          description="Status legalitas berkas OBL dan serah terima administrasi"
        >
          {/* Mandatory OBL Fields */}
          <FormField label="Status Email Handover" required error={errors.status_email_handover}>
            <CustomSelect
              value={formData.status_email_handover}
              onChange={(val) => updateField("status_email_handover", val)}
              options={["OK", "NOK"]}
              placeholder="Pilih Status..."
              error={errors.status_email_handover}
            />
          </FormField>

          <FormField label="Status Dokumen OBL" required error={errors.status_dokumen_obl}>
            <CustomSelect
              value={formData.status_dokumen_obl}
              onChange={(val) => updateField("status_dokumen_obl", val)}
              options={STATUS_OBL_OPTIONS}
              placeholder="Pilih Status Dok OBL..."
              error={errors.status_dokumen_obl}
            />
          </FormField>

          <FormField label="Jenis Kontrak">
            <CustomSelect
              value={formData.jenis_kontrak}
              onChange={(val) => updateField("jenis_kontrak", val)}
              options={JENIS_KONTRAK_OPTIONS}
              placeholder="Pilih Jenis Kontrak..."
            />
          </FormField>

          <FormField label="Nomor KL / SP / WO / NOPES">
            <Input
              type="text"
              placeholder="Contoh: TEL.4720/LG.270/DR4-1D000000/2023"
              value={formData.nomor_kl_sp_wo_nopes}
              onChange={(e) => updateField("nomor_kl_sp_wo_nopes", e.target.value)}
              className="border-slate-200 focus:border-telkom-navy"
            />
          </FormField>

          <FormField label="Tanggal Kontrak">
            <DatePicker
              value={formData.tgl_kontrak}
              onChange={(val) => updateField("tgl_kontrak", val)}
              placeholder="Pilih Tanggal Kontrak..."
            />
          </FormField>

          <FormField label="Nilai Kontrak OBL">
            <CurrencyInput
              placeholder="0"
              value={formData.nilai_kontrak_obl}
              onChange={(val) => updateField("nilai_kontrak_obl", val)}
            />
          </FormField>

          <FormField label="Quote Number">
            <Input
              type="text"
              placeholder="Contoh: 1-37841806771"
              value={formData.quote_number}
              onChange={(e) => updateField("quote_number", e.target.value)}
              className="border-slate-200 focus:border-telkom-navy"
            />
          </FormField>

          <FormField label="Note Email Handover">
            <Input
              type="text"
              placeholder="Catatan tambahan email by..."
              value={formData.note_email_handover}
              onChange={(e) => updateField("note_email_handover", e.target.value)}
              className="border-slate-200 focus:border-telkom-navy"
            />
          </FormField>
        </FormSection>

        {/* SEKSI 3: LAYANAN & DELIVERY PROYEK */}
        <FormSection
          title="3. Layanan & Delivery Proyek"
          description="Identifikasi order teknis, SID, dan progres status delivery"
        >
          <FormField label="No Order">
            <Input
              type="text"
              placeholder="Contoh: 1-39653888125"
              value={formData.no_order}
              onChange={(e) => updateField("no_order", e.target.value)}
              className="border-slate-200 focus:border-telkom-navy"
            />
          </FormField>

          <FormField label="SID">
            <Input
              type="text"
              placeholder="Contoh: 1794503720"
              value={formData.sid}
              onChange={(e) => updateField("sid", e.target.value)}
              className="border-slate-200 focus:border-telkom-navy"
            />
          </FormField>

          <FormField label="Jenis Layanan">
            <Input
              type="text"
              placeholder="Jenis layanan..."
              value={formData.jenis_layanan}
              onChange={(e) => updateField("jenis_layanan", e.target.value)}
              className="border-slate-200 focus:border-telkom-navy"
            />
          </FormField>

          <FormField label="Status Delivery Project">
            <CustomSelect
              value={formData.status_delivery_project}
              onChange={(val) => updateField("status_delivery_project", val)}
              options={STATUS_DELIVERY_OPTIONS}
              placeholder="Pilih Status Delivery Project..."
            />
          </FormField>

          <FormField label="Jenis Dok Delivery">
            <Input
              type="text"
              placeholder="Jenis dokumen delivery..."
              value={formData.jenis_dok_delivery}
              onChange={(e) => updateField("jenis_dok_delivery", e.target.value)}
              className="border-slate-200 focus:border-telkom-navy"
            />
          </FormField>

          <FormField label="Status Dokumen Delivery">
            <CustomSelect
              value={formData.status_dokumen_delivery}
              onChange={(val) => updateField("status_dokumen_delivery", val)}
              options={STATUS_DOK_DELIVERY_OPTIONS}
              placeholder="Pilih Status Dokumen Delivery..."
            />
          </FormField>
        </FormSection>

        {/* SEKSI 4: DIGIREVIEW & BAST */}
        <FormSection
          title="4. Digireview & BAST"
          description="Data peninjauan digital, berita acara serah terima, dan SLA BAST"
        >
          <FormField label="ID Digireview">
            <Input
              type="text"
              placeholder="Nomor ID Digireview..."
              value={formData.id_digireview}
              onChange={(e) => updateField("id_digireview", e.target.value)}
              className="border-slate-200 focus:border-telkom-navy"
            />
          </FormField>

          <FormField label="No BAST Telkom">
            <Input
              type="text"
              placeholder="Contoh: Tel.7165/LG320/DR4-1D100000/2023"
              value={formData.no_bast_telkom}
              onChange={(e) => updateField("no_bast_telkom", e.target.value)}
              className="border-slate-200 focus:border-telkom-navy"
            />
          </FormField>

          <FormField label="Tanggal Request DR">
            <DatePicker
              value={formData.tanggal_request_dr}
              onChange={(val) => updateField("tanggal_request_dr", val)}
              placeholder="Pilih Tanggal Request..."
            />
          </FormField>

          <FormField label="Tanggal Close DR">
            <DatePicker
              value={formData.tanggal_close_dr}
              onChange={(val) => updateField("tanggal_close_dr", val)}
              placeholder="Pilih Tanggal Close..."
            />
          </FormField>

          {/* Waktu Penyelesaian BAST with Lock Icon (Auto Calculated) */}
          <FormField label="Waktu Penyelesaian BAST" lockIcon>
            <Input
              type="text"
              readOnly
              value={liveSlaDays}
              className="bg-slate-50 text-slate-700 font-medium cursor-not-allowed border-slate-200"
            />
          </FormField>

          <FormField label="Hardfile BAST">
            <CustomSelect
              value={formData.hardfile_bast}
              onChange={(val) => updateField("hardfile_bast", val)}
              options={HARDFILE_BAST_OPTIONS}
              placeholder="Pilih Status Hardfile BAST..."
            />
          </FormField>

          <FormField label="Tanggal BAST">
            <DatePicker
              value={formData.tanggal_bast}
              onChange={(val) => updateField("tanggal_bast", val)}
              placeholder="Pilih Tanggal BAST..."
            />
          </FormField>

          <FormField label="Tahun BAST">
            <Input
              type="number"
              placeholder="Contoh: 2027"
              value={formData.tahun_bast ?? ""}
              onChange={(e) => updateField("tahun_bast", e.target.value ? parseInt(e.target.value, 10) : null)}
              className="border-slate-200 focus:border-telkom-navy"
            />
          </FormField>
        </FormSection>

        {/* SEKSI 5: BILLING COMPLETION & REPOSITORI BERKAS */}
        <FormSection
          title="5. Billing Completion & Repositori Berkas"
          description="Penyelesaian tagihan (BC), update status, dan tautan dokumen Microsoft Teams"
        >
          <FormField label="Status Order">
            <CustomSelect
              value={formData.status_order}
              onChange={(val) => updateField("status_order", val)}
              options={STATUS_ORDER_OPTIONS}
              placeholder="Pilih Status Order..."
            />
          </FormField>

          <FormField label="Status GR">
            <Input
              type="text"
              placeholder="Status Goods Receipt..."
              value={formData.status_gr}
              onChange={(e) => updateField("status_gr", e.target.value)}
              className="border-slate-200 focus:border-telkom-navy"
            />
          </FormField>

          {/* Bulan BC & Komitmen BC using MonthYearPicker */}
          <FormField label="Bulan BC">
            <MonthYearPicker
              value={formData.bulan_bc}
              onChange={(val) => updateField("bulan_bc", val)}
            />
          </FormField>

          <FormField label="Komitmen BC">
            <MonthYearPicker
              value={formData.komitmen_bc}
              onChange={(val) => updateField("komitmen_bc", val)}
            />
          </FormField>

          <FormField label="Keterangan Update" colSpan={2}>
            <textarea
              rows={3}
              placeholder="Catatan update progres terbaru dari proyek ini..."
              value={formData.ket_update}
              onChange={(e) => updateField("ket_update", e.target.value)}
              className="w-full p-3 rounded-lg border border-slate-200 bg-white text-sm text-slate-800 placeholder:text-slate-400 shadow-2xs transition-all outline-none focus:border-telkom-navy focus:ring-2 focus:ring-telkom-navy/15 resize-y"
            />
          </FormField>

          <FormField label="File BAST (Tautan Microsoft Teams)">
            <Input
              type="url"
              placeholder="https://telkomind.sharepoint.com/:f:/r/..."
              value={formData.file_bast}
              onChange={(e) => updateField("file_bast", e.target.value)}
              className="border-slate-200 focus:border-telkom-navy font-mono text-xs"
            />
          </FormField>

          <FormField label="File BAPL (Tautan Microsoft Teams)">
            <Input
              type="url"
              placeholder="https://telkomind.sharepoint.com/:f:/r/..."
              value={formData.file_bapl}
              onChange={(e) => updateField("file_bapl", e.target.value)}
              className="border-slate-200 focus:border-telkom-navy font-mono text-xs"
            />
          </FormField>
        </FormSection>

        {/* Footer Form with Cancel & Save Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-6 border-t border-slate-200">
          {/* Mandatory fields alert banner when validation fails */}
          {hasSubmitAttempted && Object.keys(errors).length > 0 ? (
            <div className="flex items-center text-xs font-semibold text-rose-600 bg-rose-50 border border-rose-200/80 px-3 py-2 rounded-lg animate-in fade-in duration-200 mr-auto">
              <span>Kolom bertanda (*) wajib diisi</span>
            </div>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-3 ml-auto">
            <Button
              type="button"
              variant="outline"
              onClick={handleAttemptCancel}
              disabled={isSubmitting}
              className="h-10 px-5 rounded-lg border-slate-200 text-slate-700 hover:bg-slate-100 cursor-pointer font-medium text-sm transition-all"
            >
              Cancel
            </Button>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="h-10 px-6 rounded-lg bg-telkom-navy hover:bg-[#003d82] active:bg-[#002047] text-white shadow-xs cursor-pointer font-semibold text-sm transition-all flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[18px] leading-none select-none">
                    save
                  </span>
                  <span>Save Project</span>
                </>
              )}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
});
