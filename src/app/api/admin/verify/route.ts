import { getAdminAuth, getAdminDb } from "@/lib/firebase/admin";
import { ADMIN_EMAILS } from "@/lib/firebase/admin-auth";
import { NextResponse, type NextRequest } from "next/server";
import { headers } from "next/headers";

export const dynamic = "force-dynamic";

const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX = 10; // max 10 requests per minute

/**
 * Persistent rate limiter backed by Firestore.
 * Works correctly across multiple serverless instances and restarts.
 * The `rateLimit` collection is admin-SDK-only (bypasses security rules).
 */
async function checkRateLimit(ip: string): Promise<boolean> {
  const db = getAdminDb();
  // Sanitise the IP so it's a valid Firestore document ID
  const docId = ip.replace(/[^a-zA-Z0-9_-]/g, "_");
  const ref = db.collection("rateLimit").doc(docId);
  const now = Date.now();

  return db.runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    const data = snap.data();

    if (!data || now > data.resetTime) {
      tx.set(ref, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
      return true;
    }

    if (data.count >= RATE_LIMIT_MAX) {
      return false;
    }

    tx.update(ref, { count: data.count + 1 });
    return true;
  });
}

export async function POST(request: NextRequest) {
  try {
    // Get client IP for rate limiting
    const headersList = await headers();
    const realIp = headersList.get("x-real-ip");
    const forwardedFor = headersList.get("x-forwarded-for");
    // Prefer x-real-ip (not spoofable on Vercel); fall back to last entry in
    // x-forwarded-for which Vercel appends and the client cannot control.
    const ip = realIp || forwardedFor?.split(",").at(-1)?.trim() || "unknown";

    // Check rate limit
    const allowed = await checkRateLimit(ip);
    if (!allowed) {
      return NextResponse.json(
        { error: "Too many requests", isAdmin: false },
        { status: 429 }
      );
    }

    const { token } = await request.json();

    if (!token || typeof token !== "string") {
      return NextResponse.json(
        { error: "No token provided", isAdmin: false },
        { status: 401 }
      );
    }

    // Verify the Firebase ID token server-side
    const adminAuth = getAdminAuth();
    const decoded = await adminAuth.verifyIdToken(token);

    // Check if the user's email is in the admin list
    const isAdmin = decoded.email ? ADMIN_EMAILS.includes(decoded.email) : false;

    if (!isAdmin) {
      return NextResponse.json(
        { error: "Not authorized", isAdmin: false },
        { status: 403 }
      );
    }

    return NextResponse.json({ isAdmin: true, email: decoded.email });
  } catch (err) {
    console.error("[admin/verify POST]", err);
    return NextResponse.json(
      { error: "Invalid token", isAdmin: false },
      { status: 401 }
    );
  }
}
