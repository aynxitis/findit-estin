"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_LINKS = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/manage", label: "Manage" },
];

export function AdminNavLinks() {
  const pathname = usePathname();

  return (
    <div className="flex items-center gap-1">
      {NAV_LINKS.map(({ href, label }) => {
        const active =
          href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={`font-display px-3 py-1.5 rounded-lg text-sm font-semibold transition-all ${
              active
                ? "bg-red text-white"
                : "text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-red/10"
            }`}
          >
            {label}
          </Link>
        );
      })}
    </div>
  );
}
