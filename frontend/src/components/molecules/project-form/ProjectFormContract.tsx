import * as React from "react";
import { Input } from "@/components/ui/input";
import { FormSection } from "@/components/molecules/FormSection";
import { FormField } from "@/components/molecules/FormField";
import { CustomSelect } from "@/components/molecules/CustomSelect";
import { DatePicker } from "@/components/molecules/DatePicker";
import { CurrencyInput } from "@/components/atoms/CurrencyInput";
import {
  type ProjectFormData,
  type FormFieldUpdater,
  STATUS_OBL_OPTIONS,
  JENIS_KONTRAK_OPTIONS,
} from "./types";

interface ProjectFormContractProps {
  formData: ProjectFormData;
  updateField: FormFieldUpdater;
  errors: Record<string, string>;
}

export const ProjectFormContract = React.memo(function ProjectFormContract({
  formData,
  updateField,
  errors,
}: ProjectFormContractProps) {
  return (
    <FormSection
      title="2. Kontrak & Status Dokumen OBL"
      description="Status legalitas berkas OBL dan serah terima administrasi"
    >
      {/* Mandatory OBL Fields */}
      <FormField label="Status Email Handover" required error={errors.status_email_handover}>
        <CustomSelect
          data-testid="select-status-email-handover"
          value={formData.status_email_handover}
          onChange={(val) => updateField("status_email_handover", val)}
          options={["OK", "NOK"]}
          placeholder="Pilih Status..."
          error={errors.status_email_handover}
        />
      </FormField>

      <FormField label="Status Dokumen OBL" required error={errors.status_dokumen_obl}>
        <CustomSelect
          data-testid="select-status-dokumen-obl"
          value={formData.status_dokumen_obl}
          onChange={(val) => updateField("status_dokumen_obl", val)}
          options={STATUS_OBL_OPTIONS as string[]}
          placeholder="Pilih Status Dok OBL..."
          error={errors.status_dokumen_obl}
        />
      </FormField>

      <FormField label="Jenis Kontrak">
        <CustomSelect
          data-testid="select-jenis-kontrak"
          value={formData.jenis_kontrak}
          onChange={(val) => updateField("jenis_kontrak", val)}
          options={JENIS_KONTRAK_OPTIONS as string[]}
          placeholder="Pilih Jenis Kontrak..."
        />
      </FormField>

      <FormField label="Nomor KL / SP / WO / NOPES">
        <Input
          type="text"
          data-testid="input-nomor-kontrak"
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
          data-testid="input-nilai-kontrak-obl"
          placeholder="0"
          value={formData.nilai_kontrak_obl}
          onChange={(val) => updateField("nilai_kontrak_obl", val)}
        />
      </FormField>

      <FormField label="Quote Number">
        <Input
          type="text"
          data-testid="input-quote-number"
          placeholder="Contoh: 1-37841806771"
          value={formData.quote_number}
          onChange={(e) => updateField("quote_number", e.target.value)}
          className="border-slate-200 focus:border-telkom-navy"
        />
      </FormField>

      <FormField label="Note Email Handover">
        <Input
          type="text"
          data-testid="input-note-email-handover"
          placeholder="Catatan tambahan email by..."
          value={formData.note_email_handover}
          onChange={(e) => updateField("note_email_handover", e.target.value)}
          className="border-slate-200 focus:border-telkom-navy"
        />
      </FormField>
    </FormSection>
  );
});

