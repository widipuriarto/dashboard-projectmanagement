/**
 * Type definitions for hierarchical Order ID and SID data structure.
 */

export interface SidItem {
  /** SID number or descriptive identifier (can be empty string if pending) */
  sid: string;
  /** Optional metadata tag or service description (e.g. "Lama", "Baru", "ENGINEER ON SITE") */
  label?: string;
}

export interface OrderItem {
  /** Telkom AO number, URL, or general order reference */
  order_id: string;
  /** Optional metadata tag (e.g. "Lama", "Baru") */
  label?: string;
  /** Child SIDs belonging to this Order ID (must contain at least 1 item) */
  sids: SidItem[];
}

export type OrdersData = OrderItem[];

