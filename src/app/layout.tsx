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
  metadataBase: new URL("https://findit-estin.vercel.app"),

  title: {
    default: "FINDit — Lost & Found for ESTIN Students",
    template: "%s · FINDit",
  },
  description:
    "FINDit is the campus lost & found platform for ESTIN Bejaia students. Browse found items, report what you lost, or post what you found — no campus-wide email spam.",
  keywords: [
    "lost and found",
    "ESTIN",
    "lost item",
    "found item",
    "findit",
    "student platform",
    "ESTIN Bejaia",
    "campus lost found",
  ],
  authors: [{ name: "Mohamed Anis BELAMRI" }],
  creator: "Mohamed Anis BELAMRI",

  openGraph: {
    title: "FINDit — Lost & Found for ESTIN Students",
    description:
      "A smarter lost & found for our campus. Browse what's been found, post what you lost, or report what you found — no campus-wide emails.",
    url: "https://findit-estin.vercel.app",
    siteName: "FINDit",
    type: "website",
    locale: "en_US",
    images: [
      {
        url: "/opengraph-image.png",
        width: 1200,
        height: 630,
        alt: "FINDit — Lost & Found for ESTIN Students",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "FINDit — Lost & Found for ESTIN Students",
    description:
      "A smarter lost & found for our campus. Browse what's been found, post what you lost, or report what you found — no campus-wide emails.",
    images: ["/opengraph-image.png"],
  },

  alternates: {
    canonical: "https://findit-estin.vercel.app",
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "FINDit",
  url: "https://findit-estin.vercel.app",
  description: "Campus lost & found platform for ESTIN Bejaia students.",
  applicationCategory: "UtilitiesApplication",
  operatingSystem: "Web",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
  author: {
    "@type": "Person",
    name: "Mohamed Anis BELAMRI",
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
        {/* JSON-LD: jsonLd is a hardcoded static object — never include user-supplied data here */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
