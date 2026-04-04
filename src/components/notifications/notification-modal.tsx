"use client";

import { useEffect, useRef, useCallback } from "react";
import { X } from "lucide-react";
import { useNotifications } from "@/hooks/use-notifications";
import { formatTime } from "@/lib/utils";
import Image from "next/image";

interface NotificationModalProps {
  open: boolean;
  onClose: () => void;
}

export function NotificationModal({ open, onClose }: NotificationModalProps) {
  const { notifications, unreadCount, loading, markAllRead } = useNotifications();
  const markReadTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Memoize markAllRead to avoid re-renders
  const handleMarkAllRead = useCallback(() => {
    markAllRead();
  }, [markAllRead]);

  // Auto-mark as read after 1.5 seconds of viewing
  useEffect(() => {
    if (open && unreadCount > 0) {
      markReadTimerRef.current = setTimeout(() => {
        handleMarkAllRead();
      }, 1500);
    }

    return () => {
      if (markReadTimerRef.current) {
        clearTimeout(markReadTimerRef.current);
      }
    };
  }, [open, unreadCount, handleMarkAllRead]);

  // Close on Escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (open) document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="relative w-full max-w-md bg-[var(--background)] border border-[var(--border)] rounded-2xl overflow-hidden animate-fade-up max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="p-6 pb-4 border-b border-[var(--border)]">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1 text-[var(--muted)] hover:text-[var(--foreground)] cursor-pointer"
          >
            <X size={20} />
          </button>

          <div className="flex justify-center mb-4">
            <Image src="/findit.svg" alt="FINDit" width={80} height={24} className="h-6 w-auto" />
          </div>

          <h2 className="font-display text-xl font-bold text-center">
            Notifications
          </h2>

          <div className="flex items-center justify-between mt-2">
            <span className="text-sm text-[var(--muted)]">
              {notifications.length === 0
                ? "No notifications"
                : unreadCount === 0
                ? `${notifications.length} notification${notifications.length > 1 ? "s" : ""}`
                : `${unreadCount} unread`}
            </span>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="text-sm text-yellow hover:underline cursor-pointer"
              >
                Mark all read
              </button>
            )}
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="h-20 bg-[var(--surface)] rounded-xl animate-pulse"
                />
              ))}
            </div>
          ) : notifications.length === 0 ? (
            <div className="py-12 text-center">
              <div className="text-4xl mb-4">🔔</div>
              <p className="text-[var(--muted)]">
                No notifications yet.
                <br />
                They&apos;ll show up here when someone claims your item.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {notifications.map((notif) => (
                <div
                  key={notif.id}
                  className={`p-4 rounded-xl border transition-colors ${
                    notif.read
                      ? "bg-[var(--surface)] border-[var(--border)]"
                      : "bg-yellow/5 border-yellow/20"
                  }`}
                >
                  <p className="text-sm">
                    {notif.message || "Someone interacted with your post."}
                  </p>
                  {notif.claimerName && (
                    <p className="text-sm text-[var(--muted)] mt-1">
                      👤 {notif.claimerName}
                      {notif.claimerEmail && ` · ${notif.claimerEmail}`}
                    </p>
                  )}
                  <p className="text-xs text-[var(--muted)] mt-2">
                    {notif.createdAt?.toDate
                      ? formatTime(notif.createdAt.toDate())
                      : "—"}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
