import * as React from "react";
import { Input } from "@/components/ui/input";
import { FormSection } from "@/components/molecules/FormSection";
import { FormField } from "@/components/molecules/FormField";
import { CustomSelect } from "@/components/molecules/CustomSelect";
import { DatePicker } from "@/components/molecules/DatePicker";
import {
  type ProjectFormData,
  type FormFieldUpdater,
  HARDFILE_BAST_OPTIONS,
} from "./types";

interface ProjectFormBastProps {
  formData: ProjectFormData;
  updateField: FormFieldUpdater;
  liveSlaDays: string;
}

export const ProjectFormBast = React.memo(function ProjectFormBast({
  formData,
  updateField,
  liveSlaDays,
}: ProjectFormBastProps) {
  return (
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
          options={HARDFILE_BAST_OPTIONS as string[]}
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
          onChange={(e) =>
            updateField(
              "tahun_bast",
              e.target.value ? parseInt(e.target.value, 10) : null
            )
          }
          className="border-slate-200 focus:border-telkom-navy"
        />
      </FormField>
    </FormSection>
  );
});

