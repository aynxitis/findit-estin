import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Report a Found Item",
  description:
    "Found something on the ESTIN campus? Post it on FINDit so the owner can spot it and reach out.",
  openGraph: {
    title: "Report a Found Item — FINDit",
    description:
      "Found something on the ESTIN campus? Post it on FINDit so the owner can spot it and reach out.",
    url: "https://findit-estin.vercel.app/report/found",
  },
  alternates: {
    canonical: "https://findit-estin.vercel.app/report/found",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
