import ExcelJS from "exceljs";
import { normalizeOrdersData, flattenOrderSidPairs } from "./orderParser";
import { formatMonthYearKey, formatDateTime } from "./formatters";
import type { ProjectPM } from "@/types/project";

export type { ProjectPM };

export interface ExportColumnDef {
  key: string;
  header: string;
}

export interface ExportProjectsOptions {
  columns?: ExportColumnDef[];
  filename?: string;
  isTrashView?: boolean;
}

/**
 * Standard column titles for CSV / Excel exports fallback.
 */
export const EXPORT_COLUMN_HEADERS: Record<string, string> = {
  nomor: "No.",
  project_id_pm: "ID Project PM",
  tahun_kontrak: "Tahun Kontrak",
  witel: "Witel",
  segment: "Segment",
  nama_proyek: "Nama Proyek",
  nama_pelanggan: "Nama Pelanggan",
  nama_mitra: "Nama Mitra",
  pm: "PM",
  idlop: "IDLOP",
  status_email_handover: "Status Email Handover",
  note_email_handover: "Note Email Handover",
  status_dokumen_obl: "Status Dokumen OBL",
  jenis_kontrak: "Jenis Kontrak",
  nomor_kl_sp_wo_nopes: "Nomor KL/SP/WO/NOPES",
  tgl_kontrak: "Tgl Kontrak",
  nilai_kontrak_obl: "Nilai Kontrak OBL",
  quote_number: "Quote Number",
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
  sla_bast: "Waktu Penyelesaian BAST",
  waktu_penyelesaian_bast: "Waktu Penyelesaian BAST",
  status_order: "Status Order",
  status_gr: "Status GR",
  bulan_bc: "Bulan BC",
  komitmen_bc: "Komitmen BC",
  ket_update: "Ket Update",
  file_bast: "File BAST",
  file_bapl: "File BAPL",
  hardfile_bast: "Hardfile BAST",
  created_at: "Created At",
  updated_at: "Updated At",
};

/**
 * Ordered fallback column keys to export (excluding UI-only action column).
 */
export const EXPORT_COLUMN_KEYS = Object.keys(EXPORT_COLUMN_HEADERS);

const CENTER_ALIGNED_KEYS = new Set([
  "nomor",
  "project_id_pm",
  "tahun_kontrak",
  "witel",
  "segment",
  "pm",
  "idlop",
  "status_email_handover",
  "status_dokumen_obl",
  "jenis_kontrak",
  "tgl_kontrak",
  "quote_number",
  "no_order",
  "sid",
  "status_delivery_project",
  "jenis_dok_delivery",
  "status_dokumen_delivery",
  "id_digireview",
  "tanggal_request_dr",
  "tanggal_close_dr",
  "tanggal_bast",
  "tahun_bast",
  "sla_bast",
  "waktu_penyelesaian_bast",
  "status_order",
  "status_gr",
  "bulan_bc",
  "komitmen_bc",
  "hardfile_bast",
  "created_at",
  "updated_at",
]);

// Telkom enterprise styling palette
const TELKOM_NAVY_ARGB = "FF002B66";
const WHITE_ARGB = "FFFFFFFF";
const BORDER_GRAY_ARGB = "FFD1D5DB";
const ZEBRA_BG_ARGB = "FFF8FAFC";

const CELL_BORDER: Partial<ExcelJS.Borders> = {
  top: { style: "thin", color: { argb: BORDER_GRAY_ARGB } },
  left: { style: "thin", color: { argb: BORDER_GRAY_ARGB } },
  bottom: { style: "thin", color: { argb: BORDER_GRAY_ARGB } },
  right: { style: "thin", color: { argb: BORDER_GRAY_ARGB } },
};

/**
 * Performs Tabular Row Duplication on project rows:
 * For multi-Order / multi-SID projects, each (Order ID, SID) pair gets its own row
 * when Order/SID columns are visible. If neither is visible, duplication is skipped.
 */
export function buildDenormalizedExportRows(
  projects: ProjectPM[],
  activeKeys?: string[]
): Array<Record<string, unknown>> {
  const flattenedRows: Array<Record<string, unknown>> = [];
  const shouldDuplicatePairs = activeKeys
    ? activeKeys.includes("no_order") || activeKeys.includes("sid")
    : true;

  let exportSeq = 1;

  for (const project of projects) {
    if (!shouldDuplicatePairs) {
      flattenedRows.push({
        ...project,
        nomor: exportSeq++,
      });
      continue;
    }

    const pairs = flattenOrderSidPairs(normalizeOrdersData(project));

    if (pairs.length === 0) {
      flattenedRows.push({
        ...project,
        nomor: exportSeq++,
        no_order: "",
        sid: "",
      });
      continue;
    }

    for (const pair of pairs) {
      const formattedOrder = pair.order_label
        ? `${pair.order_label} : ${pair.order_id}`
        : pair.order_id;

      const formattedSid = pair.sid_label
        ? pair.sid_label.startsWith("(")
          ? `${pair.sid} ${pair.sid_label}`
          : /^(lama|baru|old|new)$/i.test(pair.sid_label)
          ? `${pair.sid_label} : ${pair.sid}`
          : `${pair.sid} - ${pair.sid_label}`
        : pair.sid;

      flattenedRows.push({
        ...project,
        nomor: exportSeq++,
        no_order: formattedOrder,
        sid: formattedSid,
      });
    }
  }

  return flattenedRows;
}

