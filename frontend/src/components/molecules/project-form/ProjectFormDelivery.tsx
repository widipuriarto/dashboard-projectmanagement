import * as React from "react";
import { Input } from "@/components/ui/input";
import { FormSection } from "@/components/molecules/FormSection";
import { FormField } from "@/components/molecules/FormField";
import { CustomSelect } from "@/components/molecules/CustomSelect";
import { cn } from "@/lib/utils";
import {
  type ProjectFormData,
  type FormFieldUpdater,
  STATUS_DELIVERY_OPTIONS,
} from "./types";

interface ProjectFormDeliveryProps {
  formData: ProjectFormData;
  updateField: FormFieldUpdater;
  errors?: Record<string, string>;
  setFieldError?: (field: string, error: string | null) => void;
}

export const ProjectFormDelivery = React.memo(function ProjectFormDelivery({
  formData,
  updateField,
  errors = {},
  setFieldError,
}: ProjectFormDeliveryProps) {
  const handleChangeNoOrder = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow digits and hyphens, max 13 characters ('1-' + 11 digits)
    const sanitized = e.target.value.replace(/[^0-9-]/g, "").slice(0, 13);
    updateField("no_order", sanitized);
  };

  const handleKeyDownNoOrder = (e: React.KeyboardEvent<HTMLInputElement>) => {
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
    // Block any non-digit, non-hyphen key
    if (!/[\d-]/.test(e.key)) {
      e.preventDefault();
    }
  };

  const handleBlurNoOrder = () => {
    const val = formData.no_order.trim();
    if (val && !/^1-\d{11}$/.test(val)) {
      setFieldError?.("no_order", "No Order wajib 1-(11 digit)");
    } else {
      setFieldError?.("no_order", null);
    }
  };

  const handleChangeSid = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow digits, max 10 characters
    const sanitized = e.target.value.replace(/\D/g, "").slice(0, 10);
    updateField("sid", sanitized);
  };

  const handleKeyDownSid = (e: React.KeyboardEvent<HTMLInputElement>) => {
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

  const handleBlurSid = () => {
    const val = formData.sid.trim();
    if (val && !/^\d{10}$/.test(val)) {
      setFieldError?.("sid", "SID wajib 10 digit");
    } else {
      setFieldError?.("sid", null);
    }
  };

  return (
    <FormSection title="3. Layanan & Status Delivery">
      {/* Row 1: No Order & SID */}
      <FormField label="No Order" error={errors.no_order}>
        <Input
          type="text"
          inputMode="numeric"
          placeholder="Contoh: 1-39653888125 1-(11 digit)"
          value={formData.no_order}
          onChange={handleChangeNoOrder}
          onKeyDown={handleKeyDownNoOrder}
          onBlur={handleBlurNoOrder}
          className={cn(errors.no_order && "border-red-400 focus:border-red-500")}
        />
      </FormField>

      <FormField label="SID" error={errors.sid}>
        <Input
          type="text"
          inputMode="numeric"
          placeholder="Contoh: 1794503720 (10 digit)"
          value={formData.sid}
          onChange={handleChangeSid}
          onKeyDown={handleKeyDownSid}
          onBlur={handleBlurSid}
          className={cn(errors.sid && "border-red-400 focus:border-red-500")}
        />
      </FormField>

      {/* Row 2: JENIS LAYANAN & Status Delivery Project */}
      <FormField label="JENIS LAYANAN">
        <Input
          type="text"
          placeholder="Masukkan jenis layanan..."
          value={formData.jenis_layanan}
          onChange={(e) => updateField("jenis_layanan", e.target.value)}
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
    </FormSection>
  );
});
