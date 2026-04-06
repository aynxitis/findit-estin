import { Timestamp } from "firebase/firestore";

export type ItemType = "found" | "lost";
export type ItemStatus = "open" | "claimed";
export type ItemCategory =
  | "keys"
  | "card"
  | "phone"
  | "bag"
  | "clothing"
  | "electronics"
  | "other";
export type ItemLocation =
  | "library"
  | "foyer"
  | "td_halls"
  | "tp_halls"
  | "restau"
  | "res_foyer"
  | "unknown";
export type ItemZone = "school" | "residence" | "unknown";
export type ItemWhereLeft = "with_me" | "admin" | "left_there";

export interface Item {
  id: string;
  type: ItemType;
  category: ItemCategory;
  location: ItemLocation;
  /** Zone within the campus (school | residence | unknown). */
  zone?: ItemZone;
  /** Where the finder left the item (found items only). */
  whereLeft?: ItemWhereLeft;
  description?: string;
  photoURL?: string;
  date: string;
  status: ItemStatus;
  userUID: string;
  userName?: string;
  /** createdAt is null immediately after optimistic writes; always present server-side. */
  createdAt: Timestamp | null;
  userEmail?: string;
}

export interface User {
  uid: string;
  name: string;
  email: string;
  photo?: string;
  verified: boolean;
  /** joinedAt can be null briefly after account creation before server timestamp resolves. */
  joinedAt: Timestamp | null;
  banned?: boolean;
}

export interface Notification {
  id: string;
  toUID: string;
  itemId?: string;
  category?: string;
  message: string;
  claimerName?: string;
  claimerUID?: string;
  read: boolean;
  createdAt: Timestamp;
  claimerEmail?: string;
}

/** Ban record stored at /banned/{uid} */
export interface BanRecord {
  bannedAt: Timestamp;
  bannedBy: string;
  reason?: string;
}

export interface Claim {
  id: string;
  itemId: string;
  claimedBy: string;
  claimedEmail: string | null;
  claimedName: string;
  posterUID: string | null;
  posterEmail: string | null;
  createdAt: Timestamp;
}
