"use client";

import { useState, useEffect, useMemo } from "react";
import { collection, query, orderBy, getDocs, limit } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getClientDb } from "@/lib/firebase/client";
import { useAuth } from "@/hooks/use-auth";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { AdminItemModal, type AdminItemSaveData } from "./admin-item-modal";
import {
  CATEGORY_LABELS,
  CATEGORY_ICONS,
  LOCATION_LABELS,
  CATEGORIES,
} from "@/lib/constants/labels";
import type { Item, User as UserType } from "@/lib/types/item";
import { formatDate } from "@/lib/utils";
import {
  Plus, Pencil, Trash2, RefreshCw, ToggleLeft, ToggleRight,
  Ban, CheckCircle,
} from "lucide-react";

// Shared select style — explicit background so options are readable in dark mode
const selectCls =
  "px-3 py-2 rounded-xl bg-[var(--background)] text-[var(--foreground)] border border-[var(--border)] text-sm focus:outline-none focus:border-[var(--foreground)] cursor-pointer";

export function AdminItems() {
  const { user, loading: authLoading } = useAuth();
  const [serverVerified, setServerVerified] = useState(false);
  const [verifying, setVerifying] = useState(true);

  const [activeTab, setActiveTab] = useState<"items" | "users">("items");
  const [items, setItems] = useState<Item[]>([]);
  const [users, setUsers] = useState<UserType[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Item filters
  const [filterType, setFilterType] = useState<"" | "found" | "lost">("");
  const [filterStatus, setFilterStatus] = useState<"" | "open" | "claimed">("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterSearch, setFilterSearch] = useState("");

  // User filter
  const [userSearch, setUserSearch] = useState("");

  // Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Action error feedback
  const [actionError, setActionError] = useState<string | null>(null);

  // Delete confirm (items)
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // ── Admin verification (identical to AdminDashboard) ──────────────
  useEffect(() => {
    if (!user || authLoading) { setVerifying(false); return; }

    async function verifyAdmin() {
      try {
        const auth = getAuth();
        const token = await auth.currentUser?.getIdToken(true);
        if (!token) { setVerifying(false); return; }
        const res = await fetch("/api/admin/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });
        const data = await res.json();
        setServerVerified(data.isAdmin === true);
      } catch {
        setServerVerified(false);
      } finally {
        setVerifying(false);
      }
    }
    verifyAdmin();
  }, [user, authLoading]);

  useEffect(() => { if (serverVerified) loadData(); }, [serverVerified]);

  async function loadData() {
    setLoading(true);
    try {
      const db = getClientDb();
      const [itemsSnap, usersSnap] = await Promise.all([
        getDocs(query(collection(db, "items"), orderBy("createdAt", "desc"), limit(200))),
        getDocs(query(collection(db, "users"), limit(200))),
      ]);
      setItems(itemsSnap.docs.map((d) => ({ id: d.id, ...d.data() })) as Item[]);
      setUsers(usersSnap.docs.map((d) => ({ uid: d.id, ...d.data() })) as UserType[]);
    } catch {
      // load failed
    } finally {
      setLoading(false);
    }
  }

  async function getToken(): Promise<string | null> {
    return getAuth().currentUser?.getIdToken() ?? null;
  }

  // ── Filtered data ──────────────────────────────────────────────────
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      if (filterType && item.type !== filterType) return false;
      if (filterStatus && item.status !== filterStatus) return false;
      if (filterCategory && item.category !== filterCategory) return false;
      if (filterSearch) {
        const q = filterSearch.toLowerCase();
        const searchable = [
          item.description, item.userEmail, item.userName,
          item.userUID, item.id,
          CATEGORY_LABELS[item.category], LOCATION_LABELS[item.location],
        ].filter(Boolean).join(" ").toLowerCase();
        if (!searchable.includes(q)) return false;
      }
      return true;
    });
  }, [items, filterType, filterStatus, filterCategory, filterSearch]);

  const filteredUsers = useMemo(() => {
    if (!userSearch) return users;
    const q = userSearch.toLowerCase();
    return users.filter((u) =>
      [u.name, u.email, u.uid].filter(Boolean).join(" ").toLowerCase().includes(q)
    );
  }, [users, userSearch]);

  // ── Item actions ───────────────────────────────────────────────────
  function openAdd() { setEditingItem(null); setSaveError(null); setModalOpen(true); }
  function openEdit(item: Item) { setEditingItem(item); setSaveError(null); setModalOpen(true); }

  async function handleSave(data: AdminItemSaveData) {
    setSaving(true);
    setSaveError(null);
    try {
      const token = await getToken();
      if (!token) throw new Error("Not authenticated");

      if (editingItem) {
        const res = await fetch(`/api/admin/items/${editingItem.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token, ...data }),
        });
        if (!res.ok) throw new Error("Update failed");
        setItems((prev) =>
          prev.map((i) => (i.id === editingItem.id ? { ...i, ...(data as Partial<Item>) } : i))
        );
      } else {
        const res = await fetch("/api/admin/items", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token, ...data }),
        });
        if (!res.ok) throw new Error("Create failed");
        await loadData();
      }
      setModalOpen(false);
      setEditingItem(null);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  async function handleStatusToggle(item: Item) {
    const newStatus = item.status === "open" ? "claimed" : "open";
    setActionLoading(`status-${item.id}`);
    try {
      const token = await getToken();
      if (!token) return;
      const res = await fetch(`/api/admin/items/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, status: newStatus }),
      });
      if (!res.ok) throw new Error();
      setItems((prev) =>
        prev.map((i) => (i.id === item.id ? { ...i, status: newStatus } : i))
      );
    } catch {
      setActionError("Failed to update item status. Please try again.");
    } finally {
      setActionLoading(null);
    }
  }

  async function handleDeleteItem() {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      const token = await getToken();
      if (!token) throw new Error();
      const res = await fetch(`/api/admin/items/${deleteTarget}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      if (!res.ok) throw new Error();
      setItems((prev) => prev.filter((i) => i.id !== deleteTarget));
      setDeleteTarget(null);
    } catch {
      setActionError("Failed to delete item. Please try again.");
    } finally {
      setDeleteLoading(false);
    }
  }

  // ── User actions ───────────────────────────────────────────────────
  async function handleToggleBan(userId: string, currentlyBanned: boolean) {
    setActionLoading(`ban-${userId}`);
    try {
      const token = await getToken();
      if (!token) return;
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, banned: !currentlyBanned }),
      });
      if (!res.ok) throw new Error();
      setUsers((prev) =>
        prev.map((u) => (u.uid === userId ? { ...u, banned: !currentlyBanned } : u))
      );
    } catch {
      setActionError("Failed to update user ban status. Please try again.");
    } finally {
      setActionLoading(null);
    }
  }

  // ── Loading / access denied ────────────────────────────────────────
  if (authLoading || verifying) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <p className="text-[var(--muted)]">Loading…</p>
      </div>
    );
  }

  if (!serverVerified) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="font-display text-3xl font-bold text-red mb-4">Access Denied</h1>
        <p className="text-[var(--muted)]">You don&apos;t have permission to access this page.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h1 className="font-display text-3xl font-extrabold">Manage</h1>
        <button
          onClick={loadData}
          disabled={loading}
          className="font-display flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--surface)] border border-[var(--border)] hover:bg-[var(--border)] hover:-translate-y-0.5 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed transition-all text-sm font-semibold"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {/* Action error banner */}
      {actionError && (
        <div className="mb-4 flex items-center justify-between gap-3 rounded-xl border border-red/20 bg-red/10 px-4 py-3 text-sm text-red font-display">
          <span>{actionError}</span>
          <button
            onClick={() => setActionError(null)}
            className="shrink-0 hover:opacity-70 cursor-pointer"
            aria-label="Dismiss error"
          >
            ✕
          </button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveTab("items")}
          className={`font-display px-5 py-2 rounded-xl font-semibold cursor-pointer transition-all text-sm ${
            activeTab === "items"
              ? "bg-[var(--foreground)] text-[var(--background)]"
              : "bg-[var(--surface)] border border-[var(--border)] hover:-translate-y-0.5"
          }`}
        >
          Items ({items.length})
        </button>
        <button
          onClick={() => setActiveTab("users")}
          className={`font-display px-5 py-2 rounded-xl font-semibold cursor-pointer transition-all text-sm ${
            activeTab === "users"
              ? "bg-[var(--foreground)] text-[var(--background)]"
              : "bg-[var(--surface)] border border-[var(--border)] hover:-translate-y-0.5"
          }`}
        >
          Users ({users.length})
        </button>
      </div>

      {/* ── ITEMS TAB ── */}
      {activeTab === "items" && (
        <>
          {/* Filter bar + Add */}
          <div className="flex flex-wrap gap-2 mb-5">
            <input
              type="text"
              placeholder="Search UID, email, description…"
              value={filterSearch}
              onChange={(e) => setFilterSearch(e.target.value)}
              className="flex-1 min-w-44 px-3 py-2 rounded-xl bg-[var(--background)] text-[var(--foreground)] border border-[var(--border)] text-sm focus:outline-none focus:border-[var(--foreground)]"
            />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as "" | "found" | "lost")}
              className={selectCls}
            >
              <option value="">All Types</option>
              <option value="found">Found</option>
              <option value="lost">Lost</option>
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as "" | "open" | "claimed")}
              className={selectCls}
            >
              <option value="">All Statuses</option>
              <option value="open">Open</option>
              <option value="claimed">Claimed</option>
            </select>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className={selectCls}
            >
              <option value="">All Categories</option>
              {CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
            {(filterType || filterStatus || filterCategory || filterSearch) && (
              <button
                onClick={() => { setFilterType(""); setFilterStatus(""); setFilterCategory(""); setFilterSearch(""); }}
                className="font-display px-3 py-2 rounded-xl bg-[var(--surface)] border border-[var(--border)] text-sm text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--border)] cursor-pointer transition-all font-semibold"
              >
                Clear
              </button>
            )}
            <button
              onClick={openAdd}
              className="font-display flex items-center gap-2 px-4 py-2 rounded-xl bg-teal text-[var(--background)] font-semibold hover:-translate-y-0.5 cursor-pointer transition-all text-sm"
            >
              <Plus size={14} />
              Add Item
            </button>
          </div>

          {/* Items table */}
          {loading ? (
            <p className="text-[var(--muted)] py-8 text-center">Loading…</p>
          ) : filteredItems.length === 0 ? (
            <p className="text-[var(--muted)] py-8 text-center">No items found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[var(--border)]">
                    <th className="font-display text-left py-3 px-2 text-xs font-bold uppercase tracking-wide">Type</th>
                    <th className="font-display text-left py-3 px-2 text-xs font-bold uppercase tracking-wide">Category</th>
                    <th className="font-display text-left py-3 px-2 text-xs font-bold uppercase tracking-wide">Location</th>
                    <th className="font-display text-left py-3 px-2 text-xs font-bold uppercase tracking-wide">Status</th>
                    <th className="font-display text-left py-3 px-2 text-xs font-bold uppercase tracking-wide">User</th>
                    <th className="font-display text-left py-3 px-2 text-xs font-bold uppercase tracking-wide">Date</th>
                    <th className="font-display text-right py-3 px-2 text-xs font-bold uppercase tracking-wide">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredItems.map((item) => (
                    <tr key={item.id} className="border-b border-[var(--border)] hover:bg-[var(--surface)]">
                      <td className="py-3 px-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${item.type === "found" ? "bg-teal/20 text-teal" : "bg-red/20 text-red"}`}>
                          {item.type}
                        </span>
                      </td>
                      <td className="py-3 px-2">
                        {CATEGORY_ICONS[item.category]} {CATEGORY_LABELS[item.category] ?? item.category}
                      </td>
                      <td className="py-3 px-2 text-[var(--muted)]">
                        {LOCATION_LABELS[item.location] ?? item.location}
                      </td>
                      <td className="py-3 px-2">
                        <span className={`px-2 py-1 rounded-full text-xs ${item.status === "claimed" ? "bg-yellow/20 text-yellow" : "bg-[var(--surface)] border border-[var(--border)]"}`}>
                          {item.status}
                        </span>
                      </td>
                      <td className="py-3 px-2 text-[var(--muted)] max-w-32 truncate">
                        {item.userEmail ?? item.userUID}
                      </td>
                      <td className="py-3 px-2 text-[var(--muted)]">
                        {item.createdAt?.toDate ? formatDate(item.createdAt.toDate()) : "—"}
                      </td>
                      <td className="py-3 px-2">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => openEdit(item)} disabled={!!actionLoading} title="Edit item"
                            className="p-2 text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--surface)] rounded-lg disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed">
                            <Pencil size={14} />
                          </button>
                          <button onClick={() => handleStatusToggle(item)} disabled={actionLoading === `status-${item.id}`}
                            title={item.status === "open" ? "Mark as claimed" : "Mark as open"}
                            className="p-2 text-yellow hover:bg-yellow/10 rounded-lg disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed">
                            {item.status === "open" ? <ToggleLeft size={14} /> : <ToggleRight size={14} />}
                          </button>
                          <button onClick={() => setDeleteTarget(item.id)} disabled={!!actionLoading} title="Delete item"
                            className="p-2 text-red hover:bg-red/10 rounded-lg disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* ── USERS TAB ── */}
      {activeTab === "users" && (
        <>
          <div className="flex flex-wrap gap-2 mb-5">
            <input
              type="text"
              placeholder="Search name, email, UID…"
              value={userSearch}
              onChange={(e) => setUserSearch(e.target.value)}
              className="flex-1 min-w-44 px-3 py-2 rounded-xl bg-[var(--background)] text-[var(--foreground)] border border-[var(--border)] text-sm focus:outline-none focus:border-[var(--foreground)]"
            />
            {userSearch && (
              <button
                onClick={() => setUserSearch("")}
                className="font-display px-3 py-2 rounded-xl bg-[var(--surface)] border border-[var(--border)] text-sm text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--border)] cursor-pointer transition-all font-semibold"
              >
                Clear
              </button>
            )}
          </div>

          {loading ? (
            <p className="text-[var(--muted)] py-8 text-center">Loading…</p>
          ) : filteredUsers.length === 0 ? (
            <p className="text-[var(--muted)] py-8 text-center">No users found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[var(--border)]">
                    <th className="font-display text-left py-3 px-2 text-xs font-bold uppercase tracking-wide">Name</th>
                    <th className="font-display text-left py-3 px-2 text-xs font-bold uppercase tracking-wide">Email</th>
                    <th className="font-display text-left py-3 px-2 text-xs font-bold uppercase tracking-wide">Status</th>
                    <th className="font-display text-left py-3 px-2 text-xs font-bold uppercase tracking-wide">Joined</th>
                    <th className="font-display text-right py-3 px-2 text-xs font-bold uppercase tracking-wide">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((u) => (
                    <tr key={u.uid} className="border-b border-[var(--border)] hover:bg-[var(--surface)]">
                      <td className="py-3 px-2 font-medium">{u.name}</td>
                      <td className="py-3 px-2 text-[var(--muted)]">{u.email}</td>
                      <td className="py-3 px-2">
                        {u.banned ? (
                          <span className="px-2 py-1 rounded-full text-xs bg-red/20 text-red">Banned</span>
                        ) : (
                          <span className="px-2 py-1 rounded-full text-xs bg-teal/20 text-teal">Active</span>
                        )}
                      </td>
                      <td className="py-3 px-2 text-[var(--muted)]">
                        {u.joinedAt?.toDate ? formatDate(u.joinedAt.toDate()) : "—"}
                      </td>
                      <td className="py-3 px-2">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleToggleBan(u.uid, !!u.banned)}
                            disabled={actionLoading === `ban-${u.uid}`}
                            title={u.banned ? "Unban user" : "Ban user"}
                            className={`p-2 rounded-lg disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed transition-all ${
                              u.banned ? "text-teal hover:bg-teal/10" : "text-red hover:bg-red/10"
                            }`}
                          >
                            {u.banned ? <CheckCircle size={16} /> : <Ban size={16} />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* Add/Edit Item Modal */}
      {modalOpen && (
        <AdminItemModal
          item={editingItem}
          onSave={handleSave}
          onClose={() => { setModalOpen(false); setEditingItem(null); }}
          saving={saving}
          error={saveError}
        />
      )}

      {/* Delete Confirm */}
      <ConfirmModal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteItem}
        title="Delete Item"
        message="Are you sure you want to permanently delete this item? This cannot be undone."
        confirmText="Delete"
        confirmVariant="danger"
        loading={deleteLoading}
      />
    </div>
  );
}
