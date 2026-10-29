import type { OrdersData, SidItem } from "@/types/orders";
export type { OrdersData, OrderItem, SidItem } from "@/types/orders";

/**
 * Checks whether a text string represents a web URL (e.g. Google Spreadsheet link).
 */
export function isUrl(text: string): boolean {
  return /^https?:\/\/[^\s]+/i.test(text.trim());
}

/**
 * Parses labeled strings matching patterns like "Lama : ... / Baru : ...".
 */
export function parseLabeledPairs(text: string): Array<{ value: string; label: string }> | null {
  const hasLama = /\b(lama|old)\b/i.test(text);
  const hasBaru = /\b(baru|new)\b/i.test(text);

  if (!hasLama && !hasBaru) return null;

  const results: Array<{ value: string; label: string }> = [];
  const regex = /(?:^|[\s/;,])(lama|baru|old|new)\s*[:=-]?\s*([^/;,]+?)(?=(?:[\s/;,]+(?:lama|baru|old|new)\b)|$)/gi;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    const rawLabel = match[1].trim();
    const rawValue = match[2].trim();
    if (rawValue) {
      const normalizedLabel = rawLabel.charAt(0).toUpperCase() + rawLabel.slice(1).toLowerCase();
      results.push({
        label: normalizedLabel,
        value: rawValue,
      });
    }
  }

  return results.length > 0 ? results : null;
}

/**
 * Parses a single SID segment into { sid, label }.
 * Accommodates descriptive text, parenthesized dates, or prefix tags.
 */
export function parseSingleSidString(segment: string): SidItem {
  const str = segment.trim();

  // Pattern: "SID : 2077215056 ..."
  const sidPrefixMatch = str.match(/^SID\s*[:=-]?\s*(\d{8,10})(.*)$/i);
  if (sidPrefixMatch) {
    const sidNum = sidPrefixMatch[1].trim();
    const remaining = sidPrefixMatch[2].replace(/^[-:\s]+/, "").trim();
    return {
      sid: sidNum,
      ...(remaining ? { label: remaining } : {}),
    };
  }

  // Pattern: "2083771663 - ENGINEER ON SITE" or "2083771663 : DESCRIPTION"
  const dashMatch = str.match(/^(\d{8,10})\s*[-:]\s*(.+)$/);
  if (dashMatch) {
    return {
      sid: dashMatch[1].trim(),
      label: dashMatch[2].trim(),
    };
  }

  // Pattern: "EOS Diskominfo Kota Salatiga 2077215069"
  const textBeforeDigit = str.match(/^(.+?)\s+(\d{8,10})$/);
  if (textBeforeDigit) {
    return {
      sid: textBeforeDigit[2].trim(),
      label: textBeforeDigit[1].trim(),
    };
  }

  // Pattern: "2097862094 (FBC 28 APR 2026)"
  const parenMatch = str.match(/^(\d{8,10})\s*(\([^)]+\))$/);
  if (parenMatch) {
    return {
      sid: parenMatch[1].trim(),
      label: parenMatch[2].trim(),
    };
  }

  // General fallback: locate 8-10 digit SID if present alongside text
  const digitMatch = str.match(/\b\d{8,10}\b/);
  if (digitMatch) {
    const sidNum = digitMatch[0];
    const extra = str.replace(sidNum, "").replace(/^[-:\s]+|[-:\s]+$/g, "").trim();
    return {
      sid: sidNum,
      ...(extra ? { label: extra } : {}),
    };
  }

  // Pure descriptive text fallback (prevents data loss)
  return { sid: str };
}

/**
 * Extracts individual Order ID candidates from raw input.
 */
export function extractOrderCandidates(rawOrder?: string | null): Array<{ order_id: string; label?: string }> {
  const text = (rawOrder || "").trim();
  if (!text) return [];

  // 1. Google Spreadsheet or web document URL
  if (isUrl(text)) {
    return [{ order_id: text }];
  }

  // 2. Labeled pairs ("Lama : ... / Baru : ...")
  const labeled = parseLabeledPairs(text);
  if (labeled && labeled.length > 0) {
    return labeled.map((item) => ({
      order_id: item.value,
      label: item.label,
    }));
  }

  // 3. Delimited by semicolons or newlines
  if (text.includes(";") || text.includes("\n")) {
    const parts = text.split(/[;\n]+/).map((s) => s.trim()).filter(Boolean);
    if (parts.length > 1) {
      return parts.map((part) => ({ order_id: part }));
    }
  }

  // 4. Telkom AO pattern (e.g. 1-41488411518) optionally followed by note like (167 AO)
  const telkomPattern = /\b1-\d{10,12}(?:\s*\([^)]+\))?/g;
  const matches = text.match(telkomPattern);
  if (matches && matches.length > 1) {
    return matches.map((m) => ({ order_id: m.trim() }));
  }

  // 5. Fallback: single raw string value
  return [{ order_id: text }];
}

