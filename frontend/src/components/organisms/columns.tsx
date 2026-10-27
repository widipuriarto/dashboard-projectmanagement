import type { ColumnDef } from "@tanstack/react-table";
import { StatusBadge } from "@/components/atoms/StatusBadge";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, ArrowUp, ArrowDown } from "lucide-react";
import { MicrosoftTeamsIcon } from "@/components/atoms/MicrosoftTeamsIcon";
import { cn } from "@/lib/utils";

export type ProjectPM = Record<string, any>;

// Top-level singleton formatters to prevent garbage collection pauses during virtual scrolling
export const idrCurrencyFormatter = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});

export const monthYearFormatter = new Intl.DateTimeFormat("id-ID", {
  month: "long",
  year: "numeric",
});

export const dateTimeFormatter = new Intl.DateTimeFormat("id-ID", {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
});

export const formatDateTime = (val?: string | null): string => {
  if (!val) return "-";
  const date = new Date(val);
  if (isNaN(date.getTime())) return String(val);
  return dateTimeFormatter.format(date);
};

const formatMonthYear = (val?: string | null) => {
  if (!val) return <span className="text-slate-400">-</span>;
  const match = String(val).match(/^(\d{4})-(\d{2})/);
  if (match) {
    const year = parseInt(match[1], 10);
    const month = parseInt(match[2], 10) - 1;
    const date = new Date(year, month, 1);
    return (
      <span className="font-medium text-slate-700">
        {monthYearFormatter.format(date)}
      </span>
    );
  }
  const date = new Date(val);
  if (isNaN(date.getTime())) return <span>{val}</span>;
  return (
    <span className="font-medium text-slate-700">
      {monthYearFormatter.format(date)}
    </span>
  );
};


export const MANDATORY_COLUMN_IDS = ["actions", "nomor", "project_id_pm"] as const;

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
  actions: "Aksi",
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
};

