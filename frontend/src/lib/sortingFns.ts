import type { Row, SortingFn } from "@tanstack/react-table";
import type { ProjectPM } from "@/types/project";

/**
 * Case-insensitive natural alphanumeric sorting function (A-Z / Z-A).
 */
export const textSortFn: SortingFn<ProjectPM> = (rowA, rowB, columnId) => {
  const valA = rowA.getValue(columnId);
  const valB = rowB.getValue(columnId);
  const strA = valA != null ? String(valA).trim() : "";
  const strB = valB != null ? String(valB).trim() : "";
  if (!strA && !strB) return 0;
  if (!strA) return 1;
  if (!strB) return -1;
  return strA.localeCompare(strB, "id", { sensitivity: "base", numeric: true });
};

/**
 * Chronological date sorting function (earliest to latest / latest to earliest).
 */
export const dateSortFn: SortingFn<ProjectPM> = (rowA, rowB, columnId) => {
  const valA = rowA.getValue(columnId);
  const valB = rowB.getValue(columnId);
  const timeA = valA ? new Date(String(valA)).getTime() : NaN;
  const timeB = valB ? new Date(String(valB)).getTime() : NaN;
  const hasA = !isNaN(timeA);
  const hasB = !isNaN(timeB);
  if (!hasA && !hasB) return 0;
  if (!hasA) return 1;
  if (!hasB) return -1;
  return timeA - timeB;
};

/**
 * Numeric sorting function for numbers and year fields (smallest to largest / largest to smallest).
 */
export const numericSortFn: SortingFn<ProjectPM> = (rowA, rowB, columnId) => {
  const valA = rowA.getValue(columnId);
  const valB = rowB.getValue(columnId);
  const numA = valA != null && valA !== "" ? Number(valA) : NaN;
  const numB = valB != null && valB !== "" ? Number(valB) : NaN;
  const hasA = !isNaN(numA);
  const hasB = !isNaN(numB);
  if (!hasA && !hasB) return 0;
  if (!hasA) return 1;
  if (!hasB) return -1;
  return numA - numB;
};

/**
 * SLA duration sorting function for waktu_penyelesaian_bast (smallest days to largest days).
 * Computes on-the-fly difference between request DR and close DR if DB field is null.
 */
export const slaBastSortFn: SortingFn<ProjectPM> = (rowA, rowB) => {
  const getSla = (row: Row<ProjectPM>): number => {
    const dbVal = row.original.waktu_penyelesaian_bast;
    if (dbVal != null) {
      const parsed = Number(dbVal);
      if (!isNaN(parsed)) return parsed;
    }
    const req = row.original.tanggal_request_dr;
    const close = row.original.tanggal_close_dr;
    if (req && close) {
      const tReq = new Date(req).getTime();
      const tClose = new Date(close).getTime();
      if (!isNaN(tReq) && !isNaN(tClose)) {
        return Math.ceil(Math.abs(tClose - tReq) / (1000 * 60 * 60 * 24));
      }
    }
    return NaN;
  };

  const numA = getSla(rowA);
  const numB = getSla(rowB);
  const hasA = !isNaN(numA);
  const hasB = !isNaN(numB);
  if (!hasA && !hasB) return 0;
  if (!hasA) return 1;
  if (!hasB) return -1;
  return numA - numB;
};
