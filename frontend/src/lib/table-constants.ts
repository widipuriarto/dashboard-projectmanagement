import type { FilterCategory } from "@/types/project";
import { formatMonthYearKey, idrCurrencyFormatter } from "./formatters";

export const MANDATORY_COLUMN_IDS = ["actions", "nomor", "project_id_pm"] as const;

export const LOCKED_COLUMNS: readonly string[] = ["actions", "nomor"];

export const OVERFLOW_ENABLED_COLUMN_IDS = [
  "nama_proyek",
  "nama_mitra",
  "nama_pelanggan",
  "idlop",
  "nomor_kl_sp_wo_nopes",
  "note_email_handover",
  "no_bast_telkom",
  "ket_update",
] as const;

export const OVERFLOW_POPOVER_COLUMN_IDS = OVERFLOW_ENABLED_COLUMN_IDS;

export const STORAGE_KEY_VISIBILITY = "pm_rso1_column_visibility";
export const STORAGE_KEY_ORDER = "pm_rso1_column_order";
export const STORAGE_KEY_FILTERS = "pm_rso1_column_filters";
export const STORAGE_KEY_SORTING = "pm_rso1_column_sorting";
export const STORAGE_KEY_HIGHEST_SEQ = "pm_rso1_highest_project_seq";
export const STORAGE_KEY_HIGHEST_NOMOR = "pm_rso1_highest_nomor";

export const COLUMN_DISPLAY_TITLES: Record<string, string> = {
  actions: "Action",
  nomor: "No.",
  project_id_pm: "ID Project PM",
  segment: "Segment",
  witel: "Witel",
  nama_proyek: "Nama Proyek",
  nama_mitra: "Nama Mitra",
  nama_pelanggan: "Nama Pelanggan",
  idlop: "IDLOP",
  jenis_kontrak: "Jenis Kontrak",
  nomor_kl_sp_wo_nopes: "Nomor KL/SP/WO/NOPES",
  tgl_kontrak: "Tgl Kontrak",
  tahun_kontrak: "Tahun Kontrak",
  nilai_kontrak_obl: "Nilai Kontrak OBL",
  quote_number: "Quote Number",
  status_email_handover: "Status Email Handover",
  note_email_handover: "Note Email Handover",
  status_dokumen_obl: "Status Dokumen OBL",
  no_order: "No Order",
  sid: "SID",
  jenis_layanan: "Jenis Layanan",
  status_delivery_project: "Status Delivery Project",
  jenis_dok_delivery: "Jenis Dok Delivery",
  status_dokumen_delivery: "Status Dokumen Delivery",
  id_digireview: "ID Digireview",
  tanggal_request_dr: "Tanggal Request DR",
  tanggal_close_dr: "Tanggal Close DR",
  no_bast_telkom: "No BAST Telkom",
  tanggal_bast: "Tanggal BAST",
  tahun_bast: "Tahun BAST",
  pm: "PM",
  sla_bast: "Waktu Penyelesaian BAST",
  waktu_penyelesaian_bast: "Waktu Penyelesaian BAST",
  ket_update: "Ket Update",
  status_order: "Status Order",
  komitmen_bc: "Komitmen BC",
  bulan_bc: "Bulan BC",
  file_bast: "File BAST",
  file_bapl: "File BAPL",
  status_gr: "Status GR",
  hardfile_bast: "Hardfile BAST",
  created_at: "Created At",
  updated_at: "Updated At",
  deleted_at: "Deleted At",
};

/**
 * Returns human-readable column display title. Adapts "Updated At" to "Deleted At" in trash bin mode.
 */
