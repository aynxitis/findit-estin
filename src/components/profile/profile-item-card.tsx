"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";
import { CATEGORY_LABELS, CATEGORY_ICONS, LOCATION_LABELS } from "@/lib/constants/labels";
import type { Item } from "@/lib/types/item";

interface ProfileItemCardProps {
  item: Item;
  onResolve: () => void;
  onDelete: () => void;
  resolving?: boolean;
}

export function ProfileItemCard({
  item,
  onResolve,
  onDelete,
  resolving,
}: ProfileItemCardProps) {
  const icon = CATEGORY_ICONS[item.category] || "📦";
  const label = CATEGORY_LABELS[item.category] || item.category;
  const location = LOCATION_LABELS[item.location] || item.location;

  const date = item.createdAt?.toDate
    ? item.createdAt.toDate().toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "—";

  const isClaimed = item.status === "claimed";

  return (
    <div
      className={cn(
        "bg-[var(--surface)] border border-[var(--border)] rounded-2xl overflow-hidden",
        isClaimed && "opacity-60"
      )}
    >
      {/* Photo */}
      <div className="aspect-video relative bg-[var(--background)]">
        {item.photoURL ? (
          <Image
            src={item.photoURL}
            alt={label}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-5xl">
            {icon}
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-3 left-3 flex gap-2">
          <span
            className={cn(
              "px-2 py-1 rounded-full text-xs font-semibold",
              isClaimed
                ? "bg-[var(--muted)] text-[var(--background)]"
                : item.type === "found"
                ? "bg-teal text-black"
                : "bg-red text-white"
            )}
          >
            {isClaimed ? "Resolved" : item.type === "found" ? "Found" : "Lost"}
          </span>
        </div>
        <span className="absolute top-3 right-3 px-2 py-1 rounded-full bg-black/50 text-white text-xs">
          {date}
        </span>
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex items-center gap-2 font-medium">
          <span>{icon}</span>
          <span>{label}</span>
        </div>
        <div className="text-sm text-[var(--muted)] mt-1">📍 {location}</div>
        {item.description && (
          <p className="text-sm text-[var(--muted)] mt-2 line-clamp-2">
            {item.description}
          </p>
        )}

        {/* Actions */}
        <div className="flex gap-2 mt-4">
          {!isClaimed && (
            <button
              onClick={onResolve}
              disabled={resolving}
              className="flex-1 py-2 rounded-xl bg-teal text-black text-sm font-semibold font-display hover:bg-teal/80 hover:-translate-y-0.5 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed transition-all"
            >
              {resolving ? "..." : "Mark resolved ✓"}
            </button>
          )}
          <button
            onClick={onDelete}
            className={cn(
              "py-2 px-4 rounded-xl border border-[var(--border)] text-sm font-semibold font-display hover:bg-red hover:text-white hover:border-red hover:-translate-y-0.5 cursor-pointer transition-all",
              isClaimed && "flex-1"
            )}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
