import "server-only";
import { getAdminAuth } from "@/lib/firebase/admin";

export const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || "")
  .split(",")
  .map((e) => e.trim())
  .filter(Boolean);

/**
 * Verifies that the given Firebase ID token belongs to an admin user.
 * Returns the decoded token if authorized, or null if the user is not an admin.
 * Throws if the token itself is invalid (lets the caller's catch block handle it).
 */
export async function verifyAdmin(token: string) {
  const adminAuth = getAdminAuth();
  const decoded = await adminAuth.verifyIdToken(token);
  const isAdmin = decoded.email ? ADMIN_EMAILS.includes(decoded.email) : false;
  if (!isAdmin) return null;
  return decoded;
}
