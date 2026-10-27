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
  STATUS_GR_OPTIONS,
  HARDFILE_BAST_OPTIONS,
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
    <FormSection title="5. Status Order & Repository Dokumen">
      {/* Row 1: STATUS ORDER & Status GR */}
      <FormField label="STATUS ORDER">
        <CustomSelect
          value={formData.status_order}
          onChange={(val) => updateField("status_order", val)}
          options={STATUS_ORDER_OPTIONS as string[]}
          placeholder="Pilih Status Order..."
        />
      </FormField>

      <FormField label="Status GR">
        <CustomSelect
          value={formData.status_gr}
          onChange={(val) => updateField("status_gr", val)}
          options={STATUS_GR_OPTIONS as string[]}
          placeholder="Pilih Status GR..."
        />
      </FormField>

      {/* Row 2: Bulan BC & Hardfile BAST */}
      <FormField label="Bulan BC">
        <MonthYearPicker
          value={formData.bulan_bc}
          onChange={(val) => updateField("bulan_bc", val)}
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

      {/* Row 3: File BAST & File BAPL */}
      <FormField label="File BAST (Link Microsoft Teams)">
        <Input
          type="url"
          placeholder="https://telkomind.sharepoint.com/sites/..."
          value={formData.file_bast}
          onChange={(e) => updateField("file_bast", e.target.value)}
          className="font-mono text-xs"
        />
      </FormField>

      <FormField label="File BAPL (Link Microsoft Teams)">
        <Input
          type="url"
          placeholder="https://telkomind.sharepoint.com/sites/..."
          value={formData.file_bapl}
          onChange={(e) => updateField("file_bapl", e.target.value)}
          className="font-mono text-xs"
        />
      </FormField>
    </FormSection>
  );
});
