import * as React from "react";
import { Input } from "@/components/ui/input";
import { FormSection } from "@/components/molecules/FormSection";
import { FormField } from "@/components/molecules/FormField";
import { CustomSelect } from "@/components/molecules/CustomSelect";
import {
  type ProjectFormData,
  type FormFieldUpdater,
  STATUS_OBL_OPTIONS,
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
    <FormSection title="2. Status Dokumen OBL">
      {/* Row 1: Quote Number & STATUS EMAIL HANDOVER (*) */}
      <FormField label="Quote Number">
        <Input
          type="text"
          data-testid="input-quote-number"
          placeholder="Contoh: 1-37841806771"
          value={formData.quote_number}
          onChange={(e) => updateField("quote_number", e.target.value)}
        />
      </FormField>

      <FormField label="STATUS EMAIL HANDOVER" required error={errors.status_email_handover}>
        <CustomSelect
          data-testid="select-status-email-handover"
          value={formData.status_email_handover}
          onChange={(val) => updateField("status_email_handover", val)}
          options={["OK", "NOK"]}
          placeholder="Pilih Status Email Handover..."
          error={errors.status_email_handover}
        />
      </FormField>

      {/* Row 2: Note Email Hand Over & Status Dokumen OBL (*) */}
      <FormField label="Note Email Hand Over">
        <Input
          type="text"
          data-testid="input-note-email-handover"
          placeholder="Catatan email..."
          value={formData.note_email_handover}
          onChange={(e) => updateField("note_email_handover", e.target.value)}
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
    </FormSection>
  );
});
