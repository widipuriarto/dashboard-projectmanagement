import type { OrdersData } from "./orders";

/**
 * Strongly-typed representation of a Project record from Supabase PostgreSQL.
 * Matches all 38 enterprise columns plus system timestamps and JSONB hierarchy.
 */
export interface ProjectEntity {
  id?: string | number;
  nomor?: number | null;
  project_id_pm: string;
  tahun_kontrak?: string | null;
  witel?: string | null;
  segment?: string | null;
  nama_proyek?: string | null;
  nama_pelanggan?: string | null;
  nama_mitra?: string | null;
  pm?: string | null;
  idlop?: string | null;
  status_email_handover?: string | boolean | null;
  note_email_handover?: string | null;
  status_dokumen_obl?: string | null;
  jenis_kontrak?: string | null;
  nomor_kl_sp_wo_nopes?: string | null;
  tgl_kontrak?: string | null;
  nilai_kontrak_obl?: number | null;
  quote_number?: string | null;
  no_order?: string | null;
  sid?: string | null;
  jenis_layanan?: string | null;
  status_delivery_project?: string | null;
  jenis_dok_delivery?: string | null;
  status_dokumen_delivery?: string | null;
  id_digireview?: string | null;
  tanggal_request_dr?: string | null;
  tanggal_close_dr?: string | null;
  no_bast_telkom?: string | null;
  tanggal_bast?: string | null;
  tahun_bast?: string | null;
  waktu_penyelesaian_bast?: number | null;
  status_order?: string | null;
  status_gr?: string | null;
  bulan_bc?: string | null;
  komitmen_bc?: string | null;
  ket_update?: string | null;
  file_bast?: string | null;
  file_bapl?: string | null;
  hardfile_bast?: boolean | string | null;
  created_at?: string | null;
  updated_at?: string | null;
  deleted_at?: string | null;
  orders_data?: OrdersData | null;
  [key: string]: unknown;
}

/**
 * Type alias for backward compatibility across existing table components.
 */
export type ProjectPM = ProjectEntity;

/**
 * Filter category descriptor for multi-category popover filter.
 */
export interface FilterCategory {
  id: string;
  label: string;
}

/**
 * Table metadata passed into TanStack Table instance for row actions and state dispatch.
 */
export interface ProjectTableMeta {
  isTrashView?: boolean;
  onEdit?: (row: ProjectPM) => void;
  onDelete?: (row: ProjectPM) => void;
  onRestore?: (row: ProjectPM) => void;
  onPermanentDelete?: (row: ProjectPM) => void;
  expandedRows?: Record<string, boolean>;
  toggleRowExpand?: (rowId: string) => void;
}
