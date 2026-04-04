"use client";

import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { User as FirebaseUser } from "firebase/auth";
import {
  onAuthChange,
  signInWithGoogle,
  signOut as authSignOut,
  getUserDocument,
  type AuthError,
} from "@/lib/firebase/auth";
import type { User } from "@/lib/types/item";

export interface AuthContextValue {
  /** Firebase user object (null if not signed in) */
  user: FirebaseUser | null;
  /** User document from Firestore (null if not fetched or not signed in) */
  userDoc: User | null;
  /** Whether authentication state is still loading */
  loading: boolean;
  /** Whether a sign-in is in progress */
  signingIn: boolean;
  /** Sign in with Google */
  signIn: () => Promise<void>;
  /** Sign out */
  signOut: () => Promise<void>;
  /** Last authentication error */
  error: AuthError | null;
  /** Clear the current error */
  clearError: () => void;
}

export const AuthContext = createContext<AuthContextValue | undefined>(
  undefined
);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [userDoc, setUserDoc] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [signingIn, setSigningIn] = useState(false);
  const [error, setError] = useState<AuthError | null>(null);

  // Subscribe to auth state changes
  useEffect(() => {
    const unsubscribe = onAuthChange(async (firebaseUser) => {
      setUser(firebaseUser);

      if (firebaseUser) {
        try {
          const doc = await getUserDocument(firebaseUser.uid);
          setUserDoc(doc);
        } catch {
          setUserDoc(null);
          setError({ code: "firestore/read-failed", message: "Failed to load your account data. Please refresh." });
        }
      } else {
        setUserDoc(null);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signIn = useCallback(async () => {
    setError(null);
    setSigningIn(true);

    try {
      await signInWithGoogle();
    } catch (err) {
      const authError = err as AuthError;
      setError(authError);
      throw authError;
    } finally {
      setSigningIn(false);
    }
  }, []);

  const signOut = useCallback(async () => {
    setError(null);
    try {
      await authSignOut();
      // State cleanup is handled by the onAuthChange listener — no manual reset needed
    } catch (err) {
      const authError = err as AuthError;
      setError(authError);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      userDoc,
      loading,
      signingIn,
      signIn,
      signOut,
      error,
      clearError,
    }),
    [user, userDoc, loading, signingIn, signIn, signOut, error, clearError]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
