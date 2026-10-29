import * as React from "react";
import { Input } from "@/components/ui/input";
import { FormSection } from "@/components/molecules/FormSection";
import { FormField } from "@/components/molecules/FormField";
import { CustomSelect } from "@/components/molecules/CustomSelect";
import { OrderSidTreeInput } from "./OrderSidTreeInput";
import {
  type ProjectFormData,
  type FormFieldUpdater,
  STATUS_DELIVERY_OPTIONS,
} from "./types";
import type { OrdersData } from "@/types/orders";

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
  const handleOrdersChange = React.useCallback(
    (newOrders: OrdersData) => {
      updateField("orders_data", newOrders);
    },
    [updateField]
  );

  return (
    <FormSection title="3. Layanan & Status Delivery">
      {/* Dynamic Hierarchical Tree Input: Order ID & SID */}
      <OrderSidTreeInput
        value={formData.orders_data}
        onChange={handleOrdersChange}
        errors={errors}
        setFieldError={setFieldError}
      />

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
