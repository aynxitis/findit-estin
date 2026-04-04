import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Report Found Item | FINDit",
  description: "Report an item you found on the ESTIN campus.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
