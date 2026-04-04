"use client";

import { AuthGate } from "@/components/auth";
import { Nav, Footer, BackgroundBlobs } from "@/components/layout";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Nav />
      <main className="relative z-5 flex-1">
        <AuthGate>{children}</AuthGate>
      </main>
      <Footer />
      <BackgroundBlobs />
    </>
  );
}