/**
 * Formats row item fields for export (SLA calculation, boolean normalization, dates, and currencies).
 */
export function formatRowValues(
  item: Record<string, unknown>,
  activeColumns: ExportColumnDef[],
  isTrashView?: boolean
): Record<string, unknown> {
  const rowObj: Record<string, unknown> = {};

  for (const col of activeColumns) {
    const key = col.key;
    let val = item[key];

    // Handle accessorKey fallback for sla_bast
    if (val === undefined && key === "sla_bast") {
      val = item["waktu_penyelesaian_bast"];
    }

    // Compute SLA difference dynamically if not pre-calculated
    if ((key === "sla_bast" || key === "waktu_penyelesaian_bast") && val == null) {
      if (item.tanggal_request_dr && item.tanggal_close_dr) {
        const d1 = new Date(String(item.tanggal_request_dr));
        const d2 = new Date(String(item.tanggal_close_dr));
        if (!isNaN(d1.getTime()) && !isNaN(d2.getTime())) {
          val = Math.ceil(Math.abs(d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24));
        }
      }
    }

    // Normalize boolean/status values for status_email_handover
    if (key === "status_email_handover") {
      if (val === true || String(val).toLowerCase() === "true") val = "OK";
      else if (val === false || String(val).toLowerCase() === "false") val = "NOK";
    }

    // Normalize boolean/status values for hardfile_bast
    if (key === "hardfile_bast") {
      if (val === true || String(val).toLowerCase() === "true") val = "ADA";
      else if (val === false || String(val).toLowerCase() === "false") val = "TIDAK ADA";
    }

    // Numeric parsing for contract value
    if (key === "nilai_kontrak_obl") {
      const num = typeof val === "number" ? val : parseFloat(String(val));
      val = !isNaN(num) ? num : null;
    }

    // Clean date values to YYYY-MM-DD
    if (
      (key === "tgl_kontrak" ||
        key === "tanggal_request_dr" ||
        key === "tanggal_close_dr" ||
        key === "tanggal_bast") &&
      val
    ) {
      val = String(val).split("T")[0];
    }

    // Month-Year localized representation
    if ((key === "bulan_bc" || key === "komitmen_bc") && val) {
      val = formatMonthYearKey(String(val));
    }

    // Datetime formatting for created_at and updated_at
    if ((key === "created_at" || key === "updated_at") && val) {
      val = formatDateTime(String(val));
    }

    // In trash view, map updated_at to deleted_at timestamp
    if (key === "updated_at" && isTrashView) {
      val = item.deleted_at ? formatDateTime(String(item.deleted_at)) : val;
    }

    rowObj[key] = val != null ? val : "";
  }

  return rowObj;
}

/**
 * Escapes a cell value conforming to RFC 4180 standard for CSV.
 */
export function escapeCsvCell(val: unknown): string {
  if (val == null) return "";
  const str = String(val);
  if (str.includes('"') || str.includes(",") || str.includes("\n") || str.includes("\r")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/**
 * Applies corporate styling, header design, borders, and number formats to worksheet.
 */
function applyWorksheetStyles(
  worksheet: ExcelJS.Worksheet,
  totalRows: number,
  activeColumns: ExportColumnDef[]
): void {
  // 1. Freeze top header row
  worksheet.views = [{ state: "frozen", ySplit: 1, activeCell: "A2" }];

  // 2. Style Header Row (Row 1)
  const headerRow = worksheet.getRow(1);
  headerRow.height = 30;

  headerRow.eachCell({ includeEmpty: true }, (cell) => {
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: TELKOM_NAVY_ARGB },
    };
    cell.font = {
      name: "Arial",
      size: 10,
      bold: true,
      color: { argb: WHITE_ARGB },
    };
    cell.alignment = {
      vertical: "middle",
      horizontal: "center",
      wrapText: false,
    };
    cell.border = CELL_BORDER;
  });

  // 3. Style Data Rows (Row 2 to totalRows + 1)
  for (let rowIdx = 2; rowIdx <= totalRows + 1; rowIdx++) {
    const row = worksheet.getRow(rowIdx);
    row.height = 22;
    const isZebra = rowIdx % 2 === 1;

    row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
      const colDef = activeColumns[colNumber - 1];
      const colKey = colDef ? colDef.key : "";

      cell.font = {
        name: "Arial",
        size: 9.5,
        color: { argb: "FF1E293B" },
      };

      cell.border = CELL_BORDER;

      if (isZebra) {
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: ZEBRA_BG_ARGB },
        };
      }

      // Column-specific alignment and number formatting
      if (colKey === "nilai_kontrak_obl") {
        cell.alignment = { vertical: "middle", horizontal: "right" };
        cell.numFmt = '"Rp"#,##0;("Rp"#,##0);"-"';
      } else if (colKey === "sla_bast" || colKey === "waktu_penyelesaian_bast") {
        cell.alignment = { vertical: "middle", horizontal: "center" };
        if (typeof cell.value === "number") {
          cell.numFmt = '0" Hari"';
        }
      } else if (CENTER_ALIGNED_KEYS.has(colKey)) {
        cell.alignment = { vertical: "middle", horizontal: "center" };
      } else {
        cell.alignment = { vertical: "middle", horizontal: "left" };
      }
    });
  }
}

