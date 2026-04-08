import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Browse Items",
  description:
    "Browse all lost and found items on the ESTIN campus. Filter by category, location, and item type.",
  openGraph: {
    title: "Browse Lost & Found Items — FINDit",
    description:
      "Browse all lost and found items on the ESTIN campus. Filter by category, location, and item type.",
    url: "https://findit-estin.vercel.app/browse",
  },
  alternates: {
    canonical: "https://findit-estin.vercel.app/browse",
  },
};

export default function BrowseLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
