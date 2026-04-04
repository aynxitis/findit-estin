import { Timestamp } from "firebase/firestore";

export type ItemType = "found" | "lost";
export type ItemStatus = "open" | "claimed";

export interface Item {
  id: string;
  type: ItemType;
  category: string;
  location: string;
  description?: string;
  photoURL?: string;
  date: string;
  status: ItemStatus;
  userUID: string;
  userName?: string;
  createdAt: Timestamp;
  /** @deprecated Legacy field — resolve email from userUID server-side */
  userEmail?: string;
}

export interface User {
  uid: string;
  name: string;
  email: string;
  photo?: string;
  verified: boolean;
  joinedAt: Timestamp;
  banned?: boolean;
}

export interface Notification {
  id: string;
  toUID: string;
  message: string;
  claimerName?: string;
  claimerUID?: string;
  itemId?: string;
  read: boolean;
  createdAt: Timestamp;
  /** @deprecated Legacy field — resolve email from claimerUID */
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
  posterUID: string;
  createdAt: Timestamp;
}
