import * as React from "react";
import { Input } from "@/components/ui/input";
import { FormSection } from "@/components/molecules/FormSection";
import { FormField } from "@/components/molecules/FormField";
import { CustomSelect } from "@/components/molecules/CustomSelect";
import {
  type ProjectFormData,
  type FormFieldUpdater,
  WITEL_OPTIONS,
  SEGMENT_OPTIONS,
  PM_OPTIONS,
} from "./types";

interface ProjectFormBasicInfoProps {
  formData: ProjectFormData;
  updateField: FormFieldUpdater;
  errors: Record<string, string>;
  generatedProjectId: string;
}

export const ProjectFormBasicInfo = React.memo(function ProjectFormBasicInfo({
  formData,
  updateField,
  errors,
  generatedProjectId,
}: ProjectFormBasicInfoProps) {
  return (
    <FormSection
      title="1. Identitas & Inisiasi Proyek"
      description="Informasi utama dan deskripsi project"
    >
      {/* Row 1: ID PROJECT PM (Readonly preview with lock icon) & Tahun Project */}
      <FormField label="ID PROJECT PM" lockIcon>
        <Input
          type="text"
          readOnly
          data-testid="input-project-id-pm"
          value={generatedProjectId}
          className="bg-slate-50 text-slate-700 font-mono font-medium cursor-not-allowed border-slate-400 select-all"
        />
      </FormField>

      <FormField label="Tahun Project" required error={errors.tahun_kontrak}>
        <Input
          type="number"
          data-testid="input-tahun-kontrak"
          placeholder="Contoh: 2027"
          value={formData.tahun_kontrak ?? ""}
          onChange={(e) =>
            updateField(
              "tahun_kontrak",
              e.target.value ? parseInt(e.target.value, 10) : null
            )
          }
        />
      </FormField>

      {/* Row 2: Witel & Segmen */}
      <FormField label="Witel" required error={errors.witel}>
        <CustomSelect
          data-testid="select-witel"
          value={formData.witel}
          onChange={(val) => updateField("witel", val)}
          options={WITEL_OPTIONS as string[]}
          placeholder="Pilih Witel..."
          error={errors.witel}
        />
      </FormField>

      <FormField label="Segmen" required error={errors.segment}>
        <CustomSelect
          data-testid="select-segment"
          value={formData.segment}
          onChange={(val) => updateField("segment", val)}
          options={SEGMENT_OPTIONS as string[]}
          placeholder="Pilih Segmen..."
          error={errors.segment}
        />
      </FormField>

      {/* Row 3: Nama Proyek (Col-span-2) */}
      <FormField label="Nama Project" required colSpan={2} error={errors.nama_proyek}>
        <Input
          type="text"
          data-testid="input-nama-proyek"
          placeholder="Masukkan nama project lengkap..."
          value={formData.nama_proyek}
          onChange={(e) => updateField("nama_proyek", e.target.value)}
        />
      </FormField>

      {/* Row 4: Pelanggan & Mitra */}
      <FormField label="Nama Pelanggan" required error={errors.nama_pelanggan}>
        <Input
          type="text"
          data-testid="input-nama-pelanggan"
          placeholder="Masukkan nama pelanggan..."
          value={formData.nama_pelanggan}
          onChange={(e) => updateField("nama_pelanggan", e.target.value)}
        />
      </FormField>

      <FormField label="Nama Mitra" required error={errors.nama_mitra}>
        <Input
          type="text"
          data-testid="input-nama-mitra"
          placeholder="Masukkan nama mitra..."
          value={formData.nama_mitra}
          onChange={(e) => updateField("nama_mitra", e.target.value)}
        />
      </FormField>

      {/* Row 5: PM & IDLOP */}
      <FormField label="PM">
        <CustomSelect
          data-testid="select-pm"
          value={formData.pm}
          onChange={(val) => updateField("pm", val)}
          options={PM_OPTIONS as string[]}
          placeholder="Pilih PM..."
        />
      </FormField>

      <FormField label="IDLOP">
        <Input
          type="text"
          data-testid="input-idlop"
          placeholder="Contoh: LOP-401428-1694593421915"
          value={formData.idlop}
          onChange={(e) => updateField("idlop", e.target.value)}
        />
      </FormField>
    </FormSection>
  );
});
