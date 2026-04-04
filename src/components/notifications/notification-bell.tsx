"use client";

import { useState } from "react";
import { Bell } from "lucide-react";
import { useNotifications } from "@/hooks/use-notifications";
import { NotificationModal } from "./notification-modal";

export function NotificationBell() {
  const { unreadCount } = useNotifications();
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="relative p-2 rounded-full bg-[var(--surface)] border border-[var(--border)] hover:border-yellow hover:bg-yellow/10 hover:text-yellow hover:-translate-y-0.5 transition-all cursor-pointer group"
        aria-label="Notifications"
      >
        <Bell size={16} className="transition-all group-hover:text-yellow group-hover:animate-bell-swing" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-red text-white text-xs font-bold rounded-full flex items-center justify-center">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      <NotificationModal
        open={showModal}
        onClose={() => setShowModal(false)}
      />
    </>
  );
}
