import * as React from "react";
import { Input } from "@/components/ui/input";
import { FormSection } from "@/components/molecules/FormSection";
import { FormField } from "@/components/molecules/FormField";
import { CustomSelect } from "@/components/molecules/CustomSelect";
import { DatePicker } from "@/components/molecules/DatePicker";
import { cn } from "@/lib/utils";
import {
  type ProjectFormData,
  type FormFieldUpdater,
  JENIS_DOK_DELIVERY_OPTIONS,
  STATUS_DOK_DELIVERY_OPTIONS,
} from "./types";

interface ProjectFormBastProps {
  formData: ProjectFormData;
  updateField: FormFieldUpdater;
  liveSlaDays: string;
  errors?: Record<string, string>;
  setFieldError?: (field: string, error: string | null) => void;
}

export const ProjectFormBast = React.memo(function ProjectFormBast({
  formData,
  updateField,
  liveSlaDays,
  errors = {},
  setFieldError,
}: ProjectFormBastProps) {
  const handleChangeIdDigireview = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only permit numeric digits, max 6 characters
    const sanitized = e.target.value.replace(/\D/g, "").slice(0, 6);
    updateField("id_digireview", sanitized);
  };

  const handleKeyDownIdDigireview = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (
      e.key === "Backspace" ||
      e.key === "Delete" ||
      e.key === "Tab" ||
      e.key === "ArrowLeft" ||
      e.key === "ArrowRight" ||
      e.key === "Enter" ||
      e.ctrlKey ||
      e.metaKey
    ) {
      return;
    }
    // Block any non-digit key
    if (!/\d/.test(e.key)) {
      e.preventDefault();
    }
  };

  const handleBlurIdDigireview = () => {
    const val = formData.id_digireview.trim();
    if (val && !/^\d{6}$/.test(val)) {
      setFieldError?.("id_digireview", "ID Digireview wajib 6 digit");
    } else {
      setFieldError?.("id_digireview", null);
    }
  };

  return (
    <FormSection title="4. Data Dokumen Delivery">
      {/* Row 1: JENIS DOK DELIVERY & Status Dokumen Delivery */}
      <FormField label="JENIS DOK DELIVERY">
        <CustomSelect
          value={formData.jenis_dok_delivery}
          onChange={(val) => updateField("jenis_dok_delivery", val)}
          options={JENIS_DOK_DELIVERY_OPTIONS as string[]}
          placeholder="Pilih Jenis Dok Delivery..."
        />
      </FormField>

      <FormField label="Status Dokumen Delivery">
        <CustomSelect
          value={formData.status_dokumen_delivery}
          onChange={(val) => updateField("status_dokumen_delivery", val)}
          options={STATUS_DOK_DELIVERY_OPTIONS as string[]}
          placeholder="Pilih Status Dokumen Delivery..."
        />
      </FormField>

      {/* Row 2: ID DIGIREVIEW & No BAST Telkom */}
      <FormField label="ID DIGIREVIEW" error={errors.id_digireview}>
        <Input
          type="text"
          inputMode="numeric"
          placeholder="Contoh: 123456 (6 digit)"
          value={formData.id_digireview}
          onChange={handleChangeIdDigireview}
          onKeyDown={handleKeyDownIdDigireview}
          onBlur={handleBlurIdDigireview}
          className={cn(errors.id_digireview && "border-red-400 focus:border-red-500")}
        />
      </FormField>

      <FormField label="No BAST Telkom">
        <Input
          type="text"
          placeholder="Contoh: Tel.7165/LG320/DR4-1D100000/2023"
          value={formData.no_bast_telkom}
          onChange={(e) => updateField("no_bast_telkom", e.target.value)}
        />
      </FormField>

      {/* Row 3: Tanggal Request DR & Tanggal Close DR */}
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

      {/* Row 4: PM (Auto filled by Segmen) & Waktu Penyelesaian BAST (hari) */}
      <FormField label="PM">
        <Input
          type="text"
          readOnly
          data-testid="input-pm"
          placeholder="Autofilled by Segmen"
          value={formData.pm}
          className="bg-slate-100 text-slate-700 font-medium cursor-not-allowed border-slate-400 select-all placeholder:text-xs"
        />
      </FormField>

      <FormField label="Waktu Penyelesaian BAST (hari)">
        <Input
          type="text"
          readOnly
          placeholder="Autofilled by Tanggal Request & Close DR"
          value={liveSlaDays === "-" ? "" : liveSlaDays}
          className="bg-slate-100 text-slate-700 font-medium cursor-not-allowed border-slate-400 select-all placeholder:text-xs"
        />
      </FormField>

      {/* Row 5: Tanggal BAST & Tahun BAST (Auto filled by Tanggal BAST) */}
      <FormField label="Tanggal BAST">
        <DatePicker
          value={formData.tanggal_bast}
          onChange={(val) => {
            updateField("tanggal_bast", val);
            if (val) {
              const yearMatch = val.match(/^(\d{4})/);
              if (yearMatch) {
                updateField("tahun_bast", parseInt(yearMatch[1], 10));
              }
            } else {
              updateField("tahun_bast", null);
            }
          }}
          placeholder="Pilih Tanggal BAST..."
        />
      </FormField>

      <FormField label="Tahun BAST">
        <Input
          type="text"
          readOnly
          data-testid="input-tahun-bast"
          placeholder="Autofilled by Tanggal BAST"
          value={formData.tahun_bast != null ? String(formData.tahun_bast) : ""}
          className="bg-slate-100 text-slate-700 font-medium cursor-not-allowed border-slate-400 select-all placeholder:text-xs"
        />
      </FormField>

      {/* Row 6: KET UPDATE (Col-span-2) */}
      <FormField label="KET UPDATE" colSpan={2}>
        <textarea
          rows={3}
          placeholder="Catatan update progress..."
          value={formData.ket_update}
          onChange={(e) => updateField("ket_update", e.target.value)}
          className="w-full p-3 rounded-md border border-slate-400 hover:border-slate-500 bg-white text-sm text-slate-800 placeholder:text-slate-400 transition-all outline-none focus:border-telkom-navy focus:ring-0 resize-y"
        />
      </FormField>
    </FormSection>
  );
});
