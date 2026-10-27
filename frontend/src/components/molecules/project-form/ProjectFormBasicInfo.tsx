import * as React from "react";
import { Input } from "@/components/ui/input";
import { FormSection } from "@/components/molecules/FormSection";
import { FormField } from "@/components/molecules/FormField";
import { CustomSelect } from "@/components/molecules/CustomSelect";
import { DatePicker } from "@/components/molecules/DatePicker";
import { MonthYearPicker } from "@/components/molecules/MonthYearPicker";
import { CurrencyInput } from "@/components/atoms/CurrencyInput";
import {
  type ProjectFormData,
  type FormFieldUpdater,
  WITEL_OPTIONS,
  SEGMENT_OPTIONS,
  NAMA_MITRA_OPTIONS,
  JENIS_KONTRAK_OPTIONS,
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
    <FormSection title="1. Data Project">
      {/* Row 1: ID PROJECT PM (Readonly lock) & SEGMENT (*) */}
      <FormField label="ID PROJECT PM" lockIcon>
        <Input
          type="text"
          readOnly
          data-testid="input-project-id-pm"
          value={generatedProjectId}
          className="bg-slate-100 text-slate-700 font-mono font-medium cursor-not-allowed border-slate-400 select-all"
        />
      </FormField>

      <FormField label="SEGMENT" required error={errors.segment}>
        <CustomSelect
          data-testid="select-segment"
          value={formData.segment}
          onChange={(val) => updateField("segment", val)}
          options={SEGMENT_OPTIONS as string[]}
          placeholder="Pilih Segmen..."
          error={errors.segment}
        />
      </FormField>

      {/* Row 2: WITEL (*) & Tahun Kontrak (*) */}
      <FormField label="WITEL" required error={errors.witel}>
        <CustomSelect
          data-testid="select-witel"
          value={formData.witel}
          onChange={(val) => updateField("witel", val)}
          options={WITEL_OPTIONS as string[]}
          placeholder="Pilih Witel..."
          error={errors.witel}
        />
      </FormField>

      <FormField label="Tahun Kontrak" required error={errors.tahun_kontrak}>
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

      {/* Row 3: Nama Project (Col-span-2) (*) */}
      <FormField label="Nama Project" required colSpan={2} error={errors.nama_proyek}>
        <Input
          type="text"
          data-testid="input-nama-proyek"
          placeholder="Masukkan nama project..."
          value={formData.nama_proyek}
          onChange={(e) => updateField("nama_proyek", e.target.value)}
        />
      </FormField>

      {/* Row 4: Nama Mitra (*) & Nama Pelanggan (*) */}
      <FormField label="Nama Mitra" required error={errors.nama_mitra}>
        <CustomSelect
          data-testid="select-nama-mitra"
          value={formData.nama_mitra}
          onChange={(val) => updateField("nama_mitra", val)}
          options={NAMA_MITRA_OPTIONS as string[]}
          placeholder="Pilih Nama Mitra..."
          error={errors.nama_mitra}
        />
      </FormField>

      <FormField label="Nama Pelanggan" required error={errors.nama_pelanggan}>
        <Input
          type="text"
          data-testid="input-nama-pelanggan"
          placeholder="Masukkan nama pelanggan..."
          value={formData.nama_pelanggan}
          onChange={(e) => updateField("nama_pelanggan", e.target.value)}
        />
      </FormField>

      {/* Row 5: IDLOP & Jenis Kontrak */}
      <FormField label="IDLOP">
        <Input
          type="text"
          data-testid="input-idlop"
          placeholder="Contoh: LOP-401428-1694593421915"
          value={formData.idlop}
          onChange={(e) => updateField("idlop", e.target.value)}
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

      {/* Row 6: Nomor KL/SP/WO/NOPES & Tgl Kontrak */}
      <FormField label="Nomor KL/SP/WO/NOPES">
        <Input
          type="text"
          data-testid="input-nomor-kontrak"
          placeholder="Contoh: TEL.4720/LG.270/DR4-1D000000/2023"
          value={formData.nomor_kl_sp_wo_nopes}
          onChange={(e) => updateField("nomor_kl_sp_wo_nopes", e.target.value)}
        />
      </FormField>

      <FormField label="Tgl Kontrak">
        <DatePicker
          value={formData.tgl_kontrak}
          onChange={(val) => updateField("tgl_kontrak", val)}
          placeholder="Pilih Tanggal Kontrak..."
        />
      </FormField>

      {/* Row 7: Nilai Kontrak (OBL) & Komitmen BC */}
      <FormField label="Nilai Kontrak (OBL)">
        <CurrencyInput
          data-testid="input-nilai-kontrak-obl"
          placeholder="0"
          value={formData.nilai_kontrak_obl}
          onChange={(val) => updateField("nilai_kontrak_obl", val)}
        />
      </FormField>

      <FormField label="Komitmen BC">
        <MonthYearPicker
          value={formData.komitmen_bc}
          onChange={(val) => updateField("komitmen_bc", val)}
        />
      </FormField>
    </FormSection>
  );
});
