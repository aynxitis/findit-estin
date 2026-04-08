"use client";

import { useEffect, useState } from "react";
import {
  collection,
  doc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  type Query,
  type DocumentData,
} from "firebase/firestore";
import { getClientDb } from "@/lib/firebase/client";
import type { Item, ItemType } from "@/lib/types/item";

const FETCH_LIMIT = 100;

export interface UseItemsOptions {
  type?: ItemType;
  category?: string | null;
  location?: string | null;
  searchQuery?: string;
  userId?: string | null;
  userUID?: string | null; // Alias for userId, used by profile page
}

export interface UseItemsResult {
  items: Item[];
  loading: boolean;
  error: string | null;
}

export function useItems(options: UseItemsOptions = {}): UseItemsResult {
  const { type = "found", category, location, searchQuery, userId, userUID } = options;
  const effectiveUserId = userUID || userId;
  
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Only run on client side
    if (typeof window === "undefined") return;

    // Track if this effect is still current (for cleanup)
    let isCurrent = true;

    // Reset state for new query so stale items don't flash
    setItems([]);
    setLoading(true);
    setError(null);

    try {
      const db = getClientDb();
      const itemsRef = collection(db, "items");
      
      // Build query constraints — push category/location filters to Firestore
      // when possible to reduce bandwidth and read costs.
      const constraints = [];

      if (effectiveUserId) {
        // Profile page: get ALL user's items (no type filter in query)
        constraints.push(where("userUID", "==", effectiveUserId));
      } else {
        // Browse page: get items by type
        constraints.push(where("type", "==", type));
      }

      if (category) {
        constraints.push(where("category", "==", category));
      }
      if (location) {
        constraints.push(where("location", "==", location));
      }

      constraints.push(orderBy("createdAt", "desc"));
      constraints.push(limit(FETCH_LIMIT));

      const q: Query<DocumentData> = query(itemsRef, ...constraints);

      // Subscribe to real-time updates
      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          if (!isCurrent) return;

          let fetchedItems = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })) as unknown as Item[];

          // Client-side search filter (Firestore has no full-text search)
          if (searchQuery) {
            const normalizedQuery = searchQuery.toLowerCase();
            fetchedItems = fetchedItems.filter((item) => {
              const searchable = [
                item.category,
                item.location,
                item.description || "",
              ]
                .join(" ")
                .toLowerCase();
              return searchable.includes(normalizedQuery);
            });
          }

          setItems(fetchedItems);
          setLoading(false);
        },
        () => {
          if (!isCurrent) return;
          setError("Failed to load items");
          setLoading(false);
        }
      );

      return () => {
        isCurrent = false;
        unsubscribe();
      };
    } catch {
      if (isCurrent) {
        setError("Failed to connect to database");
        setLoading(false);
      }
    }
  }, [type, category, location, searchQuery, effectiveUserId]);

  return { items, loading, error };
}

// Hook for a single item
export function useItem(itemId: string | null) {
  const [item, setItem] = useState<Item | null>(null);
  // Initialize loading based on whether we have an itemId to fetch
  const [loading, setLoading] = useState(!!itemId);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!itemId || typeof window === "undefined") {
      // No need to setLoading here - it's already correctly initialized
      return;
    }

    let isCurrent = true;
    const db = getClientDb();
    const itemDocRef = doc(db, "items", itemId);

    const unsubscribe = onSnapshot(
      itemDocRef,
      (snapshot) => {
        if (!isCurrent) return;
        if (!snapshot.exists()) {
          setItem(null);
          setError("Item not found");
        } else {
          setItem({ id: snapshot.id, ...snapshot.data() } as unknown as Item);
        }
        setLoading(false);
      },
      () => {
        if (!isCurrent) return;
        setError("Failed to load item");
        setLoading(false);
      }
    );

    return () => {
      isCurrent = false;
      unsubscribe();
    };
  }, [itemId]);

  return { item, loading, error };
}
