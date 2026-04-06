import { getAdminDb } from "@/lib/firebase/admin";
import { verifyAdmin } from "@/lib/firebase/admin-auth";
import {
  VALID_TYPES,
  VALID_STATUSES,
  VALID_CATEGORIES,
  VALID_LOCATIONS,
  VALID_ZONES,
  VALID_WHERE_LEFT,
} from "@/lib/constants/labels";
import { FieldValue } from "firebase-admin/firestore";
import { NextResponse, type NextRequest } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, ...itemData } = body;

    if (!token || typeof token !== "string") {
      return NextResponse.json({ error: "No token provided" }, { status: 401 });
    }

    const decoded = await verifyAdmin(token);
    if (!decoded) {
      return NextResponse.json({ error: "Not authorized" }, { status: 403 });
    }

    const { type, category, location, date, userUID, status } = itemData;

    // Presence check
    if (!type || !category || !location || !date || !userUID || !status) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Value validation
    if (!VALID_TYPES.includes(type)) {
      return NextResponse.json({ error: "Invalid type" }, { status: 400 });
    }
    if (!VALID_STATUSES.includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }
    if (!VALID_CATEGORIES.includes(category)) {
      return NextResponse.json({ error: "Invalid category" }, { status: 400 });
    }
    if (!VALID_LOCATIONS.includes(location)) {
      return NextResponse.json({ error: "Invalid location" }, { status: 400 });
    }
    if (itemData.zone && !VALID_ZONES.includes(itemData.zone)) {
      return NextResponse.json({ error: "Invalid zone" }, { status: 400 });
    }
    if (itemData.whereLeft && !VALID_WHERE_LEFT.includes(itemData.whereLeft)) {
      return NextResponse.json({ error: "Invalid whereLeft value" }, { status: 400 });
    }

    const db = getAdminDb();
    const docRef = await db.collection("items").add({
      type,
      category,
      location,
      zone: itemData.zone ?? null,
      whereLeft: type === "found" ? (itemData.whereLeft ?? null) : null,
      description: itemData.description ?? null,
      photoURL: itemData.photoURL ?? null,
      date,
      status,
      userUID,
      userName: itemData.userName ?? null,
      userEmail: itemData.userEmail ?? null,
      createdAt: FieldValue.serverTimestamp(),
    });

    return NextResponse.json({ id: docRef.id }, { status: 201 });
  } catch (err) {
    console.error("[admin/items POST]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