/**
 * Calculates and applies dynamic auto-fit column widths with safe padding boundaries.
 */
function autoFitColumnWidths(
  worksheet: ExcelJS.Worksheet,
  rows: Array<Record<string, unknown>>,
  activeColumns: ExportColumnDef[]
): void {
  activeColumns.forEach((colDef, idx) => {
    const key = colDef.key;
    const headerTitle = colDef.header || key;
    let maxLen = headerTitle.length;

    for (const row of rows) {
      const val = row[key];
      if (val != null) {
        let strVal = String(val);
        if (key === "nilai_kontrak_obl" && typeof val === "number") {
          strVal = `Rp ${val.toLocaleString("id-ID")}`;
        }
        if (strVal.length > maxLen) {
          maxLen = strVal.length;
        }
      }
    }

    const col = worksheet.getColumn(idx + 1);
    col.width = Math.min(60, Math.max(12, maxLen + 4));
  });
}

/**
 * Exports project records to authentic Microsoft Excel (.xlsx) format
 * matching the current table view (visible columns, column ordering, filters, search, and sorting).
 */
export async function exportProjectsToExcel(
  projects: ProjectPM[],
  options?: ExportProjectsOptions
): Promise<void> {
  const activeColumns: ExportColumnDef[] =
    options?.columns && options.columns.length > 0
      ? options.columns
      : EXPORT_COLUMN_KEYS.map((key) => ({
          key,
          header: EXPORT_COLUMN_HEADERS[key] || key,
        }));

  const activeKeys = activeColumns.map((c) => c.key);
  const denormalizedRows = buildDenormalizedExportRows(projects, activeKeys);

  const defaultFilename =
    options?.filename ||
    `Projects_PM_Export_${new Date().toISOString().slice(0, 10)}.xlsx`;

  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Telkom RSO Area 1";
  workbook.lastModifiedBy = "Project Management Dashboard";
  workbook.created = new Date();
  workbook.modified = new Date();

  const worksheet = workbook.addWorksheet(
    options?.isTrashView ? "Trash Projects" : "Master Repository"
  );

  // 1. Set column definitions matching active visible columns
  worksheet.columns = activeColumns.map((col) => ({
    header: col.header,
    key: col.key,
  }));

  // 2. Add formatted data rows
  for (const item of denormalizedRows) {
    const rowObj = formatRowValues(item, activeColumns, options?.isTrashView);
    worksheet.addRow(rowObj);
  }

  // 3. Apply corporate styles and dynamic column auto-fit
  applyWorksheetStyles(worksheet, denormalizedRows.length, activeColumns);
  autoFitColumnWidths(worksheet, denormalizedRows, activeColumns);

  // 4. Generate binary buffer and trigger browser download
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", defaultFilename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Exports project records to standard comma-separated values (.csv) format
 * matching the current table view (visible columns, column ordering, filters, search, and sorting)
 * with RFC 4180 escaping and UTF-8 BOM encoding for Microsoft Excel compatibility.
 */
export function exportProjectsToCsv(
  projects: ProjectPM[],
  options?: ExportProjectsOptions
): void {
  const activeColumns: ExportColumnDef[] =
    options?.columns && options.columns.length > 0
      ? options.columns
      : EXPORT_COLUMN_KEYS.map((key) => ({
          key,
          header: EXPORT_COLUMN_HEADERS[key] || key,
        }));

  const activeKeys = activeColumns.map((c) => c.key);
  const denormalizedRows = buildDenormalizedExportRows(projects, activeKeys);

  const defaultFilename =
    options?.filename ||
    `Projects_PM_Export_${new Date().toISOString().slice(0, 10)}.csv`;

  // 1. Build Header line with active columns
  const headerLine = activeColumns
    .map((col) => escapeCsvCell(col.header))
    .join(",");

  // 2. Build Data lines matching visible column order
  const dataLines = denormalizedRows.map((item) => {
    const formattedRow = formatRowValues(item, activeColumns, options?.isTrashView);
    return activeColumns
      .map((col) => {
        let val = formattedRow[col.key];
        if (
          (col.key === "sla_bast" || col.key === "waktu_penyelesaian_bast") &&
          typeof val === "number"
        ) {
          val = `${val} Hari`;
        }
        return escapeCsvCell(val);
      })
      .join(",");
  });

  const csvContent = [headerLine, ...dataLines].join("\r\n");

  // 3. UTF-8 BOM (\uFEFF) ensures proper character rendering in Microsoft Excel & text editors
  const blob = new Blob(["\uFEFF" + csvContent], {
    type: "text/csv;charset=utf-8;",
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", defaultFilename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
