import { getAdminDb } from "@/lib/firebase/admin";
import { verifyAdmin } from "@/lib/firebase/admin-auth";
import {
  VALID_TYPES,
  VALID_STATUSES,
  VALID_CATEGORIES,
  VALID_ZONES,
  VALID_WHERE_LEFT,
} from "@/lib/constants/labels";
import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";

export const dynamic = "force-dynamic";

// Partial schema: every field is optional, but if present it must be valid
const adminUpdateItemSchema = z.object({
  type: z.enum(VALID_TYPES as [string, ...string[]]).optional(),
  category: z.enum(VALID_CATEGORIES as [string, ...string[]]).optional(),
  location: z.string().min(1).max(100).optional(),
  zone: z.enum(VALID_ZONES as [string, ...string[]]).nullable().optional(),
  whereLeft: z.enum(VALID_WHERE_LEFT as [string, ...string[]]).nullable().optional(),
  description: z.string().max(500).nullable().optional(),
  photoURL: z.string().url().max(500).nullable().optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  status: z.enum(VALID_STATUSES as [string, ...string[]]).optional(),
  userUID: z.string().min(1).max(128).optional(),
  userName: z.string().max(100).nullable().optional(),
  userEmail: z.string().email().max(200).nullable().optional(),
}).strict();

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = request.headers.get("Authorization")?.replace("Bearer ", "");
    if (!token) {
      return NextResponse.json({ error: "No token provided" }, { status: 401 });
    }

    const decoded = await verifyAdmin(token);
    if (!decoded) {
      return NextResponse.json({ error: "Not authorized" }, { status: 403 });
    }

    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: "Missing item ID" }, { status: 400 });
    }

    const body = await request.json();
    const result = adminUpdateItemSchema.safeParse(body);
    if (!result.success) {
      const firstError = result.error.issues[0];
      return NextResponse.json(
        { error: `Invalid field "${firstError.path.join(".")}": ${firstError.message}` },
        { status: 400 }
      );
    }

    const sanitized = result.data;
    if (Object.keys(sanitized).length === 0) {
      return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
    }

    const db = getAdminDb();
    const docRef = db.collection("items").doc(id);
    const doc = await docRef.get();
    if (!doc.exists) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    await docRef.update(sanitized);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[admin/items PATCH]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = request.headers.get("Authorization")?.replace("Bearer ", "");
    if (!token) {
      return NextResponse.json({ error: "No token provided" }, { status: 401 });
    }

    const decoded = await verifyAdmin(token);
    if (!decoded) {
      return NextResponse.json({ error: "Not authorized" }, { status: 403 });
    }

    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: "Missing item ID" }, { status: 400 });
    }

    const db = getAdminDb();
    const docRef = db.collection("items").doc(id);
    const doc = await docRef.get();
    if (!doc.exists) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    await docRef.delete();

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[admin/items DELETE]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
