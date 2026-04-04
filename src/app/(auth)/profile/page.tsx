"use client";

import { useState, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { doc, updateDoc, deleteDoc } from "firebase/firestore";
import { getClientDb } from "@/lib/firebase/client";
import { useAuth } from "@/hooks/use-auth";
import { useItems } from "@/hooks/use-items";
import { ProfileHeader, ProfileItemCard, AccountModal } from "@/components/profile";
import { ConfirmModal } from "@/components/ui";
import type { Item, ItemType } from "@/lib/types/item";

export default function ProfilePage() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const showSuccess = searchParams.get("success") === "true";

  const { items, loading } = useItems({ userUID: user?.uid });

  const [type, setType] = useState<ItemType>("found");
  const [deleteItem, setDeleteItem] = useState<Item | null>(null);
  const [resolvingId, setResolvingId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [showAccount, setShowAccount] = useState(false);

  // Filter items by type
  const filteredItems = useMemo(() => {
    return items.filter((item) => item.type === type);
  }, [items, type]);

  // Stats
  const stats = useMemo(() => {
    return {
      found: items.filter((i) => i.type === "found").length,
      lost: items.filter((i) => i.type === "lost").length,
      claimed: items.filter((i) => i.status === "claimed").length,
    };
  }, [items]);

  // Resolve item
  const handleResolve = async (item: Item) => {
    setResolvingId(item.id);
    try {
      const db = getClientDb();
      await updateDoc(doc(db, "items", item.id), { status: "claimed" });
    } catch {
      // Silently handle error - UI state will reflect failure
    } finally {
      setResolvingId(null);
    }
  };

  // Delete item
  const handleDelete = async () => {
    if (!deleteItem) return;
    setDeleting(true);
    try {
      const db = getClientDb();
      await deleteDoc(doc(db, "items", deleteItem.id));
      setDeleteItem(null);
    } catch {
      // Silently handle error - item remains in list
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="max-w-[860px] mx-auto px-6 py-12">
      {/* Success message */}
      {showSuccess && (
        <div className="mb-6 p-4 rounded-xl bg-teal/10 border border-teal text-center">
          <span className="text-teal font-semibold">✓ Your post was submitted successfully!</span>
        </div>
      )}

      {/* Back link */}
      <Link
        href="/browse"
        className="inline-flex items-center gap-2 text-white/35 text-sm font-display font-bold mb-10 hover:text-yellow transition-colors cursor-pointer"
      >
        ← Back to browse
      </Link>

      {/* Profile header */}
      <ProfileHeader stats={stats} />

      {/* Section header */}
      <div className="flex items-center justify-between flex-wrap gap-4 mb-5">
        <span className="font-display text-[0.7rem] font-bold tracking-[0.18em] uppercase text-white/40">
          Your posts
        </span>
        <div className="flex bg-white/[0.04] border border-white/[0.08] rounded-full p-[3px] gap-[2px]">
          <button
            onClick={() => setType("found")}
            className={`px-4 py-1.5 rounded-full font-display text-[0.75rem] font-bold cursor-pointer transition-all whitespace-nowrap ${
              type === "found"
                ? "bg-teal text-black"
                : "bg-transparent text-white/40"
            }`}
          >
            ✦ Found
          </button>
          <button
            onClick={() => setType("lost")}
            className={`px-4 py-1.5 rounded-full font-display text-[0.75rem] font-bold cursor-pointer transition-all whitespace-nowrap ${
              type === "lost"
                ? "bg-red text-white"
                : "bg-transparent text-white/40"
            }`}
          >
            Lost
          </button>
        </div>
      </div>

      {/* Items grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="aspect-[4/3] bg-[var(--surface)] border border-[var(--border)] rounded-2xl animate-pulse"
            />
          ))}
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="py-16 text-center flex flex-col items-center gap-3">
          <div className="text-[2.5rem] opacity-30">
            {type === "found" ? "🔍" : "😔"}
          </div>
          <h3 className="font-display text-lg font-extrabold">
            No {type} items yet
          </h3>
          <p className="text-sm text-white/35 max-w-[280px] leading-relaxed">
            You haven&apos;t posted any {type} items. Help your fellow ESTIN students!
          </p>
          <Link
            href={type === "found" ? "/report/found" : "/report/lost"}
            className={`mt-2 inline-block px-6 py-3 rounded-xl font-semibold cursor-pointer ${
              type === "found" ? "bg-teal text-black" : "bg-red text-white"
            }`}
          >
            {type === "found" ? "Post a found item →" : "Report a lost item →"}
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredItems.map((item, index) => (
            <div
              key={item.id}
              className="animate-fade-up"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <ProfileItemCard
                item={item}
                onResolve={() => handleResolve(item)}
                onDelete={() => setDeleteItem(item)}
                resolving={resolvingId === item.id}
              />
            </div>
          ))}
        </div>
      )}

      {/* Delete modal */}
      <ConfirmModal
        open={!!deleteItem}
        onClose={() => setDeleteItem(null)}
        onConfirm={handleDelete}
        title="Delete this post?"
        message="This action cannot be undone. The item will be permanently removed from FINDit."
        confirmText="Delete"
        confirmVariant="danger"
        loading={deleting}
      />

      {/* Account modal */}
      <AccountModal
        open={showAccount}
        onClose={() => setShowAccount(false)}
      />
    </div>
  );
}
