"use client";

import { useState, useEffect } from "react";
import { collection, query, orderBy, getDocs, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { getClientDb } from "@/lib/firebase/client";
import { useAuth } from "@/hooks/use-auth";
import { CATEGORY_LABELS, CATEGORY_ICONS, LOCATION_LABELS } from "@/lib/constants/labels";
import type { Item, User as UserType } from "@/lib/types/item";
import { formatDate } from "@/lib/utils";
import { Trash2, Ban, CheckCircle, RefreshCw } from "lucide-react";
import { getAuth } from "firebase/auth";

interface Stats {
  totalItems: number;
  foundItems: number;
  lostItems: number;
  claimedItems: number;
  totalUsers: number;
}

export function AdminDashboard() {
  const { user, loading: authLoading } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [users, setUsers] = useState<UserType[]>([]);
  const [activeTab, setActiveTab] = useState<"items" | "users">("items");
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [serverVerified, setServerVerified] = useState(false);
  const [verifying, setVerifying] = useState(true);

  // Server-side admin verification (eliminates client-side admin email exposure)
  useEffect(() => {
    if (!user || authLoading) {
      setVerifying(false);
      return;
    }

    async function verifyAdmin() {
      try {
        const auth = getAuth();
        const token = await auth.currentUser?.getIdToken();
        if (!token) {
          setVerifying(false);
          return;
        }

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

  // Load data only after server verification
  useEffect(() => {
    if (serverVerified) {
      loadData();
    }
  }, [serverVerified]);

  const loadData = async () => {
    setLoading(true);
    try {
      const db = getClientDb();
      
      // Load items
      const itemsSnap = await getDocs(
        query(collection(db, "items"), orderBy("createdAt", "desc"))
      );
      const itemsData = itemsSnap.docs.map((d) => ({ id: d.id, ...d.data() })) as Item[];
      setItems(itemsData);

      // Load users
      const usersSnap = await getDocs(collection(db, "users"));
      const usersData = usersSnap.docs.map((d) => ({ uid: d.id, ...d.data() })) as UserType[];
      setUsers(usersData);

      // Calculate stats
      setStats({
        totalItems: itemsData.length,
        foundItems: itemsData.filter((i) => i.type === "found").length,
        lostItems: itemsData.filter((i) => i.type === "lost").length,
        claimedItems: itemsData.filter((i) => i.status === "claimed").length,
        totalUsers: usersData.length,
      });
    } catch {
      // Admin data load failed - stats/lists remain empty
    } finally {
      setLoading(false);
    }
  };

  // Delete item
  const handleDeleteItem = async (itemId: string) => {
    if (!confirm("Delete this item?")) return;
    setActionLoading(itemId);
    try {
      const db = getClientDb();
      await deleteDoc(doc(db, "items", itemId));
      setItems(items.filter((i) => i.id !== itemId));
    } catch {
      // Delete failed - item remains in list
    } finally {
      setActionLoading(null);
    }
  };

  // Ban/unban user
  const handleToggleBan = async (userId: string, currentlyBanned: boolean) => {
    if (!confirm(currentlyBanned ? "Unban this user?" : "Ban this user?")) return;
    setActionLoading(userId);
    try {
      const db = getClientDb();
      await updateDoc(doc(db, "users", userId), {
        banned: !currentlyBanned,
      });
      setUsers(
        users.map((u) =>
          u.uid === userId ? { ...u, banned: !currentlyBanned } : u
        )
      );
    } catch {
      // Ban toggle failed - user state unchanged in UI
    } finally {
      setActionLoading(null);
    }
  };

  // Auth loading or verifying
  if (authLoading || verifying) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <p className="text-[var(--muted)]">Loading...</p>
      </div>
    );
  }

  // Not admin (server verification failed)
  if (!serverVerified) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="font-display text-3xl font-bold text-red mb-4">Access Denied</h1>
        <p className="text-[var(--muted)]">
          You don&apos;t have permission to access this page.
        </p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display text-3xl font-bold">Admin Dashboard</h1>
        <button
          onClick={loadData}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--surface)] border border-[var(--border)] hover:bg-[var(--border)] hover:-translate-y-0.5 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed transition-all"
        >
          <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <div className="p-4 rounded-xl bg-[var(--surface)] border border-[var(--border)]">
            <div className="text-2xl font-bold">{stats.totalItems}</div>
            <div className="text-sm text-[var(--muted)]">Total Items</div>
          </div>
          <div className="p-4 rounded-xl bg-teal/10 border border-teal/20">
            <div className="text-2xl font-bold text-teal">{stats.foundItems}</div>
            <div className="text-sm text-[var(--muted)]">Found</div>
          </div>
          <div className="p-4 rounded-xl bg-red/10 border border-red/20">
            <div className="text-2xl font-bold text-red">{stats.lostItems}</div>
            <div className="text-sm text-[var(--muted)]">Lost</div>
          </div>
          <div className="p-4 rounded-xl bg-yellow/10 border border-yellow/20">
            <div className="text-2xl font-bold text-yellow">{stats.claimedItems}</div>
            <div className="text-sm text-[var(--muted)]">Resolved</div>
          </div>
          <div className="p-4 rounded-xl bg-blue/10 border border-blue/20">
            <div className="text-2xl font-bold text-blue">{stats.totalUsers}</div>
            <div className="text-sm text-[var(--muted)]">Users</div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveTab("items")}
          className={`px-4 py-2 rounded-xl font-semibold cursor-pointer transition-all ${
            activeTab === "items"
              ? "bg-[var(--foreground)] text-[var(--background)]"
              : "bg-[var(--surface)] border border-[var(--border)] hover:-translate-y-0.5"
          }`}
        >
          Items ({items.length})
        </button>
        <button
          onClick={() => setActiveTab("users")}
          className={`px-4 py-2 rounded-xl font-semibold cursor-pointer transition-all ${
            activeTab === "users"
              ? "bg-[var(--foreground)] text-[var(--background)]"
              : "bg-[var(--surface)] border border-[var(--border)] hover:-translate-y-0.5"
          }`}
        >
          Users ({users.length})
        </button>
      </div>

      {/* Items table */}
      {activeTab === "items" && (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[var(--border)]">
                <th className="text-left py-3 px-2 text-sm font-semibold">Type</th>
                <th className="text-left py-3 px-2 text-sm font-semibold">Category</th>
                <th className="text-left py-3 px-2 text-sm font-semibold">Location</th>
                <th className="text-left py-3 px-2 text-sm font-semibold">Status</th>
                <th className="text-left py-3 px-2 text-sm font-semibold">User</th>
                <th className="text-left py-3 px-2 text-sm font-semibold">Date</th>
                <th className="text-right py-3 px-2 text-sm font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} className="border-b border-[var(--border)] hover:bg-[var(--surface)]">
                  <td className="py-3 px-2">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        item.type === "found" ? "bg-teal/20 text-teal" : "bg-red/20 text-red"
                      }`}
                    >
                      {item.type}
                    </span>
                  </td>
                  <td className="py-3 px-2 text-sm">
                    {CATEGORY_ICONS[item.category]} {CATEGORY_LABELS[item.category]}
                  </td>
                  <td className="py-3 px-2 text-sm text-[var(--muted)]">
                    {LOCATION_LABELS[item.location]}
                  </td>
                  <td className="py-3 px-2">
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        item.status === "claimed"
                          ? "bg-yellow/20 text-yellow"
                          : "bg-[var(--surface)]"
                      }`}
                    >
                      {item.status}
                    </span>
                  </td>
                  <td className="py-3 px-2 text-sm text-[var(--muted)]">{item.userEmail}</td>
                  <td className="py-3 px-2 text-sm text-[var(--muted)]">
                    {item.createdAt?.toDate ? formatDate(item.createdAt.toDate()) : "—"}
                  </td>
                  <td className="py-3 px-2 text-right">
                    <button
                      onClick={() => handleDeleteItem(item.id)}
                      disabled={actionLoading === item.id}
                      className="p-2 text-red hover:bg-red/10 rounded-lg disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Users table */}
      {activeTab === "users" && (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[var(--border)]">
                <th className="text-left py-3 px-2 text-sm font-semibold">Name</th>
                <th className="text-left py-3 px-2 text-sm font-semibold">Email</th>
                <th className="text-left py-3 px-2 text-sm font-semibold">Status</th>
                <th className="text-left py-3 px-2 text-sm font-semibold">Joined</th>
                <th className="text-right py-3 px-2 text-sm font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.uid} className="border-b border-[var(--border)] hover:bg-[var(--surface)]">
                  <td className="py-3 px-2 text-sm font-medium">{u.name}</td>
                  <td className="py-3 px-2 text-sm text-[var(--muted)]">{u.email}</td>
                  <td className="py-3 px-2">
                    {u.banned ? (
                      <span className="px-2 py-1 rounded-full text-xs bg-red/20 text-red">
                        Banned
                      </span>
                    ) : (
                      <span className="px-2 py-1 rounded-full text-xs bg-teal/20 text-teal">
                        Active
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-2 text-sm text-[var(--muted)]">
                    {u.joinedAt?.toDate ? formatDate(u.joinedAt.toDate()) : "—"}
                  </td>
                  <td className="py-3 px-2 text-right">
                    <button
                      onClick={() => handleToggleBan(u.uid, !!u.banned)}
                      disabled={actionLoading === u.uid}
                      className={`p-2 rounded-lg disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed ${
                        u.banned
                          ? "text-teal hover:bg-teal/10"
                          : "text-red hover:bg-red/10"
                      }`}
                    >
                      {u.banned ? <CheckCircle size={16} /> : <Ban size={16} />}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
