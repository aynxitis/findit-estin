import { adminDb } from "@/lib/firebase/admin";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  // Check if Firebase Admin is configured
  if (!process.env.FIREBASE_ADMIN_PROJECT_ID || 
      !process.env.FIREBASE_ADMIN_CLIENT_EMAIL || 
      !process.env.FIREBASE_ADMIN_PRIVATE_KEY) {
    return NextResponse.json({
      posted: 0,
      reunions: 0,
      error: "Firebase Admin not configured",
    });
  }

  try {
    const itemsRef = adminDb.collection("items");
    
    const [totalSnap, claimedSnap] = await Promise.all([
      itemsRef.count().get(),
      itemsRef.where("status", "==", "claimed").count().get(),
    ]);

    const response = NextResponse.json({
      posted: totalSnap.data().count,
      reunions: claimedSnap.data().count,
    });

    // Cache for 60 seconds on CDN, allow stale-while-revalidate for 5 minutes
    response.headers.set(
      "Cache-Control",
      "public, s-maxage=60, stale-while-revalidate=300"
    );

    return response;
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch stats", posted: 0, reunions: 0 },
      { status: 500 }
    );
  }
}