export function getColumnDisplayTitle(columnId: string): string {
  if (COLUMN_DISPLAY_TITLES[columnId]) {
    return COLUMN_DISPLAY_TITLES[columnId];
  }
  return columnId
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export const multiSelectFilterFn = (
  row: any,
  columnId: string,
  filterValues: string[]
): boolean => {
  if (!filterValues || filterValues.length === 0) return true;
  const rawValue = row.getValue(columnId);
  const cellValue = rawValue != null && String(rawValue).trim() !== "" ? String(rawValue).trim() : "-";
  return filterValues.includes(cellValue);
};

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

export const slaBastFilterFn = (
  row: any,
  _columnId: string,
  filterValues: string[]
): boolean => {
  if (!filterValues || filterValues.length === 0) return true;
  const dbVal = row.getValue("waktu_penyelesaian_bast");
  const cat = dbVal != null
    ? getSlaCategory(Number(dbVal))
    : getSlaCategory(
        row.original.tanggal_request_dr,
        row.original.tanggal_close_dr
      );
  return filterValues.includes(cat);
};

export const formatMonthYearKey = (val?: string | null): string => {
  if (!val) return "-";
  const match = String(val).match(/^(\d{4})-(\d{2})/);
  if (match) {
    const year = parseInt(match[1], 10);
    const month = parseInt(match[2], 10) - 1;
    const date = new Date(year, month, 1);
    return monthYearFormatter.format(date);
  }
  const date = new Date(val);
  if (isNaN(date.getTime())) return String(val).trim() || "-";
  return monthYearFormatter.format(date);
};

export const monthYearFilterFn = (
  row: any,
  columnId: string,
  filterValues: string[]
): boolean => {
  if (!filterValues || filterValues.length === 0) return true;
  const raw = row.getValue(columnId);
  const formatted = formatMonthYearKey(raw);
  return filterValues.includes(formatted);
};

export interface FilterCategory {
  id: string;
  label: string;
}

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

export const sortProjectByIdPm = (rowA: any, rowB: any, columnId: string): number => {
  const getNum = (id: string) => {
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

export function ProjectIdSortHeader({ column }: { column: any }) {
  const isDesc = column.getIsSorted() === "desc";

  const handleToggle = () => {
    column.toggleSorting(!isDesc);
  };

  return (
    <div className="relative flex items-center justify-center w-full min-h-[26px]">
      <button
        type="button"
        data-testid="sort-project-id"
        onClick={handleToggle}
        className={cn(
          "absolute -left-2.5 top-1/2 -translate-y-1/2 h-6.5 w-6.5 inline-flex items-center justify-center rounded-md transition-all cursor-pointer select-none outline-none",
          "bg-transparent text-telkom-navy border border-transparent",
          "hover:bg-white hover:shadow-2xs active:bg-slate-200/60 focus-visible:ring-2 focus-visible:ring-telkom-navy/30"
        )}
        title={
          isDesc
            ? "Urutan: Descending (Klik untuk Ascending)"
            : "Urutan: Ascending (Klik untuk Descending)"
        }
        aria-label="Toggle sort order"
      >
        {isDesc ? (
          <ArrowUp className="h-3.5 w-3.5 stroke-[2.5] text-telkom-navy" />
        ) : (
          <ArrowDown className="h-3.5 w-3.5 stroke-[2.5] text-telkom-navy" />
        )}
      </button>

      <span className="font-semibold text-telkom-navy select-none text-center">
        ID PROJECT PM
      </span>
    </div>
  );
}

export interface ProjectTableMeta {
  onEdit?: (project: ProjectPM) => void;
  onDelete?: (project: ProjectPM) => void;
}

export const columns: ColumnDef<ProjectPM>[] = [
  {
    id: "actions",
    enableHiding: false,
    header: () => <div className="text-center">Aksi</div>,
    cell: ({ row, table }) => {
      const meta = table.options.meta as ProjectTableMeta | undefined;
      return (
        <div className="flex items-center gap-2">
          <Button
            data-testid="row-actions-edit"
            variant="ghost"
            className="h-8 w-8 p-0 rounded-md cursor-pointer text-blue-500 hover:text-blue-700 hover:bg-blue-100 transition-colors"
            onClick={() => meta?.onEdit?.(row.original)}
            title="Edit Proyek"
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            data-testid="row-actions-delete"
            variant="ghost"
            className="h-8 w-8 p-0 rounded-md cursor-pointer text-red-500 hover:text-red-700 hover:bg-red-100 transition-colors"
            onClick={() => meta?.onDelete?.(row.original)}
            title="Hapus Proyek"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      );
    },
    size: 100,
  },
  {
    id: "nomor",
    enableHiding: false,
    header: () => <div className="text-center">No.</div>,
    cell: ({ row, table }) => {
      const sortedIdx = table.getRowModel().rows.findIndex((r) => r.id === row.id);
      return <div className="text-center font-medium">{sortedIdx >= 0 ? sortedIdx + 1 : row.index + 1}</div>;
    },
    size: 60,
  },
  {
    accessorKey: "project_id_pm",
    enableHiding: false,
    sortingFn: sortProjectByIdPm,
    header: ({ column }) => <ProjectIdSortHeader column={column} />,
    cell: ({ row }) => <div className="text-center font-mono font-medium">{row.getValue("project_id_pm") || "-"}</div>,
    size: 200,
    minSize: 175,
  },
  {
    accessorKey: "segment",
    filterFn: multiSelectFilterFn,
    header: () => <div className="text-center">SEGMENT</div>,
    cell: ({ row }) => <div className="text-center">{row.getValue("segment") || "-"}</div>,
    size: 100,
  },
  {
    accessorKey: "witel",
    filterFn: multiSelectFilterFn,
    header: () => <div className="text-center">WITEL</div>,
    cell: ({ row }) => <div className="text-left">{row.getValue("witel") || "-"}</div>,
    size: 180,
    minSize: 160,
  },
  {
    accessorKey: "nama_proyek",
    header: "Nama Proyek",
    size: 550,
  },
  {
    accessorKey: "nama_mitra",
    header: "Nama Mitra",
    size: 250,
  },
  {
    accessorKey: "nama_pelanggan",
    header: "Nama Pelanggan",
    size: 350,
},
{
  accessorKey: "idlop",
  header: "IDLOP",
  size: 200,
},
  {
    accessorKey: "jenis_kontrak",
    filterFn: multiSelectFilterFn,
    header: () => <div className="text-center">Jenis Kontrak</div>,
    cell: ({ row }) => {
      const val = (row.getValue("jenis_kontrak") as string) || "-";
      return (
        <div className="flex justify-center">
          {val !== "-" ? <StatusBadge variant="default">{val}</StatusBadge> : <span className="text-slate-400">-</span>}
        </div>
      );
    },
    size: 150,
  },
  {
    accessorKey: "nomor_kl_sp_wo_nopes",
    header: "Nomor KL/SP/WO/NOPES",
    size: 350,
  },
  {
    accessorKey: "tgl_kontrak",
    header: () => <div className="text-center">Tgl Kontrak</div>,
    cell: ({ row }) => <div className="text-center">{row.getValue("tgl_kontrak") || "-"}</div>,
    size: 150,
  },
  {
    accessorKey: "tahun_kontrak",
    filterFn: multiSelectFilterFn,
    header: () => <div className="text-center">Tahun Kontrak</div>,
    cell: ({ row }) => <div className="text-center">{row.getValue("tahun_kontrak") || "-"}</div>,
    size: 150,
  },
  {
    accessorKey: "nilai_kontrak_obl",
    header: () => <div className="text-center">Nilai Kontrak OBL</div>,
    size: 180,
    cell: ({ row }) => {
      const val = row.getValue("nilai_kontrak_obl") as number;
      return (
        <div className="text-right font-medium">
          {val ? idrCurrencyFormatter.format(val) : "-"}
        </div>
      );
    },
  },
  {
    accessorKey: "quote_number",
    header: () => <div className="text-center">Quote Number</div>,
    cell: ({ row }) => <div className="text-center">{row.getValue("quote_number") || "-"}</div>,
    size: 150,
  },
  {
    accessorKey: "status_email_handover",
    header: () => <div className="text-center">STATUS EMAIL HANDOVER</div>,
    cell: ({ row }) => {
      const val = row.getValue("status_email_handover");
      if (val === true || val === "OK" || String(val).toLowerCase() === "true") {
        return (
          <div className="flex justify-center">
            <StatusBadge variant="success">OK</StatusBadge>
          </div>
        );
      }
      if (val === false || val === "NOK" || String(val).toLowerCase() === "false") {
        return (
          <div className="flex justify-center">
            <StatusBadge variant="destructive">NOK</StatusBadge>
          </div>
        );
      }
      return <div className="text-center text-slate-400">-</div>;
    },
    size: 220,
  },
  {
    accessorKey: "note_email_handover",
    header: "Note Email Hand Over",
    size: 300,
  },
  {
    accessorKey: "status_dokumen_obl",
    filterFn: multiSelectFilterFn,
    header: () => <div className="text-center">Status Dokumen OBL</div>,
    size: 220,
    cell: ({ row }) => {
      const status = (row.getValue("status_dokumen_obl") as string) || "-";
      const lower = status.toLowerCase();
      const variant = lower.includes("ok") ? "success"
                    : lower.includes("process") ? "warning"
                    : "default";
      return (
        <div className="flex justify-center">
          {status !== "-" ? <StatusBadge variant={variant}>{status}</StatusBadge> : <span className="text-slate-400">-</span>}
        </div>
      );
    },
  },
  {
    accessorKey: "no_order",
    header: () => <div className="text-center">No Order</div>,
    cell: ({ row }) => <div className="text-center">{row.getValue("no_order") || "-"}</div>,
    size: 150,
  },
  {
    accessorKey: "sid",
    header: "SID",
    size: 150,
  },
  {
    accessorKey: "jenis_layanan",
    header: "JENIS LAYANAN",
    size: 150,
  },
  {
    accessorKey: "status_delivery_project",
    filterFn: multiSelectFilterFn,
    header: () => <div className="text-center">Status Delivery Project</div>,
    size: 220,
    cell: ({ row }) => {
      const status = (row.getValue("status_delivery_project") as string) || "-";
      const lower = status.toLowerCase();
      const variant = lower.includes("delivered") || lower.includes("closed") || lower.includes("done") || lower.includes("complete") ? "success" 
                    : lower.includes("in process") || lower.includes("pending") || lower.includes("progress") || lower.includes("on going") ? "warning" 
                    : lower.includes("hold") ? "destructive"
                    : "default";
      return (
        <div className="flex justify-center">
          {status !== "-" ? <StatusBadge variant={variant}>{status}</StatusBadge> : <span className="text-slate-400">-</span>}
        </div>
      );
    },
  },
  {
    accessorKey: "jenis_dok_delivery",
    header: () => <div className="text-center">JENIS DOK DELIVERY</div>,
    cell: ({ row }) => <div className="text-center">{row.getValue("jenis_dok_delivery") || "-"}</div>,
    size: 200,
  },
  {
    accessorKey: "status_dokumen_delivery",
    filterFn: multiSelectFilterFn,
    header: () => <div className="text-center">Status Dokumen Delivery</div>,
    size: 200,
    cell: ({ row }) => {
      const status = (row.getValue("status_dokumen_delivery") as string) || "Unknown";
      const variant = status.toLowerCase().includes("closed") ? "success" 
                    : status.toLowerCase().includes("pending") ? "warning" 
                    : "default";
      return (
        <div className="flex justify-center">
          <StatusBadge variant={variant}>{status}</StatusBadge>
        </div>
      );
    },
  },
  {
    accessorKey: "id_digireview",
    header: () => <div className="text-center">ID DIGIREVIEW</div>,
    cell: ({ row }) => <div className="text-center">{row.getValue("id_digireview") || "-"}</div>,
    size: 150,
  },
  {
    accessorKey: "tanggal_request_dr",
    header: () => <div className="text-center">Tanggal Request DR</div>,
    cell: ({ row }) => <div className="text-center">{row.getValue("tanggal_request_dr") || "-"}</div>,
    size: 200,
  },
  {
    accessorKey: "tanggal_close_dr",
    header: () => <div className="text-center">Tanggal Close DR</div>,
    cell: ({ row }) => <div className="text-center">{row.getValue("tanggal_close_dr") || "-"}</div>,
    size: 150,
  },
  {
    accessorKey: "no_bast_telkom",
    header: "No BAST Telkom",
    size: 300,
  },
  {
    accessorKey: "tanggal_bast",
    header: () => <div className="text-center">Tanggal BAST</div>,
    cell: ({ row }) => <div className="text-center">{row.getValue("tanggal_bast") || "-"}</div>,
    size: 140,
  },
  {
    accessorKey: "tahun_bast",
    filterFn: multiSelectFilterFn,
    header: () => <div className="text-center">Tahun BAST</div>,
    cell: ({ row }) => <div className="text-center">{row.getValue("tahun_bast") || "-"}</div>,
    size: 140,
  },
  {
    accessorKey: "pm",
    filterFn: multiSelectFilterFn,
    header: () => <div className="text-center">PM</div>,
    cell: ({ row }) => {
      const val = (row.getValue("pm") as string) || "-";
      return (
        <div className="flex justify-center">
          {val !== "-" ? <StatusBadge variant="default">{val}</StatusBadge> : <span className="text-slate-400">-</span>}
        </div>
      );
    },
    size: 140,
  },
  {
    id: "sla_bast",
    accessorKey: "waktu_penyelesaian_bast",
    filterFn: slaBastFilterFn,
    header: () => <div className="text-center">Waktu Penyelesaian BAST</div>,
    size: 220,
    cell: ({ row }) => {
      const dbVal = row.getValue("waktu_penyelesaian_bast");
      let diffDays: number | null = dbVal != null ? Number(dbVal) : null;

      if (diffDays === null) {
        const reqDrStr = row.original.tanggal_request_dr;
        const closeDrStr = row.original.tanggal_close_dr;
        if (reqDrStr && closeDrStr) {
          const reqDate = new Date(reqDrStr);
          const closeDate = new Date(closeDrStr);
          if (!isNaN(reqDate.getTime()) && !isNaN(closeDate.getTime())) {
            const diffTime = Math.abs(closeDate.getTime() - reqDate.getTime());
            diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          }
        }
      }

      if (diffDays === null || isNaN(diffDays)) {
        return <div className="text-center text-slate-400">-</div>;
      }
      
      let variant: "success" | "warning" | "destructive" = "success";
      if (diffDays >= 8 && diffDays <= 10) {
        variant = "warning";
      } else if (diffDays > 10) {
        variant = "destructive";
      }
      
      return (
        <div className="flex justify-center">
          <StatusBadge variant={variant}>
            {diffDays} Hari
          </StatusBadge>
        </div>
      );
    }
  },
  {
    accessorKey: "ket_update",
    header: "KET UPDATE",
    size: 150,
  },
  {
    accessorKey: "status_order",
    filterFn: multiSelectFilterFn,
    header: () => <div className="text-center">STATUS ORDER</div>,
    cell: ({ row }) => {
      const status = (row.getValue("status_order") as string) || "-";
      const lower = status.toLowerCase();
      const variant = lower.includes("01 bc") || lower.includes("closing") || lower.includes("closed") || lower.includes("done") || lower.includes("complete") ? "success" 
                    : lower.includes("pending") || lower.includes("progress") ? "warning" 
                    : lower.includes("issue") ? "destructive"
                    : "default";
      return (
        <div className="flex justify-center">
          {status !== "-" ? <StatusBadge variant={variant}>{status}</StatusBadge> : <span className="text-slate-400">-</span>}
        </div>
      );
    },
    size: 180,
  },
  {
    accessorKey: "komitmen_bc",
    filterFn: monthYearFilterFn,
    header: () => <div className="text-center">KOMITMEN BC</div>,
    size: 160,
    cell: ({ row }) => <div className="text-center">{formatMonthYear(row.getValue("komitmen_bc"))}</div>,
  },
  {
    accessorKey: "bulan_bc",
    filterFn: monthYearFilterFn,
    header: () => <div className="text-center">Bulan BC</div>,
    size: 160,
    cell: ({ row }) => <div className="text-center">{formatMonthYear(row.getValue("bulan_bc"))}</div>,
  },
  {
    accessorKey: "file_bast",
    header: () => <div className="text-center">File BAST</div>,
    size: 150,
    cell: ({ row }) => {
      const url = row.getValue("file_bast") as string;
      if (!url) return <div className="flex justify-center"><span className="text-slate-400">-</span></div>;
      return (
        <div className="flex justify-center">
          <Button asChild className="h-8 w-8 rounded-md bg-white text-[#464EB8] hover:bg-[#464EB8] hover:text-white border border-[#464EB8] p-0 shadow-xs transition-all overflow-hidden cursor-pointer">
            <a href={url} target="_blank" rel="noopener noreferrer" title="Buka File BAST di Teams" className="flex items-center justify-center w-full h-full">
              <MicrosoftTeamsIcon size={22} />
            </a>
          </Button>
        </div>
      );
    }
  },
  {
    accessorKey: "file_bapl",
    header: () => <div className="text-center">File BAPL</div>,
    size: 150,
    cell: ({ row }) => {
      const url = row.getValue("file_bapl") as string;
      if (!url) return <div className="flex justify-center"><span className="text-slate-400">-</span></div>;
      return (
        <div className="flex justify-center">
          <Button asChild className="h-8 w-8 rounded-md bg-white text-[#464EB8] hover:bg-[#464EB8] hover:text-white border border-[#464EB8] p-0 shadow-xs transition-all overflow-hidden cursor-pointer">
            <a href={url} target="_blank" rel="noopener noreferrer" title="Buka File BAPL di Teams" className="flex items-center justify-center w-full h-full">
              <MicrosoftTeamsIcon size={22} />
            </a>
          </Button>
        </div>
      );
    }
  },
  {
    accessorKey: "status_gr",
    filterFn: multiSelectFilterFn,
    header: () => <div className="text-center">Status GR</div>,
    cell: ({ row }) => {
      const val = (row.getValue("status_gr") as string) || "-";
      const lower = val.toLowerCase();
      const variant = lower.includes("done") ? "success"
                    : lower.includes("inprocess") || lower.includes("process") ? "warning"
                    : "default";
      return (
        <div className="flex justify-center">
          {val !== "-" ? <StatusBadge variant={variant}>{val}</StatusBadge> : <span className="text-slate-400">-</span>}
        </div>
      );
    },
    size: 150,
  },
  {
    accessorKey: "hardfile_bast",
    filterFn: multiSelectFilterFn,
    header: () => <div className="text-center">Hardfile BAST</div>,
    cell: ({ row }) => {
      const val = (row.getValue("hardfile_bast") as string) || "-";
      const lower = val.toLowerCase();
      const variant = lower.includes("tidak") || lower.includes("belum") ? "destructive" 
                    : lower.includes("ada") || lower.includes("done") ? "success" 
                    : lower.includes("pending") || lower.includes("proses") || lower.includes("inprocess") ? "warning" 
                    : "default";
      return (
        <div className="flex justify-center">
          {val !== "-" ? <StatusBadge variant={variant}>{val}</StatusBadge> : <span className="text-slate-400">-</span>}
        </div>
      );
    },
    size: 170,
  },
  {
    accessorKey: "created_at",
    header: "Created At",
    size: 200,
    cell: ({ row }) => formatDateTime(row.getValue("created_at") as string),
  },
  {
    accessorKey: "updated_at",
    header: "Updated At",
    size: 200,
    cell: ({ row }) => formatDateTime(row.getValue("updated_at") as string),
  },
];
