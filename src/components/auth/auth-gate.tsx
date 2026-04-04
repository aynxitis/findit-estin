"use client";

import { type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { Lock } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { GoogleButton } from "./google-button";

interface AuthGateProps {
  children: ReactNode;
  /** Fallback UI while loading */
  fallback?: ReactNode;
}

/** Route-specific gate messages */
function getGateContent(pathname: string) {
  if (pathname.startsWith("/profile")) {
    return {
      title: "See your posts & activity",
      description:
        "Sign in with your @estin.dz account to view and manage your found and lost reports.",
    };
  }
  if (pathname.startsWith("/browse")) {
    return {
      title: "ESTIN students only",
      description:
        "Sign in with your @estin.dz account to browse lost and found items.",
    };
  }
  if (pathname.startsWith("/report")) {
    return {
      title: "Sign in first",
      description:
        "You need to be signed in with your @estin.dz account to report an item.",
    };
  }
  return {
    title: "ESTIN students only",
    description:
      "Sign in with your @estin.dz account to access this page.",
  };
}

/**
 * Protects routes by requiring authentication.
 * Shows an inline "sign in required" screen if user is not authenticated,
 * with route-specific messaging matching the original FINDit design.
 */
export function AuthGate({ children, fallback }: AuthGateProps) {
  const { user, userDoc, loading, signIn, signingIn, error } = useAuth();
  const pathname = usePathname();
  const { title, description } = getGateContent(pathname);

  // Show loading state
  if (loading) {
    return fallback ?? <AuthGateLoader />;
  }

  // User is authenticated but banned — block access
  if (user && userDoc?.banned) {
    return (
      <div className="auth-gate animate-fade-up">
        <div className="auth-gate-icon">
          <Lock className="w-8 h-8 text-red" />
        </div>
        <h2 className="auth-gate-title font-display text-2xl font-extrabold tracking-tight text-red">
          Account suspended
        </h2>
        <p className="auth-gate-desc">
          Your account has been suspended. Contact the FINDit team if you think this is a mistake.
        </p>
      </div>
    );
  }

  // User is authenticated — render the page
  if (user) {
    return <>{children}</>;
  }

  // Not authenticated — show inline auth gate
  return (
    <div className="auth-gate animate-fade-up">
      <div className="auth-gate-icon">
        <Lock className="w-8 h-8" />
      </div>
      <h2 className="auth-gate-title font-display text-2xl font-extrabold tracking-tight">
        {title}
      </h2>
      <p className="auth-gate-desc">{description}</p>
      <div className="auth-gate-action">
        <GoogleButton
          onClick={async () => {
            try {
              await signIn();
            } catch {
              // Error shown below
            }
          }}
          loading={signingIn}
          disabled={signingIn}
          className="auth-gate-btn"
        />
      </div>
      {error && (
        <p className="text-sm text-red text-center animate-fade-up">
          {error.message}
        </p>
      )}
      <p className="auth-gate-note">
        Only <strong>@estin.dz</strong> accounts will be accepted.
      </p>
    </div>
  );
}

function AuthGateLoader() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
      <div className="relative">
        <div className="w-12 h-12 rounded-full border-2 border-border" />
        <div className="absolute inset-0 w-12 h-12 rounded-full border-2 border-t-yellow border-l-transparent border-r-transparent border-b-transparent animate-spin" />
      </div>
      <p className="text-sm text-muted-foreground animate-pulse">
        Loading...
      </p>
    </div>
  );
}
