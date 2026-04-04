"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { SignInModal } from "@/components/auth";
import { AccountModal } from "@/components/profile";
import { NotificationBell } from "@/components/notifications/notification-bell";
import { useAuth } from "@/hooks/use-auth";

interface NavProps {
  minimal?: boolean;
}

export function Nav({ minimal = false }: NavProps) {
  const { user, loading } = useAuth();
  const [showSignInModal, setShowSignInModal] = useState(false);
  const [showAccountModal, setShowAccountModal] = useState(false);

  return (
    <>
      <nav className="nav-bar">
        <Link href="/" className="flex items-center flex-shrink-0">
          <Image
            src="/findit.svg"
            alt="FINDit"
            width={80}
            height={24}
            className="h-6 w-auto"
            priority
          />
        </Link>

        {!minimal && (
          <div className="flex items-center gap-2.5">
            {/* Auth section */}
            {loading ? (
              <div className="w-16 h-8 rounded-full bg-white/5 animate-pulse" />
            ) : user ? (
              <>
                <NotificationBell />
                <button
                  onClick={() => setShowAccountModal(true)}
                  className="nav-avatar"
                  aria-label="Account"
                >
                  {user.photoURL ? (
                    <Image
                      src={user.photoURL}
                      alt={user.displayName || "Profile"}
                      width={32}
                      height={32}
                      className="w-8 h-8 object-cover"
                    />
                  ) : (
                    <svg viewBox="0 0 24 24">
                      <circle cx="12" cy="12" r="12" className="avatar-bg" />
                      <circle cx="12" cy="9" r="3.5" className="avatar-icon" />
                      <path
                        d="M4 20c0-4 3.6-7 8-7s8 3 8 7"
                        className="avatar-icon"
                      />
                    </svg>
                  )}
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setShowSignInModal(true)}
                  className="btn-primary"
                >
                  Sign in
                </button>
                {/* Blank avatar placeholder when signed out - links to profile page */}
                <Link href="/profile" className="nav-avatar" aria-label="Profile">
                  <svg viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="12" className="avatar-bg" />
                    <circle cx="12" cy="9" r="3.5" className="avatar-icon" />
                    <path
                      d="M4 20c0-4 3.6-7 8-7s8 3 8 7"
                      className="avatar-icon"
                    />
                  </svg>
                </Link>
              </>
            )}
          </div>
        )}
      </nav>

      {!minimal && (
        <>
          <SignInModal open={showSignInModal} onOpenChange={setShowSignInModal} />
          <AccountModal open={showAccountModal} onClose={() => setShowAccountModal(false)} />
        </>
      )}
    </>
  );
}
