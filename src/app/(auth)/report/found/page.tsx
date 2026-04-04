"use client";

import Link from "next/link";
import { ReportForm } from "@/components/report";

export default function ReportFoundPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      {/* Header */}
      <div className="mb-8 animate-fade-up">
        <Link
          href="/browse"
          className="text-sm text-[var(--muted)] hover:text-yellow mb-4 inline-flex items-center gap-1 transition-colors"
        >
          ← Back to browse
        </Link>
        <h1 className="font-display text-3xl md:text-4xl font-bold mt-4">
          Report a <span className="text-teal">Found</span> Item
        </h1>
        <p className="text-[var(--muted)] mt-3">
          Found something on campus? Post it here so the owner can find it.
        </p>
      </div>

      {/* Form */}
      <ReportForm type="found" />
    </div>
  );
}
