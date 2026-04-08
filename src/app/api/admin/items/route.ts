import { getAdminDb } from "@/lib/firebase/admin";
import { verifyAdmin } from "@/lib/firebase/admin-auth";
import {
  VALID_TYPES,
  VALID_STATUSES,
  VALID_CATEGORIES,
  VALID_ZONES,
  VALID_WHERE_LEFT,
} from "@/lib/constants/labels";
import { FieldValue } from "firebase-admin/firestore";
import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";

export const dynamic = "force-dynamic";

const adminCreateItemSchema = z.object({
  type: z.enum(VALID_TYPES as [string, ...string[]]),
  category: z.enum(VALID_CATEGORIES as [string, ...string[]]),
  location: z.string().min(1).max(100),
  zone: z.enum(VALID_ZONES as [string, ...string[]]).nullable().optional(),
  whereLeft: z.enum(VALID_WHERE_LEFT as [string, ...string[]]).nullable().optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  status: z.enum(VALID_STATUSES as [string, ...string[]]),
  userUID: z.string().min(1).max(128),
  userName: z.string().max(100).nullable().optional(),
  userEmail: z.string().email().max(200).nullable().optional(),
  description: z.string().max(400).nullable().optional(),
  photoURL: z.string().url().max(500).nullable().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get("Authorization")?.replace("Bearer ", "");
    if (!token) {
      return NextResponse.json({ error: "No token provided" }, { status: 401 });
    }

    const decoded = await verifyAdmin(token);
    if (!decoded) {
      return NextResponse.json({ error: "Not authorized" }, { status: 403 });
    }

    const body = await request.json();
    const result = adminCreateItemSchema.safeParse(body);
    if (!result.success) {
      const firstError = result.error.issues[0];
      return NextResponse.json(
        { error: `Invalid field "${firstError.path.join(".")}": ${firstError.message}` },
        { status: 400 }
      );
    }

    const data = result.data;
    const db = getAdminDb();
    const docRef = await db.collection("items").add({
      type: data.type,
      category: data.category,
      location: data.location,
      zone: data.zone ?? null,
      whereLeft: data.type === "found" ? (data.whereLeft ?? null) : null,
      description: data.description ?? null,
      photoURL: data.photoURL ?? null,
      date: data.date,
      status: data.status,
      userUID: data.userUID,
      userName: data.userName ?? null,
      userEmail: data.userEmail ?? null,
      createdAt: FieldValue.serverTimestamp(),
    });

    return NextResponse.json({ id: docRef.id }, { status: 201 });
  } catch (err) {
    console.error("[admin/items POST]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
