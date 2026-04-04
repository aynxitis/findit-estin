import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Report Lost Item | FINDit",
  description: "Report an item you lost on the ESTIN campus.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
