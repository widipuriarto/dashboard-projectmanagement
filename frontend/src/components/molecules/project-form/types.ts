import type { ProjectPM } from "@/components/organisms/columns";

export interface ProjectFormData {
  project_id_pm: string;
  tahun_kontrak: number | null;
  witel: string;
  segment: string;
  nama_proyek: string;
  nama_pelanggan: string;
  nama_mitra: string;
  pm: string;
  idlop: string;
  status_email_handover: string;
  status_dokumen_obl: string;
  jenis_kontrak: string;
  nomor_kl_sp_wo_nopes: string;
  tgl_kontrak: string;
  nilai_kontrak_obl: number | null;
  quote_number: string;
  note_email_handover: string;
  no_order: string;
  sid: string;
  jenis_layanan: string;
  status_delivery_project: string;
  jenis_dok_delivery: string;
  status_dokumen_delivery: string;
  id_digireview: string;
  no_bast_telkom: string;
  tanggal_request_dr: string;
  tanggal_close_dr: string;
  hardfile_bast: string;
  tanggal_bast: string;
  tahun_bast: number | null;
  status_order: string;
  status_gr: string;
  bulan_bc: string | null;
  komitmen_bc: string | null;
  ket_update: string;
  file_bast: string;
  file_bapl: string;
}

export const INITIAL_FORM_DATA: ProjectFormData = {
  project_id_pm: "",
  tahun_kontrak: null,
  witel: "",
  segment: "",
  nama_proyek: "",
  nama_pelanggan: "",
  nama_mitra: "",
  pm: "",
  idlop: "",
  status_email_handover: "",
  status_dokumen_obl: "",
  jenis_kontrak: "",
  nomor_kl_sp_wo_nopes: "",
  tgl_kontrak: "",
  nilai_kontrak_obl: null,
  quote_number: "",
  note_email_handover: "",
  no_order: "",
  sid: "",
  jenis_layanan: "",
  status_delivery_project: "",
  jenis_dok_delivery: "",
  status_dokumen_delivery: "",
  id_digireview: "",
  no_bast_telkom: "",
  tanggal_request_dr: "",
  tanggal_close_dr: "",
  hardfile_bast: "",
  tanggal_bast: "",
  tahun_bast: null,
  status_order: "",
  status_gr: "",
  bulan_bc: null,
  komitmen_bc: null,
  ket_update: "",
  file_bast: "",
  file_bapl: "",
};

export function mapInitialFormData(data?: ProjectPM | null): ProjectFormData {
  if (!data) return INITIAL_FORM_DATA;

  const sanitizeDate = (val?: string | null) => {
    if (!val) return "";
    return String(val).split("T")[0];
  };

  const emailHandover =
    data.status_email_handover === true
      ? "OK"
      : data.status_email_handover === false
      ? "NOK"
      : data.status_email_handover || "";

  return {
    project_id_pm: data.project_id_pm || "",
    tahun_kontrak: data.tahun_kontrak != null ? Number(data.tahun_kontrak) : null,
    witel: data.witel || "",
    segment: data.segment || "",
    nama_proyek: data.nama_proyek || "",
    nama_pelanggan: data.nama_pelanggan || "",
    nama_mitra: data.nama_mitra || "",
    pm: data.segment ? getPmBySegment(data.segment) : (data.pm || ""),
    idlop: data.idlop || "",
    status_email_handover: emailHandover,
    status_dokumen_obl: data.status_dokumen_obl || "",
    jenis_kontrak: data.jenis_kontrak || "",
    nomor_kl_sp_wo_nopes: data.nomor_kl_sp_wo_nopes || "",
    tgl_kontrak: sanitizeDate(data.tgl_kontrak),
    nilai_kontrak_obl: data.nilai_kontrak_obl != null ? Number(data.nilai_kontrak_obl) : null,
    quote_number: data.quote_number || "",
    note_email_handover: data.note_email_handover || "",
    no_order: data.no_order || "",
    sid: data.sid || "",
    jenis_layanan: data.jenis_layanan || "",
    status_delivery_project: data.status_delivery_project || "",
    jenis_dok_delivery: data.jenis_dok_delivery || "",
    status_dokumen_delivery: data.status_dokumen_delivery || "",
    id_digireview: data.id_digireview || "",
    no_bast_telkom: data.no_bast_telkom || "",
    tanggal_request_dr: sanitizeDate(data.tanggal_request_dr),
    tanggal_close_dr: sanitizeDate(data.tanggal_close_dr),
    hardfile_bast: data.hardfile_bast || "",
    tanggal_bast: sanitizeDate(data.tanggal_bast),
    tahun_bast: data.tahun_bast != null ? Number(data.tahun_bast) : null,
    status_order: data.status_order || "",
    status_gr: data.status_gr || "",
    bulan_bc: data.bulan_bc || null,
    komitmen_bc: sanitizeDate(data.komitmen_bc) || null,
    ket_update: data.ket_update || "",
    file_bast: data.file_bast || "",
    file_bapl: data.file_bapl || "",
  };
}

