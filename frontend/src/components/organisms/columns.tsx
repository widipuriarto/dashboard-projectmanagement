import type { ColumnDef } from "@tanstack/react-table";
import { StatusBadge } from "@/components/atoms/StatusBadge";
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";
import { MicrosoftTeamsIcon } from "@/components/atoms/MicrosoftTeamsIcon";
import { OrderSidExpandButton } from "@/components/atoms/OrderSidExpandButton";
import { ProjectIdSortHeader } from "@/components/molecules/ProjectIdSortHeader";
import { DataTableSortHeader } from "@/components/molecules/DataTableSortHeader";
import {
  textSortFn,
  dateSortFn,
  numericSortFn,
  slaBastSortFn,
} from "@/lib/sortingFns";
import { cn } from "@/lib/utils";
import { normalizeOrdersData, flattenOrderSidPairs } from "@/lib/orderParser";
import {
  idrCurrencyFormatter,
  monthYearFormatter,
  formatDateTime,
} from "@/lib/formatters";
import type { ProjectPM, ProjectTableMeta } from "@/types/project";
import {
  multiSelectFilterFn,
  slaBastFilterFn,
  monthYearFilterFn,
  sortProjectByIdPm,
} from "@/lib/table-constants";

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

function formatOrderDisplayText(item: { order_id?: string; order_label?: string }): string {
  if (!item.order_id && !item.order_label) return "-";
  const rawOrder = (item.order_id || "").trim();
  const label = (item.order_label || "").trim();

  if (!label) return rawOrder || "-";
  if (!rawOrder) return label || "-";

  // Prevent duplicate label prefix if rawOrder already contains it
  const prefixRegex = new RegExp(`^${label}\\s*[:=-]\\s*`, "i");
  if (prefixRegex.test(rawOrder)) {
    return rawOrder;
  }

  return `${label} : ${rawOrder}`;
}

function formatSidDisplayText(item: { sid?: string; sid_label?: string }): string {
  if (!item.sid && !item.sid_label) return "-";
  const rawSid = (item.sid || "").trim();
  const label = (item.sid_label || "").trim();

  if (!label) return rawSid || "-";
  if (!rawSid) return label || "-";

  // Prevent duplicate label prefix if rawSid already contains it
  const prefixRegex = new RegExp(`^${label}\\s*[:=-]\\s*`, "i");
  if (prefixRegex.test(rawSid)) {
    return rawSid;
  }

  if (label.startsWith("(")) {
    return `${rawSid} ${label}`;
  }
  if (/^(lama|baru|old|new)$/i.test(label)) {
    return `${label} : ${rawSid}`;
  }
  return `${rawSid} - ${label}`;
}

