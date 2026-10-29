import ExcelJS from "exceljs";
import { normalizeOrdersData, flattenOrderSidPairs } from "./orderParser";
import type { ProjectPM } from "@/types/project";

export type { ProjectPM };

/**
 * Standard column titles for CSV / Excel exports.
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
  waktu_penyelesaian_bast: "Waktu Penyelesaian BAST",
  status_order: "Status Order",
  status_gr: "Status GR",
  bulan_bc: "Bulan BC",
  komitmen_bc: "Komitmen BC",
  ket_update: "Ket Update",
  file_bast: "File BAST",
  file_bapl: "File BAPL",
};

/**
 * Ordered column keys to export (excluding UI-only action column).
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
  "status_dokumen_delivery",
  "id_digireview",
  "tanggal_request_dr",
  "tanggal_close_dr",
  "tanggal_bast",
  "tahun_bast",
  "waktu_penyelesaian_bast",
  "status_order",
  "status_gr",
  "bulan_bc",
  "komitmen_bc",
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
 * while duplicating all parent project metadata identically.
 */
export function buildDenormalizedExportRows(projects: ProjectPM[]): Array<Record<string, unknown>> {
  const flattenedRows: Array<Record<string, unknown>> = [];

  let exportSeq = 1;

  for (const project of projects) {
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
 * Applies corporate styling, header design, borders, and number formats to worksheet.
 */
function applyWorksheetStyles(worksheet: ExcelJS.Worksheet, totalRows: number): void {
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
      const colKey = EXPORT_COLUMN_KEYS[colNumber - 1];

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
      } else if (CENTER_ALIGNED_KEYS.has(colKey)) {
        cell.alignment = { vertical: "middle", horizontal: "center" };
      } else {
        cell.alignment = { vertical: "middle", horizontal: "left" };
      }
    });
  }
}

/**
 * Calculates and applies dynamic auto-fit column widths with padding.
 */
function autoFitColumnWidths(worksheet: ExcelJS.Worksheet, rows: Array<Record<string, unknown>>): void {
  EXPORT_COLUMN_KEYS.forEach((key, idx) => {
    const headerTitle = EXPORT_COLUMN_HEADERS[key] || key;
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
 * complete with corporate styling, proper number formatting, and Tabular Row Duplication.
 */
export async function exportProjectsToExcel(
  projects: ProjectPM[],
  filename?: string
): Promise<void> {
  const denormalizedRows = buildDenormalizedExportRows(projects);
  const defaultFilename =
    filename || `Projects_PM_Export_${new Date().toISOString().slice(0, 10)}.xlsx`;

  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Telkom RSO Area 1";
  workbook.lastModifiedBy = "Project Management Dashboard";
  workbook.created = new Date();
  workbook.modified = new Date();

  const worksheet = workbook.addWorksheet("Master Repository");

  // 1. Set column definitions
  worksheet.columns = EXPORT_COLUMN_KEYS.map((key) => ({
    header: EXPORT_COLUMN_HEADERS[key] || key,
    key: key,
  }));

  // 2. Add data rows
  for (const item of denormalizedRows) {
    const rowObj: Record<string, unknown> = {};
    for (const key of EXPORT_COLUMN_KEYS) {
      let val = item[key];

      if (key === "status_email_handover") {
        if (val === true) val = "OK";
        else if (val === false) val = "NOK";
      }

      if (key === "nilai_kontrak_obl") {
        const num = typeof val === "number" ? val : parseFloat(String(val));
        val = !isNaN(num) ? num : null;
      }

      if (
        (key === "tgl_kontrak" ||
          key === "tanggal_request_dr" ||
          key === "tanggal_close_dr" ||
          key === "tanggal_bast" ||
          key === "komitmen_bc") &&
        val
      ) {
        val = String(val).split("T")[0];
      }

      rowObj[key] = val != null ? val : "";
    }
    worksheet.addRow(rowObj);
  }

  // 3. Apply navy color styling and dynamic column widths
  applyWorksheetStyles(worksheet, denormalizedRows.length);
  autoFitColumnWidths(worksheet, denormalizedRows);

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
