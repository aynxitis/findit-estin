"use client";

import { X } from "lucide-react";

interface ConfirmModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  confirmVariant?: "danger" | "default";
  loading?: boolean;
}

export function ConfirmModal({
  open,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirm",
  confirmVariant = "default",
  loading,
}: ConfirmModalProps) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="relative w-full max-w-sm bg-[var(--background)] border border-[var(--border)] rounded-2xl p-6 animate-fade-up">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 text-[var(--muted)] hover:text-[var(--foreground)] cursor-pointer"
        >
          <X size={20} />
        </button>

        <h2 className="font-display text-xl font-bold mb-2">{title}</h2>
        <p className="text-[var(--muted)] mb-6">{message}</p>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 py-3 rounded-xl border border-[var(--border)] font-semibold hover:bg-[var(--surface)] hover:-translate-y-0.5 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed transition-all"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`flex-1 py-3 rounded-xl font-semibold hover:-translate-y-0.5 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed transition-all ${
              confirmVariant === "danger"
                ? "bg-red text-white"
                : "bg-[var(--foreground)] text-[var(--background)]"
            }`}
          >
            {loading ? "..." : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