/**
 * Extracts individual SID candidates from raw input.
 */
export function extractSidCandidates(rawSid?: string | null): SidItem[] {
  const text = (rawSid || "").trim();
  if (!text) return [];

  // 1. Labeled pairs ("Lama : ... / Baru : ...")
  const labeled = parseLabeledPairs(text);
  if (labeled && labeled.length > 0) {
    return labeled.map((item) => ({
      sid: item.value,
      label: item.label,
    }));
  }

  // 2. Numbered list pattern (e.g. "1. 2098433253 - Operation ... 2. 2098433325 : ...")
  if (/^\s*1\s*[.)]\s*\d{8,10}/.test(text)) {
    const listItems = text.split(/(?:^|\s+)\d+[.)]\s*/).map((s) => s.trim()).filter(Boolean);
    if (listItems.length > 0) {
      return listItems.map((item) => parseSingleSidString(item));
    }
  }

  // 3. Semicolon or newline delimited
  if (text.includes(";") || text.includes("\n")) {
    const parts = text.split(/[;\n]+/).map((s) => s.trim()).filter(Boolean);
    if (parts.length > 0) {
      return parts.map((part) => parseSingleSidString(part));
    }
  }

  // 4. Multiple SIDs with parenthesis notes: "2097862094 (FBC 28 APR 2026) 2097862078 (FBC 28 APR 2026)"
  const parenPattern = /\b(\d{8,10})\s*(\([^)]+\))/g;
  const parenMatches = [...text.matchAll(parenPattern)];
  if (parenMatches.length > 1) {
    return parenMatches.map((m) => ({
      sid: m[1].trim(),
      label: m[2].trim(),
    }));
  }

  // 5. Multiple SIDs with dash descriptions: "2083771663 - ENGINEER ON SITE 2083853683 - PELATIHAN TIK"
  const dashMultiPattern = /(\b\d{8,10}\b\s*[-:]\s*[^0-9]+?)(?=(?:\s+\b\d{8,10}\b\s*[-:])|$)/g;
  const dashMatches = [...text.matchAll(dashMultiPattern)];
  if (dashMatches.length > 1) {
    return dashMatches.map((m) => parseSingleSidString(m[1].trim()));
  }

  // 6. Pure space-separated 8-10 digit numbers: "2083940925 2083940981"
  const digitsPattern = /\b\d{8,10}\b/g;
  const allDigits = text.match(digitsPattern);
  if (allDigits && allDigits.length > 1 && text.replace(/\b\d{8,10}\b|\s+/g, "").length === 0) {
    return allDigits.map((d) => ({ sid: d }));
  }

  // 7. Single item
  return [parseSingleSidString(text)];
}

/**
 * Robust resilient parser converting legacy raw strings into structured OrdersData.
 */
export function parseRawOrders(rawNoOrder?: string | null, rawSid?: string | null): OrdersData {
  const cleanOrder = (rawNoOrder || "").trim();
  const cleanSid = (rawSid || "").trim();

  if (!cleanOrder && !cleanSid) {
    return [];
  }

  const orderCandidates = extractOrderCandidates(cleanOrder);
  const sidCandidates = extractSidCandidates(cleanSid);

  // Case A: No Order candidate, but SID candidates exist
  if (orderCandidates.length === 0) {
    return [
      {
        order_id: "",
        sids: sidCandidates.length > 0 ? sidCandidates : [{ sid: "" }],
      },
    ];
  }

  // Case B: Exactly 1 Order candidate
  if (orderCandidates.length === 1) {
    const singleOrder = orderCandidates[0];
    return [
      {
        order_id: singleOrder.order_id,
        ...(singleOrder.label ? { label: singleOrder.label } : {}),
        sids: sidCandidates.length > 0 ? sidCandidates : [{ sid: "" }],
      },
    ];
  }

  // Case C: Multiple Order candidates, but NO SID candidates
  if (sidCandidates.length === 0) {
    return orderCandidates.map((ord) => ({
      order_id: ord.order_id,
      ...(ord.label ? { label: ord.label } : {}),
      sids: [{ sid: "" }],
    }));
  }

  // Case D: Both Order and SID have labels (e.g. Lama / Baru)
  const orderHasLabels = orderCandidates.some((o) => o.label);
  const sidHasLabels = sidCandidates.some((s) => s.label);
  if (orderHasLabels && sidHasLabels) {
    return orderCandidates.map((ord) => {
      const matchedSids = sidCandidates.filter(
        (s) => s.label && ord.label && s.label.toLowerCase() === ord.label.toLowerCase()
      );
      return {
        order_id: ord.order_id,
        ...(ord.label ? { label: ord.label } : {}),
        sids: matchedSids.length > 0 ? matchedSids : [{ sid: "" }],
      };
    });
  }

  // Case E: Equal number of Orders and SIDs (1-to-1 positional pairing)
  if (orderCandidates.length === sidCandidates.length) {
    return orderCandidates.map((ord, idx) => ({
      order_id: ord.order_id,
      ...(ord.label ? { label: ord.label } : {}),
      sids: [sidCandidates[idx]],
    }));
  }

  // Case F: Multiple orders with mismatched SID count
  return orderCandidates.map((ord, idx) => {
    const sid = sidCandidates[idx];
    return {
      order_id: ord.order_id,
      ...(ord.label ? { label: ord.label } : {}),
      sids: sid ? [sid] : [{ sid: "" }],
    };
  });
}

