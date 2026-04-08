import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Profile",
  description: "Manage your lost and found posts on FINDit.",
  openGraph: {
    title: "My Profile — FINDit",
    description: "Manage your lost and found posts on FINDit.",
    url: "https://findit-estin.vercel.app/profile",
  },
  alternates: {
    canonical: "https://findit-estin.vercel.app/profile",
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
