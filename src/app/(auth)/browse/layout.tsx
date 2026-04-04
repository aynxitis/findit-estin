import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Browse Items · FINDit",
  description: "Browse lost and found items on the ESTIN campus.",
};

export default function BrowseLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