/**
 * Normalizes project row data: uses existing orders_data if populated,
 * otherwise dynamically parses no_order and sid strings on the fly.
 */
export function normalizeOrdersData(row: {
  orders_data?: OrdersData | null;
  no_order?: string | null;
  sid?: string | null;
}): OrdersData {
  if (Array.isArray(row.orders_data) && row.orders_data.length > 0) {
    // Sanitize in case any legacy or erroneously saved data has label prefixed into order_id or sid
    return row.orders_data.map((ord) => {
      let cleanOrderId = (ord.order_id || "").trim();
      let orderLabel = ord.label ? ord.label.trim() : undefined;

      const orderMatch = cleanOrderId.match(/^(lama|baru|old|new)\s*[:=-]\s*(.*)$/i);
      if (orderMatch) {
        orderLabel = orderMatch[1].charAt(0).toUpperCase() + orderMatch[1].slice(1).toLowerCase();
        cleanOrderId = orderMatch[2].trim();
      }

      const cleanSids = (ord.sids || []).map((s) => {
        let cleanSid = (s.sid || "").trim();
        let sidLabel = s.label ? s.label.trim() : undefined;

        const sidMatch = cleanSid.match(/^(lama|baru|old|new)\s*[:=-]\s*(.*)$/i);
        if (sidMatch) {
          sidLabel = sidMatch[1].charAt(0).toUpperCase() + sidMatch[1].slice(1).toLowerCase();
          cleanSid = sidMatch[2].trim();
        }

        return {
          sid: cleanSid,
          ...(sidLabel ? { label: sidLabel } : {}),
        };
      });

      return {
        order_id: cleanOrderId,
        ...(orderLabel ? { label: orderLabel } : {}),
        sids: cleanSids.length > 0 ? cleanSids : [{ sid: "" }],
      };
    });
  }
  return parseRawOrders(row.no_order, row.sid);
}

/**
 * Serializes structured OrdersData back into synchronized string representations
 * for legacy no_order and sid columns (dual-write).
 */
export function serializeOrdersData(orders?: OrdersData | null): { no_order: string; sid: string } {
  if (!orders || orders.length === 0) {
    return { no_order: "", sid: "" };
  }

  const orderStrings: string[] = [];
  const sidStrings: string[] = [];

  const isLamaBaru = orders.some((o) => o.label && /^(lama|baru|old|new)$/i.test(o.label));

  for (const order of orders) {
    if (order.order_id) {
      if (order.label && !order.order_id.toLowerCase().includes(order.label.toLowerCase())) {
        orderStrings.push(`${order.label} : ${order.order_id}`);
      } else {
        orderStrings.push(order.order_id);
      }
    }

    for (const s of order.sids) {
      if (s.sid) {
        if (s.label) {
          const lowerSid = s.sid.toLowerCase();
          const lowerLabel = s.label.toLowerCase();
          if (lowerSid.includes(lowerLabel)) {
            sidStrings.push(s.sid);
          } else if (s.label.startsWith("(")) {
            sidStrings.push(`${s.sid} ${s.label}`);
          } else if (/^(lama|baru|old|new)$/i.test(s.label)) {
            sidStrings.push(`${s.label} : ${s.sid}`);
          } else {
            sidStrings.push(`${s.sid} - ${s.label}`);
          }
        } else {
          sidStrings.push(s.sid);
        }
      }
    }
  }

  const joinDelimiter = isLamaBaru ? " / " : " ";
  return {
    no_order: orderStrings.join(joinDelimiter),
    sid: sidStrings.join(joinDelimiter),
  };
}