export const columns: ColumnDef<ProjectPM>[] = [
  {
    id: "actions",
    enableHiding: false,
    header: () => <div className="text-center">Action</div>,
    cell: ({ row, table }) => {
      const meta = table.options.meta as ProjectTableMeta | undefined;
      const isTrash = Boolean(meta?.isTrashView);

      if (isTrash) {
        return (
          <div className="flex items-center gap-2">
            <Button
              data-testid="row-actions-restore"
              variant="ghost"
              className="h-8 w-8 p-0 rounded-md cursor-pointer border border-emerald-600 text-emerald-600 bg-white hover:bg-emerald-600 hover:text-white hover:border-transparent active:bg-emerald-700 transition-all shadow-2xs flex items-center justify-center"
              onClick={() => meta?.onRestore?.(row.original)}
              title="Restore Project"
              aria-label="Restore Project"
            >
              <span className="material-symbols-outlined text-[18px] leading-none select-none">
                undo
              </span>
            </Button>
            <Button
              data-testid="row-actions-permanent-delete"
              variant="ghost"
              className="h-8 w-8 p-0 rounded-md cursor-pointer border border-red-500 text-red-500 bg-white hover:bg-red-500 hover:text-white hover:border-transparent active:bg-red-600 transition-all shadow-2xs flex items-center justify-center"
              onClick={() => {
                if (meta?.onPermanentDelete) {
                  meta.onPermanentDelete(row.original);
                } else if (meta?.onDelete) {
                  meta.onDelete(row.original);
                }
              }}
              title="Delete Project Permanently"
              aria-label="Delete Project Permanently"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        );
      }

      return (
        <div className="flex items-center gap-2">
          <Button
            data-testid="row-actions-edit"
            variant="ghost"
            className="h-8 w-8 p-0 rounded-md cursor-pointer border border-blue-500 text-blue-500 bg-transparent hover:bg-blue-500 hover:text-white hover:border-transparent active:bg-blue-600 transition-all shadow-2xs"
            onClick={() => meta?.onEdit?.(row.original)}
            title="Edit Project"
            aria-label="Edit Project"
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            data-testid="row-actions-delete"
            variant="ghost"
            className="h-8 w-8 p-0 rounded-md cursor-pointer border border-red-500 text-red-500 bg-transparent hover:bg-red-500 hover:text-white hover:border-transparent active:bg-red-600 transition-all shadow-2xs"
            onClick={() => meta?.onDelete?.(row.original)}
            title="Delete Project"
            aria-label="Delete Project"
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
    size: 260,
    minSize: 230,
  },
  {
    accessorKey: "segment",
    filterFn: multiSelectFilterFn,
    header: () => <div className="text-center">SEGMENT</div>,
    cell: ({ row }) => {
      const val = (row.getValue("segment") as string) || "-";
      return (
        <div className="flex justify-center">
          {val !== "-" ? <StatusBadge variant="default">{val}</StatusBadge> : <span className="text-slate-400">-</span>}
        </div>
      );
    },
    size: 110,
    minSize: 90,
  },
  {
    accessorKey: "witel",
    filterFn: multiSelectFilterFn,
    header: () => <div className="text-center">WITEL</div>,
    cell: ({ row }) => {
      const val = (row.getValue("witel") as string) || "-";
      return (
        <div className="flex justify-center">
          {val !== "-" ? <StatusBadge variant="default">{val}</StatusBadge> : <span className="text-slate-400">-</span>}
        </div>
      );
    },
    size: 190,
    minSize: 160,
  },
  {
    accessorKey: "nama_proyek",
    header: ({ column }) => (
      <DataTableSortHeader
        column={column}
        title="Nama Proyek"
        align="left"
        sortType="alpha"
      />
    ),
    sortingFn: textSortFn,
    size: 550,
    minSize: 300,
  },
  {
    accessorKey: "nama_mitra",
    header: ({ column }) => (
      <DataTableSortHeader
        column={column}
        title="Nama Mitra"
        align="left"
        sortType="alpha"
      />
    ),
    sortingFn: textSortFn,
    size: 260,
    minSize: 200,
  },
  {
    accessorKey: "nama_pelanggan",
    header: ({ column }) => (
      <DataTableSortHeader
        column={column}
        title="Nama Pelanggan"
        align="left"
        sortType="alpha"
      />
    ),
    sortingFn: textSortFn,
    size: 350,
    minSize: 220,
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
    header: ({ column }) => (
      <DataTableSortHeader
        column={column}
        title="Tgl Kontrak"
        align="center"
        sortType="date"
      />
    ),
    sortingFn: dateSortFn,
    cell: ({ row }) => <div className="text-center">{row.getValue("tgl_kontrak") || "-"}</div>,
    size: 215,
    minSize: 190,
  },
  {
    accessorKey: "tahun_kontrak",
    filterFn: multiSelectFilterFn,
    header: ({ column }) => (
      <DataTableSortHeader
        column={column}
        title="Tahun Kontrak"
        align="center"
        sortType="number"
      />
    ),
    sortingFn: numericSortFn,
    cell: ({ row }) => <div className="text-center">{row.getValue("tahun_kontrak") || "-"}</div>,
    size: 235,
    minSize: 205,
  },
  {
    accessorKey: "nilai_kontrak_obl",
    header: ({ column }) => (
      <DataTableSortHeader
        column={column}
        title="Nilai Kontrak OBL"
        align="center"
        sortType="number"
      />
    ),
    sortingFn: numericSortFn,
    size: 265,
    minSize: 235,
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
    header: () => <div className="text-center font-semibold text-telkom-navy">No Order</div>,
    size: 260,
    minSize: 180,
    cell: ({ row, table }) => {
      const orders = normalizeOrdersData(row.original);
      const pairs = flattenOrderSidPairs(orders);
      if (pairs.length === 0) {
        return <div className="text-center text-slate-400">-</div>;
      }

      const meta = table.options.meta as ProjectTableMeta | undefined;
      const isExpanded = Boolean(meta?.expandedRows?.[row.id]);
      const toggleExpand = (e: React.MouseEvent) => {
        e.stopPropagation();
        meta?.toggleRowExpand?.(row.id);
      };

      const orderCount = orders.length;
      const hasMultiple = pairs.length > 1;
      const showButton = hasMultiple && orderCount > 1;

      if (!isExpanded) {
        const text = formatOrderDisplayText(pairs[0]);
        return (
          <div className="-mx-3 w-[calc(100%+1.5rem)] relative flex items-center justify-center min-h-[28px] px-14 min-w-0">
            {showButton && (
              <OrderSidExpandButton
                count={orderCount}
                isExpanded={false}
                onToggle={toggleExpand}
                position="left"
              />
            )}
            <span
              className="truncate block text-center font-medium text-slate-800 max-w-full"
              title={text}
            >
              {text}
            </span>
          </div>
        );
      }

      // Expanded View: height h-11 matches standard row height
      return (
        <div className="flex flex-col -mx-3 w-[calc(100%+1.5rem)] -my-1.5">
          {pairs.map((p, idx) => {
            const isDuplicateOrder = idx > 0 && p.order_id === pairs[idx - 1]?.order_id;
            const text = isDuplicateOrder ? "" : formatOrderDisplayText(p);

            return (
              <div
                key={idx}
                className={cn(
                  "relative flex items-center justify-center w-full h-11 px-14 min-w-0",
                  idx > 0 && "border-t-[1.5px] border-slate-200"
                )}
              >
                {showButton && idx === 0 && (
                  <OrderSidExpandButton
                    count={orderCount}
                    isExpanded={true}
                    onToggle={toggleExpand}
                    position="left"
                  />
                )}
                <span
                  className={cn(
                    "truncate block text-center max-w-full",
                    isDuplicateOrder ? "text-slate-300 font-normal" : "font-medium text-slate-800"
                  )}
                  title={text}
                >
                  {text}
                </span>
              </div>
            );
          })}
        </div>
      );
    },
  },
  {
    accessorKey: "sid",
    header: () => <div className="text-center font-semibold text-telkom-navy">SID</div>,
    size: 260,
    minSize: 180,
    cell: ({ row, table }) => {
      const orders = normalizeOrdersData(row.original);
      const pairs = flattenOrderSidPairs(orders);
      if (pairs.length === 0) {
        return <div className="text-center text-slate-400">-</div>;
      }

      const meta = table.options.meta as ProjectTableMeta | undefined;
      const isExpanded = Boolean(meta?.expandedRows?.[row.id]);
      const toggleExpand = (e: React.MouseEvent) => {
        e.stopPropagation();
        meta?.toggleRowExpand?.(row.id);
      };

      const orderCount = orders.length;
      const hasMultiple = pairs.length > 1;
      const showButton = hasMultiple && orderCount <= 1;

      if (!isExpanded) {
        const text = formatSidDisplayText(pairs[0]);
        return (
          <div className="-mx-3 w-[calc(100%+1.5rem)] relative flex items-center justify-center min-h-[28px] px-14 min-w-0">
            <span
              className="truncate block text-center font-medium text-slate-800 max-w-full"
              title={text}
            >
              {text}
            </span>
            {showButton && (
              <OrderSidExpandButton
                count={pairs.length}
                isExpanded={false}
                onToggle={toggleExpand}
                position="right"
              />
            )}
          </div>
        );
      }

      // Expanded View: height h-11 matches standard row height
      return (
        <div className="flex flex-col -mx-3 w-[calc(100%+1.5rem)] -my-1.5">
          {pairs.map((p, idx) => {
            const text = formatSidDisplayText(p);
            return (
              <div
                key={idx}
                className={cn(
                  "relative flex items-center justify-center w-full h-11 px-14 min-w-0",
                  idx > 0 && "border-t-[1.5px] border-slate-200"
                )}
              >
                <span
                  className="truncate block text-center font-medium text-slate-800 max-w-full"
                  title={text}
                >
                  {text}
                </span>
                {showButton && idx === 0 && (
                  <OrderSidExpandButton
                    count={pairs.length}
                    isExpanded={true}
                    onToggle={toggleExpand}
                    position="right"
                  />
                )}
              </div>
            );
          })}
        </div>
      );
    },
  },
  {
    accessorKey: "jenis_layanan",
    header: "JENIS LAYANAN",
    size: 300,
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
    cell: ({ row }) => {
      const val = (row.getValue("jenis_dok_delivery") as string) || "-";
      return (
        <div className="flex justify-center">
          {val !== "-" ? <StatusBadge variant="default">{val}</StatusBadge> : <span className="text-slate-400">-</span>}
        </div>
      );
    },
    size: 190,
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
    header: ({ column }) => (
      <DataTableSortHeader
        column={column}
        title="Tanggal Request DR"
        align="center"
        sortType="date"
      />
    ),
    sortingFn: dateSortFn,
    cell: ({ row }) => <div className="text-center">{row.getValue("tanggal_request_dr") || "-"}</div>,
    size: 275,
    minSize: 245,
  },
  {
    accessorKey: "tanggal_close_dr",
    header: ({ column }) => (
      <DataTableSortHeader
        column={column}
        title="Tanggal Close DR"
        align="center"
        sortType="date"
      />
    ),
    sortingFn: dateSortFn,
    cell: ({ row }) => <div className="text-center">{row.getValue("tanggal_close_dr") || "-"}</div>,
    size: 265,
    minSize: 235,
  },
  {
    accessorKey: "no_bast_telkom",
    header: "No BAST Telkom",
    size: 350,
  },
  {
    accessorKey: "tanggal_bast",
    header: ({ column }) => (
      <DataTableSortHeader
        column={column}
        title="Tanggal BAST"
        align="center"
        sortType="date"
      />
    ),
    sortingFn: dateSortFn,
    cell: ({ row }) => <div className="text-center">{row.getValue("tanggal_bast") || "-"}</div>,
    size: 230,
    minSize: 200,
  },
  {
    accessorKey: "tahun_bast",
    filterFn: multiSelectFilterFn,
    header: ({ column }) => (
      <DataTableSortHeader
        column={column}
        title="Tahun BAST"
        align="center"
        sortType="number"
      />
    ),
    sortingFn: numericSortFn,
    cell: ({ row }) => <div className="text-center">{row.getValue("tahun_bast") || "-"}</div>,
    size: 220,
    minSize: 190,
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
    sortingFn: slaBastSortFn,
    header: ({ column }) => (
      <DataTableSortHeader
        column={column}
        title="Waktu Penyelesaian BAST"
        align="center"
        sortType="number"
      />
    ),
    size: 325,
    minSize: 285,
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
    sortingFn: dateSortFn,
    header: ({ column }) => (
      <DataTableSortHeader
        column={column}
        title="KOMITMEN BC"
        align="center"
        sortType="date"
      />
    ),
    size: 240,
    minSize: 210,
    cell: ({ row }) => <div className="text-center">{formatMonthYear(row.getValue("komitmen_bc"))}</div>,
  },
  {
    accessorKey: "bulan_bc",
    filterFn: monthYearFilterFn,
    sortingFn: dateSortFn,
    header: ({ column }) => (
      <DataTableSortHeader
        column={column}
        title="Bulan BC"
        align="center"
        sortType="date"
      />
    ),
    size: 205,
    minSize: 175,
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
    header: ({ table }) => {
      const meta = table.options.meta as ProjectTableMeta | undefined;
      return meta?.isTrashView ? "Deleted At" : "Updated At";
    },
    size: 200,
    cell: ({ row, table }) => {
      const meta = table.options.meta as ProjectTableMeta | undefined;
      const rawVal = meta?.isTrashView
        ? (row.original as ProjectPM)?.deleted_at
        : row.getValue("updated_at");
      return formatDateTime(rawVal as string);
    },
  },
];
