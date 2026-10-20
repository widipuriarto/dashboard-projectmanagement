import * as React from "react";
import { Input } from "@/components/ui/input";
import { FormSection } from "@/components/molecules/FormSection";
import { FormField } from "@/components/molecules/FormField";
import { CustomSelect } from "@/components/molecules/CustomSelect";
import {
  type ProjectFormData,
  type FormFieldUpdater,
  STATUS_DELIVERY_OPTIONS,
  STATUS_DOK_DELIVERY_OPTIONS,
} from "./types";

interface ProjectFormDeliveryProps {
  formData: ProjectFormData;
  updateField: FormFieldUpdater;
}

export const ProjectFormDelivery = React.memo(function ProjectFormDelivery({
  formData,
  updateField,
}: ProjectFormDeliveryProps) {
  return (
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
          options={STATUS_DELIVERY_OPTIONS as string[]}
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
          options={STATUS_DOK_DELIVERY_OPTIONS as string[]}
          placeholder="Pilih Status Dokumen Delivery..."
        />
      </FormField>
    </FormSection>
  );
});

