"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import Link from "next/link";
import { Search, X } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useItems } from "@/hooks/use-items";
import { ItemGrid, ItemFilters, ClaimModal } from "@/components/items";
import type { Item, ItemType } from "@/lib/types/item";

export default function BrowsePage() {
  const { user } = useAuth();
  
  // Filter state
  const [activeType, setActiveType] = useState<ItemType>("found");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [activeLocation, setActiveLocation] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchInput, setSearchInput] = useState("");
  
  // Claim modal state
  const [claimItem, setClaimItem] = useState<Item | null>(null);
  const [claimModalOpen, setClaimModalOpen] = useState(false);

  // Debounce timer ref for cleanup
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Cleanup debounce timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  // Debounced search with proper cleanup
  const handleSearchChange = useCallback((value: string) => {
    setSearchInput(value);
    
    // Clear previous timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    
    // Set new debounced search
    debounceTimerRef.current = setTimeout(() => {
      setSearchQuery(value.toLowerCase());
    }, 200);
  }, []);

  // Get items with current filters
  const { items, loading, error } = useItems({
    type: activeType,
    category: activeCategory,
    location: activeLocation,
    searchQuery,
  });

  const handleClaim = (item: Item) => {
    setClaimItem(item);
    setClaimModalOpen(true);
  };

  const handleClearFilters = () => {
    setActiveCategory(null);
    setActiveLocation(null);
  };

  const handleTypeChange = (type: ItemType) => {
    setActiveType(type);
    setSearchInput("");
    setSearchQuery("");
    handleClearFilters();
  };

  return (
    <div className="browse-content px-4 sm:px-6 py-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="browse-header flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="browse-header-left">
          <p className="page-tag text-xs tracking-[0.15em] uppercase text-teal font-bold font-display mb-1">
            Campus lost & found
          </p>
          <h1 className="page-title font-display text-3xl font-extrabold tracking-tight">
            Browse items
          </h1>
          <p className="page-sub text-sm text-muted mt-1">
            Showing {activeType} items — newest first
          </p>
        </div>
        
        {/* Type Toggle */}
        <div className="type-toggle flex rounded-full p-1 bg-surface border border-border" role="tablist" aria-label="Item type filter">
          <button
            className={`toggle-btn ${activeType === "found" ? "active-found" : ""}`}
            onClick={() => handleTypeChange("found")}
            role="tab"
            aria-selected={activeType === "found"}
          >
            ✦ Found
          </button>
          <button
            className={`toggle-btn ${activeType === "lost" ? "active-lost" : ""}`}
            onClick={() => handleTypeChange("lost")}
            role="tab"
            aria-selected={activeType === "lost"}
          >
            Lost
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="search-wrap relative mb-4">
        <Search className="search-icon absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" aria-hidden="true" />
        <input
          type="search"
          className="search-input w-full pl-11 pr-10 py-3 rounded-xl bg-surface border border-border text-sm placeholder:text-muted focus:outline-none focus:border-yellow transition-colors"
          placeholder="Search by category, location, description…"
          value={searchInput}
          onChange={(e) => handleSearchChange(e.target.value)}
          aria-label="Search items"
        />
        {searchInput && (
          <button
            className="search-clear absolute right-4 top-1/2 -translate-y-1/2 text-muted hover:text-foreground transition-colors cursor-pointer"
            onClick={() => {
              setSearchInput("");
              setSearchQuery("");
            }}
            aria-label="Clear search"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Filters */}
      <ItemFilters
        activeType={activeType}
        activeCategory={activeCategory}
        activeLocation={activeLocation}
        onCategoryChange={setActiveCategory}
        onLocationChange={setActiveLocation}
        onClearFilters={handleClearFilters}
      />

      {/* Report Lost Banner (only on Found tab) */}
      {activeType === "found" && (
        <div className="report-banner flex items-center justify-between gap-4 p-4 my-6 rounded-xl bg-red/10 border border-red/30">
          <p className="text-sm">
            <strong>Don&apos;t see your item?</strong> Post a lost report and we&apos;ll notify you if something matching shows up.
          </p>
          <Link
            href="/report/lost"
            className="btn-primary text-xs px-4 py-2 whitespace-nowrap"
          >
            Report it lost →
          </Link>
        </div>
      )}

      {/* Results Count */}
      {!loading && !error && items.length > 0 && (
        <div className="results-count text-sm text-muted mb-4">
          {items.length} item{items.length !== 1 ? "s" : ""}
        </div>
      )}

      {/* Items Grid */}
      <ItemGrid
        items={items}
        loading={loading}
        error={error}
        currentUserId={user?.uid}
        onClaim={handleClaim}
        emptyType={activeType}
        searchQuery={searchQuery}
      />

      {/* Claim Modal */}
      <ClaimModal
        item={claimItem}
        open={claimModalOpen}
        onOpenChange={setClaimModalOpen}
        onClaimSuccess={() => {
          // Items will auto-update via real-time subscription
        }}
      />
    </div>
  );
}
