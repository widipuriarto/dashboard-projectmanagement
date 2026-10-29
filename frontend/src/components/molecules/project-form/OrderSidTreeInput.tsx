import * as React from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { OrdersData } from "@/types/orders";
import {
  isUrl,
  parseOrderInput,
  parseSidInput,
} from "@/lib/orderParser";

interface OrderSidTreeInputProps {
  value?: OrdersData;
  onChange: (newOrders: OrdersData) => void;
  errors?: Record<string, string>;
  setFieldError?: (field: string, error: string | null) => void;
}

export const OrderSidTreeInput: React.FC<OrderSidTreeInputProps> = ({
  value = [{ order_id: "", sids: [{ sid: "" }] }],
  onChange,
  errors = {},
  setFieldError,
}) => {
  // Ensure there is always at least one Order ID and one child SID
  const orders = React.useMemo(() => {
    if (!value || value.length === 0) {
      return [{ order_id: "", sids: [{ sid: "" }] }];
    }
    return value;
  }, [value]);

  const validateOrderId = React.useCallback((val: string): string | null => {
    const trimmed = val.trim();
    if (!trimmed) return null;
    if (isUrl(trimmed)) return null;
    const parsed = parseOrderInput(trimmed);
    const targetId = parsed.order_id.trim();
    if (!targetId) return null;
    if (!/^1-\d{11}$/.test(targetId)) {
      return "No Order wajib format 1-(11 digit)";
    }
    return null;
  }, []);

  const validateSid = React.useCallback((val: string): string | null => {
    const trimmed = val.trim();
    if (!trimmed) return null;
    if (isUrl(trimmed)) return null;
    const parsed = parseSidInput(trimmed);
    const targetSid = parsed.sid.trim();
    if (!targetSid) return null;
    if (!/^1-\d{11}$/.test(targetSid) && !/^\d{10}$/.test(targetSid)) {
      return "SID wajib format 1-(11 digit)";
    }
    return null;
  }, []);

  const hasOrderError = React.useMemo(() => {
    return Object.keys(errors).some(
      (k) => k.startsWith("order_") && Boolean(errors[k])
    );
  }, [errors]);

  const hasSidError = React.useMemo(() => {
    return Object.keys(errors).some(
      (k) => k.startsWith("sid_") && Boolean(errors[k])
    );
  }, [errors]);

  // Restrict keyboard input strictly to digits and hyphen
  const handleNumericAndHyphenKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (
      e.key === "Backspace" ||
      e.key === "Delete" ||
      e.key === "Tab" ||
      e.key === "ArrowLeft" ||
      e.key === "ArrowRight" ||
      e.key === "ArrowUp" ||
      e.key === "ArrowDown" ||
      e.key === "Home" ||
      e.key === "End" ||
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

  // Add a new Order ID block (which includes 1 empty SID by rule)
  const handleAddOrder = (afterIndex: number) => {
    const next = [...orders];
    next.splice(afterIndex + 1, 0, {
      order_id: "",
      sids: [{ sid: "" }],
    });
    onChange(next);
  };

  // Remove an Order ID block (only permitted if more than 1 Order exists)
  const handleRemoveOrder = (orderIndex: number) => {
    if (orders.length <= 1) return;
    const next = orders.filter((_, idx) => idx !== orderIndex);
    onChange(next);
    setFieldError?.(`order_${orderIndex}`, null);
  };

  // Add a new child SID under a specific Order ID
  const handleAddSid = (orderIndex: number, afterSidIndex: number) => {
    const next = orders.map((ord, idx) => {
      if (idx !== orderIndex) return ord;
      const nextSids = [...ord.sids];
      nextSids.splice(afterSidIndex + 1, 0, { sid: "" });
      return { ...ord, sids: nextSids };
    });
    onChange(next);
  };

  // Remove a child SID under a specific Order ID (must leave at least 1 SID)
  const handleRemoveSid = (orderIndex: number, sidIndex: number) => {
    const next = orders.map((ord, idx) => {
      if (idx !== orderIndex) return ord;
      if (ord.sids.length <= 1) return ord;
      return {
        ...ord,
        sids: ord.sids.filter((_, sIdx) => sIdx !== sidIndex),
      };
    });
    onChange(next);
    setFieldError?.(`sid_${orderIndex}_${sidIndex}`, null);
  };

  // Handle Order ID text change
  const handleOrderChange = (orderIndex: number, text: string) => {
    const isPastedUrl = isUrl(text);
    const sanitized = isPastedUrl ? text.trim() : text.replace(/[^0-9-]/g, "").slice(0, 13);
    const next = orders.map((ord, idx) => {
      if (idx !== orderIndex) return ord;
      return {
        ...ord,
        order_id: sanitized,
      };
    });
    onChange(next);
    if (errors[`order_${orderIndex}`]) {
      const err = validateOrderId(sanitized);
      if (!err) {
        setFieldError?.(`order_${orderIndex}`, null);
      }
    }
  };

  const handleOrderBlur = (orderIndex: number, text: string) => {
    const err = validateOrderId(text);
    setFieldError?.(`order_${orderIndex}`, err);
  };

  // Handle SID text change
  const handleSidChange = (orderIndex: number, sidIndex: number, text: string) => {
    const isPastedUrl = isUrl(text);
    const sanitized = isPastedUrl ? text.trim() : text.replace(/[^0-9-]/g, "").slice(0, 13);
    const next = orders.map((ord, idx) => {
      if (idx !== orderIndex) return ord;
      const nextSids = ord.sids.map((s, sIdx) => {
        if (sIdx !== sidIndex) return s;
        return {
          ...s,
          sid: sanitized,
        };
      });
      return { ...ord, sids: nextSids };
    });
    onChange(next);
    if (errors[`sid_${orderIndex}_${sidIndex}`]) {
      const err = validateSid(sanitized);
      if (!err) {
        setFieldError?.(`sid_${orderIndex}_${sidIndex}`, null);
      }
    }
  };

  const handleSidBlur = (orderIndex: number, sidIndex: number, text: string) => {
    const err = validateSid(text);
    setFieldError?.(`sid_${orderIndex}_${sidIndex}`, err);
  };

  return (
    <div className="col-span-1 md:col-span-2 w-full space-y-2">
      {/* Column Headers */}
      <div className="grid grid-cols-[1fr_40px_1fr] sm:grid-cols-[1fr_56px_1fr] items-center px-0.5 mb-1.5">
        <label className="text-xs font-semibold uppercase tracking-wider text-telkom-navy select-none">
          No Order
        </label>
        <div />
        <label className="text-xs font-semibold uppercase tracking-wider text-telkom-navy select-none">
          SID
        </label>
      </div>

      {/* List of Order ID Nodes */}
      <div className="space-y-4">
        {orders.map((orderItem, orderIdx) => {
          const sidCount = orderItem.sids.length;
          // Row height is 40px (h-10) with 12px gap (gap-3)
          const sidRowHeight = 40;
          const sidRowGap = 12;
          const totalRightHeight =
            sidCount * sidRowHeight + Math.max(0, sidCount - 1) * sidRowGap;

          return (
            <div
              key={orderIdx}
              className="grid grid-cols-[1fr_40px_1fr] sm:grid-cols-[1fr_56px_1fr] items-start"
            >
              {/* Left Column: Order ID Controls */}
              <div className="flex items-center gap-2 pt-0">
                {/* + Button on the far left of Order ID */}
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => handleAddOrder(orderIdx)}
                  className="h-10 w-10 shrink-0 rounded-md border border-telkom-navy bg-white text-telkom-navy hover:bg-telkom-navy hover:text-white active:opacity-90 shadow-none transition-all cursor-pointer"
                >
                  <Plus className="h-4 w-4" />
                </Button>

                {/* Delete button if there are multiple Order IDs */}
                {orders.length > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => handleRemoveOrder(orderIdx)}
                    className="h-10 w-10 shrink-0 rounded-md border border-red-500 bg-white text-red-500 hover:bg-red-500 hover:text-white active:bg-red-600 shadow-none transition-all cursor-pointer"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}

                {/* Order ID Input */}
                <div className="flex-1 relative min-w-0 flex items-center gap-1.5">
                  {orderItem.label && (
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-600 border border-slate-200 shrink-0 select-none">
                      {orderItem.label}
                    </span>
                  )}
                  <Input
                    type="text"
                    inputMode="numeric"
                    placeholder="Contoh: 1-41488411518"
                    value={orderItem.order_id || ""}
                    onKeyDown={handleNumericAndHyphenKeyDown}
                    onChange={(e) => handleOrderChange(orderIdx, e.target.value)}
                    onBlur={(e) => handleOrderBlur(orderIdx, e.target.value)}
                    className={cn(
                      errors[`order_${orderIdx}`] &&
                        "border-red-500 focus:border-red-500 focus-visible:ring-1 focus-visible:ring-red-500 bg-red-50/20"
                    )}
                  />
                </div>
              </div>

              {/* Middle Column: Tree Connector Line */}
              <div
                className="relative flex items-center justify-center w-full"
                style={{ height: `${totalRightHeight}px` }}
              >
                {sidCount === 1 ? (
                  // Single SID: straight horizontal connector line
                  <div className="w-full flex items-center justify-center h-10">
                    <div className="w-full h-[2px] bg-slate-400" />
                  </div>
                ) : (
                  // Multiple SIDs: orthogonal branch tree structure
                  <svg
                    className="w-full h-full overflow-visible"
                    viewBox={`0 0 56 ${totalRightHeight}`}
                    preserveAspectRatio="none"
                  >
                    {/* Stem from Order ID to tree spine */}
                    <path
                      d="M 0 20 L 24 20"
                      fill="none"
                      stroke="#94a3b8"
                      strokeWidth="2"
                    />

                    {/* Vertical spine line connecting first SID to last SID */}
                    <path
                      d={`M 24 20 L 24 ${ (sidCount - 1) * (sidRowHeight + sidRowGap) + 20 }`}
                      fill="none"
                      stroke="#94a3b8"
                      strokeWidth="2"
                    />

                    {/* Horizontal branches into each SID */}
                    {orderItem.sids.map((_, sIdx) => {
                      const branchY = sIdx * (sidRowHeight + sidRowGap) + 20;
                      return (
                        <path
                          key={sIdx}
                          d={`M 24 ${branchY} L 56 ${branchY}`}
                          fill="none"
                          stroke="#94a3b8"
                          strokeWidth="2"
                        />
                      );
                    })}
                  </svg>
                )}
              </div>

              {/* Right Column: Child SIDs List */}
              <div className="space-y-3">
                {orderItem.sids.map((sidItem, sidIdx) => (
                  <div key={sidIdx} className="flex items-center gap-2">
                    {/* SID Input */}
                    <div className="flex-1 relative min-w-0 flex items-center gap-1.5">
                      {sidItem.label && (
                        <span
                          className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-600 border border-slate-200 shrink-0 select-none max-w-[80px] truncate"
                          title={sidItem.label}
                        >
                          {sidItem.label}
                        </span>
                      )}
                      <Input
                        type="text"
                        inputMode="numeric"
                        placeholder="Contoh: 1794503720"
                        value={sidItem.sid || ""}
                        onKeyDown={handleNumericAndHyphenKeyDown}
                        onChange={(e) =>
                          handleSidChange(orderIdx, sidIdx, e.target.value)
                        }
                        onBlur={(e) =>
                          handleSidBlur(orderIdx, sidIdx, e.target.value)
                        }
                        className={cn(
                          errors[`sid_${orderIdx}_${sidIdx}`] &&
                            "border-red-500 focus:border-red-500 focus-visible:ring-1 focus-visible:ring-red-500 bg-red-50/20"
                        )}
                      />
                    </div>

                    {/* Delete button (placed on the inner side, between Input and +) */}
                    {orderItem.sids.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => handleRemoveSid(orderIdx, sidIdx)}
                        className="h-10 w-10 shrink-0 rounded-md border border-red-500 bg-white text-red-500 hover:bg-red-500 hover:text-white active:bg-red-600 shadow-none transition-all cursor-pointer"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}

                    {/* + Button: ALWAYS on the far right of SID */}
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => handleAddSid(orderIdx, sidIdx)}
                      className="h-10 w-10 shrink-0 rounded-md border border-telkom-navy bg-white text-telkom-navy hover:bg-telkom-navy hover:text-white active:opacity-90 shadow-none transition-all cursor-pointer"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer Consolidated Error Alerts */}
      {(hasOrderError || hasSidError) && (
        <div className="grid grid-cols-[1fr_40px_1fr] sm:grid-cols-[1fr_56px_1fr] items-start pt-1">
          {/* Bottom Error for No Order Column */}
          <div className="min-h-[18px]">
            {hasOrderError && (
              <p className="text-[11px] text-red-500 font-medium">
                No Order wajib format number 1-(11 digit)
              </p>
            )}
          </div>

          <div />

          {/* Bottom Error for SID Column */}
          <div className="min-h-[18px]">
            {hasSidError && (
              <p className="text-[11px] text-red-500 font-medium">
                SID wajib format number 10 digit
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
