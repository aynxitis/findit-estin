"use client";

import { useState, useEffect } from "react";
import { collection, query, orderBy, getDocs, limit } from "firebase/firestore";
import { getClientDb } from "@/lib/firebase/client";
import { useAuth } from "@/hooks/use-auth";
import { CATEGORY_LABELS, CATEGORY_ICONS, LOCATION_LABELS } from "@/lib/constants/labels";
import type { Item, User as UserType } from "@/lib/types/item";
import { formatDate } from "@/lib/utils";
import { RefreshCw } from "lucide-react";
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
  const [serverVerified, setServerVerified] = useState(false);
  const [verifying, setVerifying] = useState(true);

  // Server-side admin verification
  useEffect(() => {
    if (!user || authLoading) {
      setVerifying(false);
      return;
    }

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

  useEffect(() => {
    if (serverVerified) loadData();
  }, [serverVerified]);

  const loadData = async () => {
    setLoading(true);
    try {
      const db = getClientDb();
      const [itemsSnap, usersSnap] = await Promise.all([
        getDocs(query(collection(db, "items"), orderBy("createdAt", "desc"), limit(200))),
        getDocs(query(collection(db, "users"), limit(200))),
      ]);
      const itemsData = itemsSnap.docs.map((d) => ({ id: d.id, ...d.data() })) as Item[];
      const usersData = usersSnap.docs.map((d) => ({ uid: d.id, ...d.data() })) as UserType[];
      setItems(itemsData);
      setUsers(usersData);
      setStats({
        totalItems: itemsData.length,
        foundItems: itemsData.filter((i) => i.type === "found").length,
        lostItems: itemsData.filter((i) => i.type === "lost").length,
        claimedItems: itemsData.filter((i) => i.status === "claimed").length,
        totalUsers: usersData.length,
      });
    } catch {
      // load failed
    } finally {
      setLoading(false);
    }
  };


  if (authLoading || verifying) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <p className="text-[var(--muted)]">Loading...</p>
      </div>
    );
  }

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
        <h1 className="font-display text-3xl font-extrabold">Dashboard</h1>
        <button
          onClick={loadData}
          disabled={loading}
          className="font-display flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--surface)] border border-[var(--border)] hover:bg-[var(--border)] hover:-translate-y-0.5 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed transition-all text-sm font-semibold"
        >
          <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <div className="p-4 rounded-xl bg-[var(--surface)] border border-[var(--border)]">
            <div className="font-display text-2xl font-bold">{stats.totalItems}</div>
            <div className="text-sm text-[var(--muted)]">Total Items</div>
          </div>
          <div className="p-4 rounded-xl bg-teal/10 border border-teal/20">
            <div className="font-display text-2xl font-bold text-teal">{stats.foundItems}</div>
            <div className="text-sm text-[var(--muted)]">Found</div>
          </div>
          <div className="p-4 rounded-xl bg-red/10 border border-red/20">
            <div className="font-display text-2xl font-bold text-red">{stats.lostItems}</div>
            <div className="text-sm text-[var(--muted)]">Lost</div>
          </div>
          <div className="p-4 rounded-xl bg-yellow/10 border border-yellow/20">
            <div className="font-display text-2xl font-bold text-yellow">{stats.claimedItems}</div>
            <div className="text-sm text-[var(--muted)]">Resolved</div>
          </div>
          <div className="p-4 rounded-xl bg-blue/10 border border-blue/20">
            <div className="font-display text-2xl font-bold text-blue">{stats.totalUsers}</div>
            <div className="text-sm text-[var(--muted)]">Users</div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveTab("items")}
          className={`font-display px-4 py-2 rounded-xl font-semibold cursor-pointer transition-all text-sm ${
            activeTab === "items"
              ? "bg-[var(--foreground)] text-[var(--background)]"
              : "bg-[var(--surface)] border border-[var(--border)] hover:-translate-y-0.5"
          }`}
        >
          Items ({items.length})
        </button>
        <button
          onClick={() => setActiveTab("users")}
          className={`font-display px-4 py-2 rounded-xl font-semibold cursor-pointer transition-all text-sm ${
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
                <th className="font-display text-left py-3 px-2 text-xs font-bold uppercase tracking-wide">Type</th>
                <th className="font-display text-left py-3 px-2 text-xs font-bold uppercase tracking-wide">Category</th>
                <th className="font-display text-left py-3 px-2 text-xs font-bold uppercase tracking-wide">Location</th>
                <th className="font-display text-left py-3 px-2 text-xs font-bold uppercase tracking-wide">Status</th>
                <th className="font-display text-left py-3 px-2 text-xs font-bold uppercase tracking-wide">User</th>
                <th className="font-display text-left py-3 px-2 text-xs font-bold uppercase tracking-wide">Date</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} className="border-b border-[var(--border)] hover:bg-[var(--surface)]">
                  <td className="py-3 px-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${item.type === "found" ? "bg-teal/20 text-teal" : "bg-red/20 text-red"}`}>
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
                    <span className={`px-2 py-1 rounded-full text-xs ${item.status === "claimed" ? "bg-yellow/20 text-yellow" : "bg-[var(--surface)]"}`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="py-3 px-2 text-sm text-[var(--muted)]">{item.userEmail}</td>
                  <td className="py-3 px-2 text-sm text-[var(--muted)]">
                    {item.createdAt?.toDate ? formatDate(item.createdAt.toDate()) : "—"}
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
                <th className="font-display text-left py-3 px-2 text-xs font-bold uppercase tracking-wide">Name</th>
                <th className="font-display text-left py-3 px-2 text-xs font-bold uppercase tracking-wide">Email</th>
                <th className="font-display text-left py-3 px-2 text-xs font-bold uppercase tracking-wide">Status</th>
                <th className="font-display text-left py-3 px-2 text-xs font-bold uppercase tracking-wide">Joined</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.uid} className="border-b border-[var(--border)] hover:bg-[var(--surface)]">
                  <td className="py-3 px-2 text-sm font-medium">{u.name}</td>
                  <td className="py-3 px-2 text-sm text-[var(--muted)]">{u.email}</td>
                  <td className="py-3 px-2">
                    {u.banned ? (
                      <span className="px-2 py-1 rounded-full text-xs bg-red/20 text-red">Banned</span>
                    ) : (
                      <span className="px-2 py-1 rounded-full text-xs bg-teal/20 text-teal">Active</span>
                    )}
                  </td>
                  <td className="py-3 px-2 text-sm text-[var(--muted)]">
                    {u.joinedAt?.toDate ? formatDate(u.joinedAt.toDate()) : "—"}
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
