"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Admin route error:", error);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <h1 className="font-display text-2xl font-bold mb-3">
          Admin Error
        </h1>
        <p className="text-[var(--muted)] mb-6 text-sm leading-relaxed">
          Something went wrong in the admin dashboard. Please try again or contact support.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={reset}
            className="px-6 py-3 rounded-xl bg-yellow text-black font-semibold hover:-translate-y-0.5 hover:brightness-110 transition-all cursor-pointer"
          >
            Try again
          </button>
          <Link
            href="/browse"
            className="px-6 py-3 rounded-xl bg-[var(--surface)] border border-[var(--border)] font-semibold hover:-translate-y-0.5 hover:bg-yellow/20 hover:border-yellow transition-all"
          >
            Back to browse
          </Link>
        </div>
        {process.env.NODE_ENV === "development" && error.message && (
          <details className="mt-8 text-left">
            <summary className="text-xs text-[var(--muted)] cursor-pointer">
              <span className="hover:text-yellow hover:bg-yellow/10 px-1 rounded transition-all">Error details (dev only)</span>
            </summary>
            <pre className="mt-2 p-4 bg-[var(--surface)] rounded-lg text-xs overflow-auto text-red max-h-48">
              {error.message}
              {error.stack && `\n\n${error.stack}`}
            </pre>
          </details>
        )}
      </div>
    </div>
  );
}
