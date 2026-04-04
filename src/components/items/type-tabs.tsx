"use client";

import { cn } from "@/lib/utils";
import type { ItemType } from "@/lib/types/item";

interface TypeTabsProps {
  value: ItemType;
  onChange: (type: ItemType) => void;
  counts?: { found: number; lost: number };
}

export function TypeTabs({ value, onChange, counts }: TypeTabsProps) {
  return (
    <div className="flex gap-2">
      <button
        onClick={() => onChange("found")}
        className={cn(
          "flex-1 py-3 rounded-xl font-semibold transition-colors cursor-pointer",
          value === "found"
            ? "bg-teal text-black"
            : "bg-[var(--surface)] border border-[var(--border)] text-[var(--muted)] hover:text-[var(--foreground)]"
        )}
      >
        Found {counts && `(${counts.found})`}
      </button>
      <button
        onClick={() => onChange("lost")}
        className={cn(
          "flex-1 py-3 rounded-xl font-semibold transition-colors cursor-pointer",
          value === "lost"
            ? "bg-red text-white"
            : "bg-[var(--surface)] border border-[var(--border)] text-[var(--muted)] hover:text-[var(--foreground)]"
        )}
      >
        Lost {counts && `(${counts.lost})`}
      </button>
    </div>
  );
}
