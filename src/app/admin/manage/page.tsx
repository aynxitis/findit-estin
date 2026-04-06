import { AdminItems } from "@/components/admin/admin-items";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin · Manage",
  robots: "noindex, nofollow",
};

export default function AdminItemsPage() {
  return <AdminItems />;
}