export interface OrderSidPair {
  order_id: string;
  order_label?: string;
  sid: string;
  sid_label?: string;
}

/**
 * Flattens hierarchical OrdersData into a flat array of 1:1 (Order ID, SID) pairs.
 * Used for expandable sub-rows and Excel/CSV tabular row duplication.
 */
export function flattenOrderSidPairs(orders?: OrdersData | null): OrderSidPair[] {
  if (!orders || orders.length === 0) return [];
  const pairs: OrderSidPair[] = [];

  for (const ord of orders) {
    if (!ord.sids || ord.sids.length === 0) {
      pairs.push({
        order_id: ord.order_id || "",
        ...(ord.label ? { order_label: ord.label } : {}),
        sid: "",
      });
    } else {
      for (const s of ord.sids) {
        pairs.push({
          order_id: ord.order_id || "",
          ...(ord.label ? { order_label: ord.label } : {}),
          sid: s.sid || "",
          ...(s.label ? { sid_label: s.label } : {}),
        });
      }
    }
  }

  return pairs;
}

/**
 * Parses user input in the Order ID form field.
 * Extracts prefix labels (e.g. "Lama : ...") or clears the label if removed.
 */
export function parseOrderInput(input: string): { order_id: string; label?: string } {
  const trimmed = input.trim();
  const match = trimmed.match(/^(lama|baru|old|new)\s*[:=-]\s*(.*)$/i);
  if (match) {
    const rawLabel = match[1].charAt(0).toUpperCase() + match[1].slice(1).toLowerCase();
    return {
      order_id: match[2].trim(),
      label: rawLabel,
    };
  }
  return { order_id: trimmed };
}

/**
 * Parses user input in the SID form field.
 * Extracts prefix labels (e.g. "Lama : ...") or trailing notes, or clears the label if removed.
 */
export function parseSidInput(input: string): { sid: string; label?: string } {
  const trimmed = input.trim();
  if (!trimmed) return { sid: "" };

  const prefixMatch = trimmed.match(/^(lama|baru|old|new)\s*[:=-]\s*(.*)$/i);
  if (prefixMatch) {
    const rawLabel = prefixMatch[1].charAt(0).toUpperCase() + prefixMatch[1].slice(1).toLowerCase();
    return {
      sid: prefixMatch[2].trim(),
      label: rawLabel,
    };
  }

  const dashMatch = trimmed.match(/^(1-\d{11}|\d{8,12})\s*[-:]\s*(.+)$/);
  if (dashMatch) {
    return {
      sid: dashMatch[1].trim(),
      label: dashMatch[2].trim(),
    };
  }

  const parenMatch = trimmed.match(/^(1-\d{11}|\d{8,12})\s*(\([^)]+\))$/);
  if (parenMatch) {
    return {
      sid: parenMatch[1].trim(),
      label: parenMatch[2].trim(),
    };
  }

  return { sid: trimmed };
}

/**
 * Formats an Order item for display inside the form text input.
 */
export function formatOrderInputDisplay(ord: { order_id?: string; label?: string }): string {
  if (!ord.order_id && !ord.label) return "";
  const id = (ord.order_id || "").trim();
  const label = (ord.label || "").trim();
  if (label && id) {
    if (id.toLowerCase().startsWith(label.toLowerCase())) {
      return id;
    }
    return `${label} : ${id}`;
  }
  if (label && !id) {
    return `${label} : `;
  }
  return id || "";
}

/**
 * Formats a SID item for display inside the form text input.
 */
export function formatSidInputDisplay(s: { sid?: string; label?: string }): string {
  if (!s.sid && !s.label) return "";
  const sid = (s.sid || "").trim();
  const label = (s.label || "").trim();
  if (!label) return sid || "";
  if (!sid) {
    if (/^(lama|baru|old|new)$/i.test(label)) {
      return `${label} : `;
    }
    return label;
  }
  if (sid.toLowerCase().includes(label.toLowerCase())) {
    return sid;
  }
  if (label.startsWith("(")) {
    return `${sid} ${label}`;
  }
  if (/^(lama|baru|old|new)$/i.test(label)) {
    return `${label} : ${sid}`;
  }
  return `${sid} - ${label}`;
}
