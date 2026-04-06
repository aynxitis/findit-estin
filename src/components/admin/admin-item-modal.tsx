"use client";

import { useState, useEffect, useMemo } from "react";
import { X } from "lucide-react";
import {
  CATEGORIES,
  ZONES,
  WHERE_LEFT_OPTIONS,
  LOCATION_LABELS,
} from "@/lib/constants/labels";
import type { Item, ItemCategory, ItemLocation, ItemZone, ItemWhereLeft } from "@/lib/types/item";

interface ModalFormState {
  type: "found" | "lost";
  category: ItemCategory | "";
  zone: ItemZone | "";
  location: ItemLocation | "";
  whereLeft: ItemWhereLeft | "";
  date: string;
  description: string;
  photoURL: string;
  status: "open" | "claimed";
  userUID: string;
  userName: string;
  userEmail: string;
}

export interface AdminItemSaveData {
  type: "found" | "lost";
  category: ItemCategory | "";
  zone: ItemZone | null;
  location: ItemLocation | "";
  whereLeft: ItemWhereLeft | null;
  date: string;
  description: string | null;
  photoURL: string | null;
  status: "open" | "claimed";
  userUID: string;
  userName: string | null;
  userEmail: string | null;
}

interface AdminItemModalProps {
  item: Item | null;
  onSave: (data: AdminItemSaveData) => void;
  onClose: () => void;
  saving: boolean;
  error?: string | null;
}

const today = new Date().toISOString().split("T")[0];

// Shared select className — explicit dark bg so options are readable
const selectCls =
  "px-3 py-2 rounded-xl bg-[var(--background)] text-[var(--foreground)] border border-[var(--border)] text-sm focus:outline-none focus:border-[var(--foreground)] cursor-pointer";

const inputCls =
  "px-3 py-2 rounded-xl bg-[var(--background)] text-[var(--foreground)] border border-[var(--border)] text-sm focus:outline-none focus:border-[var(--foreground)]";

function defaultForm(): ModalFormState {
  return {
    type: "found",
    category: "",
    zone: "",
    location: "",
    whereLeft: "",
    date: today,
    description: "",
    photoURL: "",
    status: "open",
    userUID: "",
    userName: "",
    userEmail: "",
  };
}

function itemToForm(item: Item): ModalFormState {
  return {
    type: item.type,
    category: item.category ?? "",
    zone: item.zone ?? "",
    location: item.location ?? "",
    whereLeft: item.whereLeft ?? "",
    date: item.date ?? today,
    description: item.description ?? "",
    photoURL: item.photoURL ?? "",
    status: item.status,
    userUID: item.userUID ?? "",
    userName: item.userName ?? "",
    userEmail: item.userEmail ?? "",
  };
}

