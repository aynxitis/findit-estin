"use client";

import { useEffect, useState } from "react";
import {
  collection,
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
      
      // Build query constraints
      let q: Query<DocumentData>;
      
      if (effectiveUserId) {
        // Profile page: get ALL user's items (no type filter in query)
        q = query(
          itemsRef,
          where("userUID", "==", effectiveUserId),
          orderBy("createdAt", "desc"),
          limit(FETCH_LIMIT)
        );
      } else {
        // Browse page: get items by type
        q = query(
          itemsRef,
          where("type", "==", type),
          orderBy("createdAt", "desc"),
          limit(FETCH_LIMIT)
        );
      }

      // Subscribe to real-time updates
      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          if (!isCurrent) return;
          
          let fetchedItems = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })) as Item[];

          // Client-side filtering for category and location
          if (category) {
            fetchedItems = fetchedItems.filter((item) => item.category === category);
          }
          if (location) {
            fetchedItems = fetchedItems.filter((item) => item.location === location);
          }
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
    const itemRef = collection(db, "items");
    
    // For single item, we could use getDoc, but let's use onSnapshot for consistency
    const q = query(itemRef, where("__name__", "==", itemId), limit(1));
    
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        if (!isCurrent) return;
        if (snapshot.empty) {
          setItem(null);
          setError("Item not found");
        } else {
          const doc = snapshot.docs[0];
          setItem({ id: doc.id, ...doc.data() } as Item);
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