export const getWitelCode = (witel?: string | null): string => {
  if (!witel) return "WITEL";
  const trimmed = witel.trim();
  if (!trimmed) return "WITEL";
  // Extract first 3 characters in uppercase (e.g., "SMG JATENG UTARA" -> "SMG")
  return trimmed.slice(0, 3).toUpperCase();
};

export const WITEL_OPTIONS: readonly string[] = [
  "SMG JATENG UTARA",
  "SLO JATENG TIMUR",
  "YOG JATENG SELATAN",
] as const;

export const SEGMENT_OPTIONS: readonly string[] = [
  "DGS",
  "DPS",
  "DSS",
  "SME",
] as const;

export const NAMA_MITRA_OPTIONS: readonly string[] = [
  "DESNET",
  "DIGISERVE",
  "GRATIKA",
  "INDOSAT",
  "KOPEGTEL SOLO",
  "KOPERASI KARYAWAN SMARTMEDIA",
  "KOPERASI METROPOLITAN",
  "KOPERASI SMART",
  "MEDIA SARANA DATA",
  "MITRA INOVASI JAYANTARA",
  "PT. ADMINISTRASI MEDIKA",
  "PT. DIGITAL APLIKASI SOLUSI",
  "PT. FINNET INDONESIA",
  "PT. INFOMEDIA NUSANTARA",
  "PT. JALIN MAYANTARA INDONESIA",
  "PT. METRA DIGITAL MEDIA",
  "PT. METRA-NET",
  "PT. PINS INDONESIA",
  "PT. SIGMA CIPTA CARAKA",
  "PT. SISTELINDO MITRALINTAS",
  "PT. TELKOM AKSES",
  "PT. TELKOM DATA EKOSISTEM",
  "PT. TELKOM PRIMA CIPTA CERTIFIA",
  "PT. TELKOM SATELIT INDONESIA",
  "SISINDOKOM",
  "SSH",
  "TELKOMSEL",
] as const;
export const getPmBySegment = (segment?: string | null): string => {
  if (!segment) return "";
  return segment.trim().toUpperCase() === "DGS" ? "Filipus Tito" : "Achadin";
};

export const PM_OPTIONS: readonly string[] = ["Filipus Tito", "Achadin"] as const;
export const JENIS_KONTRAK_OPTIONS: readonly string[] = [
  "KL",
  "SP",
  "WO",
  "NOPES",
  "SA",
  "KL Amandemen",
  "NOPES Amandemen",
] as const;
export const STATUS_OBL_OPTIONS: readonly string[] = [
  "KL/NOPES OK",
  "IN PROCESS",
  "P8 OK",
] as const;
export const STATUS_DELIVERY_OPTIONS: readonly string[] = [
  "Delivered",
  "In Process",
  "Hold",
] as const;
export const JENIS_DOK_DELIVERY_OPTIONS: readonly string[] = [
  "BAST",
  "BAPL",
] as const;
export const STATUS_DOK_DELIVERY_OPTIONS: readonly string[] = [
  "01 Closed",
  "02 Sirkulir TTD",
  "03 DR/Drafting",
  "04 Evidence",
  "05 Delivery NOK",
] as const;
export const HARDFILE_BAST_OPTIONS: readonly string[] = [
  "DONE",
  "IN PROCESS",
] as const;
export const STATUS_ORDER_OPTIONS: readonly string[] = [
  "01 BC",
  "02 Pending BASO",
  "03 Prov Issue",
] as const;
export const STATUS_GR_OPTIONS: readonly string[] = [
  "DONE",
  "IN PROCESS",
] as const;

export type FormFieldUpdater = <K extends keyof ProjectFormData>(
  field: K,
  value: ProjectFormData[K]
) => void;

