"use client";

import { useState, useEffect, useCallback } from "react";
import { getAuth } from "firebase/auth";
import { useAuth } from "./use-auth";

interface UseAdminAuthResult {
  /** Whether admin verification is complete */
  verified: boolean;
  /** Whether the current user is a verified admin */
  isAdmin: boolean;
  /** Whether verification is still in progress */
  verifying: boolean;
  /** Get a fresh ID token for authenticated admin API calls */
  getToken: () => Promise<string | null>;
}

export function useAdminAuth(): UseAdminAuthResult {
  const { user, loading: authLoading } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [verifying, setVerifying] = useState(true);

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      setIsAdmin(false);
      setVerifying(false);
      return;
    }

    let isCurrent = true;

    async function verify() {
      try {
        const auth = getAuth();
        const token = await auth.currentUser?.getIdToken(true);
        if (!token) {
          if (isCurrent) { setIsAdmin(false); setVerifying(false); }
          return;
        }

        const res = await fetch("/api/admin/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({}),
        });
        const data = await res.json();
        if (isCurrent) setIsAdmin(data.isAdmin === true);
      } catch {
        if (isCurrent) setIsAdmin(false);
      } finally {
        if (isCurrent) setVerifying(false);
      }
    }

    verify();
    return () => { isCurrent = false; };
  }, [user, authLoading]);

  const getToken = useCallback(async (): Promise<string | null> => {
    return getAuth().currentUser?.getIdToken() ?? null;
  }, []);

  return {
    verified: !verifying,
    isAdmin,
    verifying: verifying || authLoading,
    getToken,
  };
}
