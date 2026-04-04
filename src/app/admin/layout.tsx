import Link from "next/link";
import { BackgroundBlobs, Footer } from "@/components/layout";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <BackgroundBlobs />
      
      {/* Simple admin nav */}
      <nav className="relative z-10 flex items-center justify-between px-4 py-3 md:px-6 border-b border-[var(--border)] bg-red/10">
        <div className="font-display font-bold text-red">
          FINDit Admin
        </div>
        <Link href="/" className="text-sm text-[var(--muted)] hover:text-[var(--foreground)]">
          ← Back to site
        </Link>
      </nav>
      
      <main className="flex-1 relative z-10">
        {children}
      </main>
      
      <Footer />
    </div>
  );
}