export function AdminItemModal({
  item,
  onSave,
  onClose,
  saving,
  error,
}: AdminItemModalProps) {
  const [form, setForm] = useState<ModalFormState>(defaultForm);
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    setValidationError(null);
    setForm(item ? itemToForm(item) : defaultForm());
  }, [item]);

  const availableLocations = useMemo(() => {
    if (form.zone === "school") return ["library", "foyer", "td_halls", "tp_halls"];
    if (form.zone === "residence") return ["restau", "res_foyer"];
    return Object.keys(LOCATION_LABELS);
  }, [form.zone]);

  function set<K extends keyof ModalFormState>(key: K, value: ModalFormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleTypeChange(type: "found" | "lost") {
    // Clear whereLeft when switching away from "found" so stale values aren't sent
    setForm((prev) => ({ ...prev, type, whereLeft: type === "lost" ? "" : prev.whereLeft }));
  }

  function handleZoneChange(zone: ItemZone | "") {
    setForm((prev) => ({ ...prev, zone, location: "" }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setValidationError(null);

    if (!form.userUID.trim()) { setValidationError("User UID is required"); return; }
    if (!form.category) { setValidationError("Category is required"); return; }
    if (!form.location) { setValidationError("Location is required"); return; }
    if (!form.date) { setValidationError("Date is required"); return; }
    if (form.type === "found" && !form.whereLeft) {
      setValidationError("Where left is required for found items");
      return;
    }

    onSave({
      type: form.type,
      category: form.category,
      zone: form.zone || null,
      location: form.location,
      // whereLeft is only meaningful for "found" items — always null for "lost"
      whereLeft: form.type === "found" ? (form.whereLeft || null) : null,
      date: form.date,
      description: form.description.trim() || null,
      photoURL: form.photoURL.trim() || null,
      status: form.status,
      userUID: form.userUID.trim(),
      userName: form.userName.trim() || null,
      userEmail: form.userEmail.trim() || null,
    });
  }

  const displayError = validationError || error;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="relative w-full max-w-lg bg-[var(--background)] border border-[var(--border)] rounded-2xl p-6 overflow-y-auto max-h-[90vh]">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-1 text-[var(--muted)] hover:text-[var(--foreground)] cursor-pointer"
        >
          <X size={20} />
        </button>

        <h2 className="font-display text-xl font-bold mb-5">
          {item ? "Edit Item" : "Add Item"}
        </h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Row 1: Type + Status */}
          <div className="grid grid-cols-2 gap-3">
            <label className="flex flex-col gap-1">
              <span className="font-display text-xs font-bold text-[var(--muted)] uppercase tracking-wide">Type</span>
              <select value={form.type} onChange={(e) => handleTypeChange(e.target.value as "found" | "lost")} className={selectCls}>
                <option value="found">Found</option>
                <option value="lost">Lost</option>
              </select>
            </label>
            <label className="flex flex-col gap-1">
              <span className="font-display text-xs font-bold text-[var(--muted)] uppercase tracking-wide">Status</span>
              <select value={form.status} onChange={(e) => set("status", e.target.value as "open" | "claimed")} className={selectCls}>
                <option value="open">Open</option>
                <option value="claimed">Claimed</option>
              </select>
            </label>
          </div>

          {/* Row 2: Category + Date */}
          <div className="grid grid-cols-2 gap-3">
            <label className="flex flex-col gap-1">
              <span className="font-display text-xs font-bold text-[var(--muted)] uppercase tracking-wide">Category *</span>
              <select value={form.category} onChange={(e) => set("category", e.target.value as ItemCategory | "")} className={selectCls}>
                <option value="">Select…</option>
                {CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1">
              <span className="font-display text-xs font-bold text-[var(--muted)] uppercase tracking-wide">Date *</span>
              <input
                type="date"
                value={form.date}
                max={today}
                onChange={(e) => set("date", e.target.value)}
                className={inputCls}
              />
            </label>
          </div>

          {/* Row 3: Zone + Location */}
          <div className="grid grid-cols-2 gap-3">
            <label className="flex flex-col gap-1">
              <span className="font-display text-xs font-bold text-[var(--muted)] uppercase tracking-wide">Zone</span>
              <select value={form.zone} onChange={(e) => handleZoneChange(e.target.value as ItemZone | "")} className={selectCls}>
                <option value="">Any / Not sure</option>
                {ZONES.map((z) => (
                  <option key={z.value} value={z.value}>{z.label}</option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1">
              <span className="font-display text-xs font-bold text-[var(--muted)] uppercase tracking-wide">Location *</span>
              <select value={form.location} onChange={(e) => set("location", e.target.value as ItemLocation | "")} className={selectCls}>
                <option value="">Select…</option>
                {availableLocations.map((loc) => (
                  <option key={loc} value={loc}>{LOCATION_LABELS[loc] ?? loc}</option>
                ))}
              </select>
            </label>
          </div>

          {/* Row 4: Where Left (found only) */}
          {form.type === "found" && (
            <label className="flex flex-col gap-1">
              <span className="font-display text-xs font-bold text-[var(--muted)] uppercase tracking-wide">Where Left *</span>
              <select value={form.whereLeft} onChange={(e) => set("whereLeft", e.target.value as ItemWhereLeft | "")} className={selectCls}>
                <option value="">Select…</option>
                {WHERE_LEFT_OPTIONS.map((w) => (
                  <option key={w.value} value={w.value}>{w.label}</option>
                ))}
              </select>
            </label>
          )}

          {/* Row 5: Description */}
          <label className="flex flex-col gap-1">
            <span className="font-display text-xs font-bold text-[var(--muted)] uppercase tracking-wide">
              Description <span className="font-normal normal-case">({form.description.length}/400)</span>
            </span>
            <textarea
              value={form.description}
              onChange={(e) => set("description", e.target.value.slice(0, 400))}
              rows={3}
              placeholder="Optional description…"
              className={`${inputCls} resize-none`}
            />
          </label>

          {/* Row 6: Photo URL */}
          <label className="flex flex-col gap-1">
            <span className="font-display text-xs font-bold text-[var(--muted)] uppercase tracking-wide">Photo URL</span>
            <input
              type="url"
              value={form.photoURL}
              onChange={(e) => set("photoURL", e.target.value)}
              placeholder="https://…"
              className={inputCls}
            />
          </label>

          {/* Row 7: User UID + User Email */}
          <div className="grid grid-cols-2 gap-3">
            <label className="flex flex-col gap-1">
              <span className="font-display text-xs font-bold text-[var(--muted)] uppercase tracking-wide">User UID *</span>
              <input
                type="text"
                value={form.userUID}
                onChange={(e) => set("userUID", e.target.value)}
                placeholder="Firebase UID"
                className={`${inputCls} font-mono`}
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="font-display text-xs font-bold text-[var(--muted)] uppercase tracking-wide">User Email</span>
              <input
                type="email"
                value={form.userEmail}
                onChange={(e) => set("userEmail", e.target.value)}
                placeholder="user@estin.dz"
                className={inputCls}
              />
            </label>
          </div>

          {/* Row 8: User Name */}
          <label className="flex flex-col gap-1">
            <span className="font-display text-xs font-bold text-[var(--muted)] uppercase tracking-wide">User Name</span>
            <input
              type="text"
              value={form.userName}
              onChange={(e) => set("userName", e.target.value)}
              placeholder="Display name"
              className={inputCls}
            />
          </label>

          {/* Error */}
          {displayError && (
            <p className="font-display text-sm text-red px-3 py-2 rounded-xl bg-red/10 border border-red/20">
              {displayError}
            </p>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="font-display flex-1 py-3 rounded-xl border border-[var(--border)] font-semibold hover:bg-[var(--surface)] hover:-translate-y-0.5 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className={`font-display flex-1 py-3 rounded-xl font-semibold hover:-translate-y-0.5 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed transition-all ${
                item
                  ? "bg-yellow text-[var(--background)]"
                  : "bg-teal text-[var(--background)]"
              }`}
            >
              {saving ? "Saving…" : item ? "Save Changes" : "Add Item"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
