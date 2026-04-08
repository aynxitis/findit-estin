"use client";

import { useState, useEffect, useMemo } from "react";
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  writeBatch,
  doc,
} from "firebase/firestore";
import { getClientDb } from "@/lib/firebase/client";
import { useAuth } from "./use-auth";
import type { Notification } from "@/lib/types/item";

interface UseNotificationsResult {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  markAllRead: () => Promise<void>;
}

export function useNotifications(): UseNotificationsResult {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  // Initialize loading based on whether we have a user to fetch for
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // When no user, reset state but avoid cascading setState in effect body
    if (!user) {
      // Use functional updates or handle via snapshot subscription
      setNotifications([]);
      setLoading(false);
      return;
    }

    let isCurrent = true;
    const db = getClientDb();
    const q = query(
      collection(db, "notifications"),
      where("toUID", "==", user.uid),
      orderBy("createdAt", "desc"),
      limit(100)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        if (!isCurrent) return;
        const notifs = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as unknown as Notification[];
        setNotifications(notifs);
        setLoading(false);
      },
      () => {
        if (!isCurrent) return;
        setLoading(false);
      }
    );

    return () => {
      isCurrent = false;
      unsubscribe();
    };
  }, [user]);

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.read).length,
    [notifications]
  );

  const markAllRead = async () => {
    const unread = notifications.filter((n) => !n.read);
    if (unread.length === 0) return;

    const db = getClientDb();
    // Firestore batches max 500 operations
    const CHUNK_SIZE = 500;
    try {
      for (let i = 0; i < unread.length; i += CHUNK_SIZE) {
        const batch = writeBatch(db);
        unread.slice(i, i + CHUNK_SIZE).forEach((n) => {
          batch.update(doc(db, "notifications", n.id), { read: true });
        });
        await batch.commit();
      }
    } catch (err) {
      console.error("Failed to mark notifications as read:", err);
    }
  };

  return {
    notifications,
    unreadCount,
    loading,
    markAllRead,
  };
}