export function getColumnDisplayTitle(columnId: string, isTrashView = false): string {
  if (columnId === "updated_at" && isTrashView) {
    return "Deleted At";
  }
  if (COLUMN_DISPLAY_TITLES[columnId]) {
    return COLUMN_DISPLAY_TITLES[columnId];
  }
  return columnId
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

/**
 * Multi-select filter comparator function for TanStack Table column filtering.
 */
export const multiSelectFilterFn = (
  row: { getValue: (id: string) => unknown },
  columnId: string,
  filterValues: string[]
): boolean => {
  if (!filterValues || filterValues.length === 0) return true;
  const rawValue = row.getValue(columnId);
  const cellValue = rawValue != null && String(rawValue).trim() !== "" ? String(rawValue).trim() : "-";
  return filterValues.includes(cellValue);
};

/**
 * Computes SLA compliance category based on elapsed days or difference between DR request & close dates.
 */
export const getSlaCategory = (
  daysOrReqDr?: number | string | null,
  closeDrStr?: string | null
): string => {
  let diffDays: number | null = null;

  if (typeof daysOrReqDr === "number") {
    diffDays = daysOrReqDr;
  } else if (daysOrReqDr != null && !closeDrStr && !isNaN(Number(daysOrReqDr))) {
    diffDays = Number(daysOrReqDr);
  } else if (daysOrReqDr && closeDrStr) {
    const reqDate = new Date(String(daysOrReqDr));
    const closeDate = new Date(closeDrStr);
    if (!isNaN(reqDate.getTime()) && !isNaN(closeDate.getTime())) {
      const diffTime = Math.abs(closeDate.getTime() - reqDate.getTime());
      diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }
  }

  if (diffDays === null || isNaN(diffDays)) return "-";
  if (diffDays <= 7) return "<= 7 Hari";
  if (diffDays >= 8 && diffDays <= 10) return "8 - 10 Hari";
  return "> 10 Hari";
};

/**
 * Filter comparator function for SLA compliance category.
 */
export const slaBastFilterFn = (
  row: { getValue: (id: string) => unknown; original: Record<string, unknown> },
  _columnId: string,
  filterValues: string[]
): boolean => {
  if (!filterValues || filterValues.length === 0) return true;
  const dbVal = row.getValue("waktu_penyelesaian_bast");
  const cat = dbVal != null
    ? getSlaCategory(Number(dbVal))
    : getSlaCategory(
        row.original.tanggal_request_dr as string,
        row.original.tanggal_close_dr as string
      );
  return filterValues.includes(cat);
};

/**
 * Filter comparator function for Month-Year columns (komitmen_bc, bulan_bc).
 */
export const monthYearFilterFn = (
  row: { getValue: (id: string) => unknown },
  columnId: string,
  filterValues: string[]
): boolean => {
  if (!filterValues || filterValues.length === 0) return true;
  const raw = row.getValue(columnId) as string | null;
  const formatted = formatMonthYearKey(raw);
  return filterValues.includes(formatted);
};

export const FILTER_CATEGORIES: FilterCategory[] = [
  { id: "segment", label: "Segment" },
  { id: "witel", label: "Witel" },
  { id: "jenis_kontrak", label: "Jenis Kontrak" },
  { id: "tahun_kontrak", label: "Tahun Kontrak" },
  { id: "status_dokumen_obl", label: "Status Dok. OBL" },
  { id: "status_delivery_project", label: "Status Delivery" },
  { id: "status_dokumen_delivery", label: "Status Dok. Delivery" },
  { id: "tahun_bast", label: "Tahun BAST" },
  { id: "pm", label: "Project Manager" },
  { id: "sla_bast", label: "Waktu Penyelesaian BAST" },
  { id: "status_order", label: "Status Order" },
  { id: "komitmen_bc", label: "Komitmen BC" },
  { id: "bulan_bc", label: "Bulan BC" },
  { id: "hardfile_bast", label: "Hardfile BAST" },
];

/**
 * Custom sorting function for project_id_pm sorting trailing numeric sequence.
 */
export const sortProjectByIdPm = (
  rowA: { getValue: (id: string) => unknown },
  rowB: { getValue: (id: string) => unknown },
  columnId: string
): number => {
  const getNum = (id: unknown) => {
    if (!id) return 0;
    const match = String(id).match(/(\d+)$/);
    return match ? parseInt(match[0], 10) : 0;
  };
  const valA = rowA.getValue(columnId);
  const valB = rowB.getValue(columnId);
  const numA = getNum(valA);
  const numB = getNum(valB);
  if (numA !== numB) {
    return numA - numB;
  }
  return String(valA || "").localeCompare(String(valB || ""));
};

/**
 * Custom global filter evaluator for multi-column and scoped column search.
 */
export const customGlobalFilterFn = (
  row: { getValue: (id: string) => unknown },
  columnId: string,
  filterValue: unknown
): boolean => {
  if (!filterValue) return true;

  const query =
    typeof filterValue === "string"
      ? filterValue.toLowerCase().trim()
      : (filterValue as { query?: string })?.query;
  const targetCol =
    typeof filterValue === "string"
      ? "all"
      : (filterValue as { targetColumn?: string })?.targetColumn;

  if (!query) return true;

  // If a specific target column is selected, only evaluate that column
  if (targetCol && targetCol !== "all" && columnId !== targetCol) {
    return false;
  }

  const rawVal = row.getValue(columnId);
  if (rawVal == null) return false;

  // Standard case-insensitive string matching
  const strVal = String(rawVal).toLowerCase();
  if (strVal.includes(query)) return true;

  // Special case: Rupiah formatted currency for nilai_kontrak_obl using singleton formatter
  if (columnId === "nilai_kontrak_obl" && typeof rawVal === "number") {
    const formatted = idrCurrencyFormatter.format(rawVal).toLowerCase();
    if (formatted.includes(query)) return true;
  }

  return false;
};
