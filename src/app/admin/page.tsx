import { AdminDashboard } from "@/components/admin/admin-dashboard";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin · Dashboard",
  robots: "noindex, nofollow",
};

export default function AdminPage() {
  return <AdminDashboard />;
}
