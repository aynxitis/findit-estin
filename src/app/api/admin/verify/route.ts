import { getAdminAuth } from "@/lib/firebase/admin";
import { NextResponse, type NextRequest } from "next/server";
import { headers } from "next/headers";

export const dynamic = "force-dynamic";

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || "").split(",").filter(Boolean);

// Simple in-memory rate limiter (resets on server restart)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX = 10; // max 10 requests per minute

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(ip);
  
  if (!record || now > record.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return true;
  }
  
  if (record.count >= RATE_LIMIT_MAX) {
    return false;
  }
  
  record.count++;
  return true;
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
    if (!checkRateLimit(ip)) {
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
  } catch {
    return NextResponse.json(
      { error: "Invalid token", isAdmin: false },
      { status: 401 }
    );
  }
}
