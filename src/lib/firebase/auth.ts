"use client";

import {
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  type User as FirebaseUser,
} from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { getClientAuth, getClientDb, getGoogleProvider } from "./client";
import type { User } from "@/lib/types/item";

const ALLOWED_DOMAIN = "estin.dz";

export type AuthUser = FirebaseUser;

export interface AuthError {
  code: string;
  message: string;
}

/**
 * Validates that an email belongs to the allowed domain
 */
export function isAllowedDomain(email: string | null): boolean {
  if (!email) return false;
  return email.endsWith(`@${ALLOWED_DOMAIN}`);
}

/**
 * Sign in with Google OAuth
 * - Validates domain restriction
 * - Creates user document on first sign-in
 * @returns The signed-in user or throws an error
 */
export async function signInWithGoogle(): Promise<FirebaseUser> {
  const auth = getClientAuth();
  const googleProvider = getGoogleProvider();
  
  // Configure Google provider to show only estin.dz accounts
  googleProvider.setCustomParameters({ hd: ALLOWED_DOMAIN });

  const result = await signInWithPopup(auth, googleProvider);
  const user = result.user;

  // Validate domain (double-check even with hd parameter)
  if (!isAllowedDomain(user.email)) {
    await firebaseSignOut(auth);
    throw {
      code: "auth/invalid-domain",
      message: `Only @${ALLOWED_DOMAIN} accounts are accepted.`,
    } as AuthError;
  }

  // Create user document on first sign-in
  await createUserDocumentIfNeeded(user);

  return user;
}

/**
 * Creates a user document in Firestore if it doesn't exist
 */
export async function createUserDocumentIfNeeded(
  user: FirebaseUser
): Promise<void> {
  const db = getClientDb();
  const userRef = doc(db, "users", user.uid);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) {
    await setDoc(userRef, {
      name: user.displayName || "Anonymous",
      email: user.email,
      photo: user.photoURL,
      verified: true,
      joinedAt: serverTimestamp(),
    });
  }
}

/**
 * Fetches the user document from Firestore
 */
export async function getUserDocument(uid: string): Promise<User | null> {
  const db = getClientDb();
  const userRef = doc(db, "users", uid);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) {
    return null;
  }

  const data = userSnap.data();
  return {
    ...data,
    uid,
    name: data?.name ?? "Anonymous",
    email: data?.email ?? "",
    verified: data?.verified ?? false,
  } as User;
}

/**
 * Sign out the current user
 */
export async function signOut(): Promise<void> {
  const auth = getClientAuth();
  await firebaseSignOut(auth);
}

/**
 * Subscribe to authentication state changes
 * @returns Unsubscribe function
 */
export function onAuthChange(
  callback: (user: FirebaseUser | null) => void
): () => void {
  const auth = getClientAuth();
  return onAuthStateChanged(auth, callback);
}

/**
 * Get the current user synchronously (may be null on initial load)
 */
export function getCurrentUser(): FirebaseUser | null {
  const auth = getClientAuth();
  return auth.currentUser;
}
