"use client";

import { X } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/hooks/use-auth";
import { toTitleCase } from "@/lib/utils";
import Image from "next/image";

interface AccountModalProps {
  open: boolean;
  onClose: () => void;
}

export function AccountModal({ open, onClose }: AccountModalProps) {
  const { user, signOut } = useAuth();

  if (!open || !user) return null;

  const firstName = toTitleCase(user.displayName?.split(" ")[0] || "there");

  const handleSignOut = async () => {
    await signOut();
    onClose();
  };

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

        {/* Logo */}
        <div className="flex justify-center mb-4">
          <Image src="/findit.svg" alt="FINDit" width={80} height={24} className="h-6 w-auto" />
        </div>

        {/* Welcome */}
        <p className="text-center text-[var(--muted)] mb-6">
          Welcome {firstName} — hope you put this app to good use.
        </p>

        {/* Links */}
        <div className="space-y-2 mb-6">
          <Link
            href="/profile"
            onClick={onClose}
            className="block w-full py-3 px-4 rounded-xl border border-[var(--border)] text-center font-display hover:border-yellow hover:bg-yellow/10 hover:text-yellow hover:-translate-y-0.5 transition-all cursor-pointer"
          >
            My profile & posts
          </Link>
          <Link
            href="/browse"
            onClick={onClose}
            className="block w-full py-3 px-4 rounded-xl border border-[var(--border)] text-center font-display hover:border-yellow hover:bg-yellow/10 hover:text-yellow hover:-translate-y-0.5 transition-all cursor-pointer"
          >
            Browse lost & found items
          </Link>
          <a
            href="mailto:am_belamri@estin.dz"
            className="block w-full py-3 px-4 rounded-xl border border-[var(--border)] text-center font-display hover:border-yellow hover:bg-yellow/10 hover:text-yellow hover:-translate-y-0.5 transition-all cursor-pointer"
          >
            Report a bug
          </a>
        </div>

        {/* Divider */}
        <div className="h-px bg-[var(--border)] mb-6" />

        {/* Sign out */}
        <button
          onClick={handleSignOut}
          className="w-full py-3 rounded-xl bg-red text-white font-display font-semibold hover:bg-red/90 cursor-pointer"
        >
          Sign out
        </button>
      </div>
    </div>
  );
}
