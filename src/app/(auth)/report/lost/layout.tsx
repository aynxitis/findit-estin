import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Report a Lost Item",
  description:
    "Lost something on the ESTIN campus? Post it on FINDit so someone who found it can reach out.",
  openGraph: {
    title: "Report a Lost Item — FINDit",
    description:
      "Lost something on the ESTIN campus? Post it on FINDit so someone who found it can reach out.",
    url: "https://findit-estin.vercel.app/report/lost",
  },
  alternates: {
    canonical: "https://findit-estin.vercel.app/report/lost",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
