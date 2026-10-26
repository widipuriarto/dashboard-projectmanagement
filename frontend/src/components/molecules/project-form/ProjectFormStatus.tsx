import * as React from "react";
import { Input } from "@/components/ui/input";
import { FormSection } from "@/components/molecules/FormSection";
import { FormField } from "@/components/molecules/FormField";
import { CustomSelect } from "@/components/molecules/CustomSelect";
import { MonthYearPicker } from "@/components/molecules/MonthYearPicker";
import {
  type ProjectFormData,
  type FormFieldUpdater,
  STATUS_ORDER_OPTIONS,
} from "./types";

interface ProjectFormStatusProps {
  formData: ProjectFormData;
  updateField: FormFieldUpdater;
}

export const ProjectFormStatus = React.memo(function ProjectFormStatus({
  formData,
  updateField,
}: ProjectFormStatusProps) {
  return (
    <FormSection
      title="5. Billing Completion & Repositori Berkas"
      description="Penyelesaian tagihan (BC), update status, dan tautan dokumen Microsoft Teams"
    >
      <FormField label="Status Order">
        <CustomSelect
          value={formData.status_order}
          onChange={(val) => updateField("status_order", val)}
          options={STATUS_ORDER_OPTIONS as string[]}
          placeholder="Pilih Status Order..."
        />
      </FormField>

      <FormField label="Status GR">
        <Input
          type="text"
          placeholder="Status Goods Receipt..."
          value={formData.status_gr}
          onChange={(e) => updateField("status_gr", e.target.value)}
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
          className="w-full p-3 rounded-lg border border-slate-400 hover:border-slate-500 bg-white text-sm text-slate-800 placeholder:text-slate-400 transition-all outline-none focus:border-telkom-navy focus:ring-0 resize-y"
        />
      </FormField>

      <FormField label="File BAST (Tautan Microsoft Teams)">
        <Input
          type="url"
          placeholder="https://telkomind.sharepoint.com/:f:/r/..."
          value={formData.file_bast}
          onChange={(e) => updateField("file_bast", e.target.value)}
          className="font-mono text-xs"
        />
      </FormField>

      <FormField label="File BAPL (Tautan Microsoft Teams)">
        <Input
          type="url"
          placeholder="https://telkomind.sharepoint.com/:f:/r/..."
          value={formData.file_bapl}
          onChange={(e) => updateField("file_bapl", e.target.value)}
          className="font-mono text-xs"
        />
      </FormField>
    </FormSection>
  );
});

