import { getAdminDb } from "@/lib/firebase/admin";
import { verifyAdmin } from "@/lib/firebase/admin-auth";
import { NextResponse, type NextRequest } from "next/server";

export const dynamic = "force-dynamic";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { token, banned } = body;

    if (!token || typeof token !== "string") {
      return NextResponse.json({ error: "No token provided" }, { status: 401 });
    }

    const decoded = await verifyAdmin(token);
    if (!decoded) {
      return NextResponse.json({ error: "Not authorized" }, { status: 403 });
    }

    if (!id) {
      return NextResponse.json({ error: "Missing user ID" }, { status: 400 });
    }

    if (typeof banned !== "boolean") {
      return NextResponse.json({ error: "banned must be a boolean" }, { status: 400 });
    }

    const db = getAdminDb();
    await db.collection("users").doc(id).update({ banned });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[admin/users PATCH]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
