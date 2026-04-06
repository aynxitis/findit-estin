import Link from "next/link";
import Image from "next/image";
import { BackgroundBlobs, Footer } from "@/components/layout";
import { AdminNavLinks } from "@/components/admin/admin-nav-links";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <BackgroundBlobs />

      <nav className="relative z-10 grid grid-cols-3 items-center px-4 py-3 md:px-6 border-b border-[var(--border)] bg-red/10">
        {/* Left: logo + admin */}
        <div className="flex items-baseline gap-1.5 w-fit">
          <Link href="/">
            <Image
              src="/findit.svg"
              alt="FINDit"
              width={80}
              height={24}
              className="h-5 w-auto"
              priority
            />
          </Link>
          <span className="font-display text-[10px] font-bold text-red uppercase tracking-widest leading-none">
            admin
          </span>
        </div>

        {/* Center: nav links */}
        <div className="flex justify-center">
          <AdminNavLinks />
        </div>

        {/* Right: back to site */}
        <div className="flex justify-end">
          <Link
            href="/"
            className="font-display text-sm font-semibold text-[var(--muted)] transition-colors hover:text-yellow"
          >
            ← Back to site
          </Link>
        </div>
      </nav>

      <main className="flex-1 relative z-10">
        {children}
      </main>

      <Footer />
    </div>
  );
}
