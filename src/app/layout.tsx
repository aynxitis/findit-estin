import type { Metadata } from "next";
import { Syne, DM_Sans } from "next/font/google";
import { AuthProvider } from "@/components/auth";
import "./globals.css";

const syne = Syne({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["700", "800"],
});

const dmSans = DM_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "FINDit — Campus Lost & Found",
  description:
    "FINDit — the campus lost and found platform for ESTIN Bejaia students. No more email spam.",
  openGraph: {
    title: "FINDit — Campus Lost & Found",
    description:
      "A smarter lost & found for our campus. Browse what's been found, post what you lost, or report what you found — no campus-wide emails.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${syne.variable} ${dmSans.variable}`}
      data-theme="dark"
    >
      <body className="min-h-screen flex flex-col antialiased">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
