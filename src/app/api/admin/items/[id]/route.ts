import { getAdminDb } from "@/lib/firebase/admin";
import { verifyAdmin } from "@/lib/firebase/admin-auth";
import { NextResponse, type NextRequest } from "next/server";

export const dynamic = "force-dynamic";

const ALLOWED_FIELDS = [
  "type",
  "category",
  "location",
  "zone",
  "whereLeft",
  "description",
  "photoURL",
  "date",
  "status",
  "userUID",
  "userName",
  "userEmail",
];

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { token, ...updates } = body;

    if (!token || typeof token !== "string") {
      return NextResponse.json({ error: "No token provided" }, { status: 401 });
    }

    const decoded = await verifyAdmin(token);
    if (!decoded) {
      return NextResponse.json({ error: "Not authorized" }, { status: 403 });
    }

    if (!id) {
      return NextResponse.json({ error: "Missing item ID" }, { status: 400 });
    }

    const sanitized: Record<string, unknown> = {};
    for (const key of ALLOWED_FIELDS) {
      if (key in updates) {
        sanitized[key] = updates[key] ?? null;
      }
    }

    if (Object.keys(sanitized).length === 0) {
      return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
    }

    const db = getAdminDb();
    await db.collection("items").doc(id).update(sanitized);

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
    const { id } = await params;
    const body = await request.json();
    const { token } = body;

    if (!token || typeof token !== "string") {
      return NextResponse.json({ error: "No token provided" }, { status: 401 });
    }

    const decoded = await verifyAdmin(token);
    if (!decoded) {
      return NextResponse.json({ error: "Not authorized" }, { status: 403 });
    }

    if (!id) {
      return NextResponse.json({ error: "Missing item ID" }, { status: 400 });
    }

    const db = getAdminDb();
    await db.collection("items").doc(id).delete();

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[admin/items DELETE]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
