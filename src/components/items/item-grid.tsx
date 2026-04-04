"use client";

import { ItemCard } from "./item-card";
import type { Item } from "@/lib/types/item";
import Link from "next/link";

interface ItemGridProps {
  items: Item[];
  loading: boolean;
  error: string | null;
  currentUserId?: string | null;
  onClaim?: (item: Item) => void;
  emptyType?: "found" | "lost";
  searchQuery?: string;
}

export function ItemGrid({
  items,
  loading,
  error,
  currentUserId,
  onClaim,
  emptyType = "found",
  searchQuery,
}: ItemGridProps) {
  if (loading) {
    return (
      <div className="items-grid">
        <div className="loading-state">Loading items…</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="items-grid">
        <div className="loading-state">{error}. Please refresh.</div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="items-grid">
        <div className="empty-state">
          <div className="empty-state-icon">
            {emptyType === "found" ? "🔍" : "📭"}
          </div>
          <h3>
            {searchQuery
              ? "No results found"
              : emptyType === "found"
              ? "No found items yet"
              : "No lost reports yet"}
          </h3>
          <p>
            {searchQuery
              ? `Nothing matched "${searchQuery}". Try a different keyword or clear your search.`
              : emptyType === "found"
              ? "Nothing has been posted yet. If you found something, be the first to post it."
              : "Nobody has reported a lost item matching your filters."}
          </p>
          {!searchQuery && (
            <Link
              href={emptyType === "found" ? "/report/found" : "/report/lost"}
              className="btn-primary mt-4"
            >
              {emptyType === "found" ? "Post a found item" : "Report a lost item"}
            </Link>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="items-grid">
      {items.map((item, index) => (
        <ItemCard
          key={item.id}
          item={item}
          currentUserId={currentUserId}
          onClaim={onClaim}
          index={index}
        />
      ))}
    </div>
  );
}
