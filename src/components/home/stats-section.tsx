"use client";

import { useEffect, useState } from "react";

interface Stats {
  posted: number;
  reunions: number;
}

export function StatsSection() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    fetch("/api/stats", { signal: controller.signal })
      .then((res) => res.json())
      .then((data) => {
        if (data.posted !== undefined) {
          setStats(data);
        }
      })
      .catch(() => {
        // Keep stats as null on error or timeout
      })
      .finally(() => clearTimeout(timeout));

    return () => {
      controller.abort();
      clearTimeout(timeout);
    };
  }, []);

  return (
    <div className="relative z-5 flex gap-8 justify-center flex-wrap px-6 pt-14 animate-fade-up [animation-delay:550ms]">
      <Stat value={stats?.posted} label="Items posted so far" />
      <Stat value={stats?.reunions} label="Successful reunions" />
      <Stat value="∞" label="Emails saved" />
    </div>
  );
}

function Stat({ value, label }: { value?: number | string; label: string }) {
  // Derive initial display value synchronously to avoid cascading setState
  const initialValue = typeof value === "string" ? value : "—";
  const [displayValue, setDisplayValue] = useState<string>(initialValue);

  useEffect(() => {
    // Handle string values (like "∞")
    if (typeof value === "string") {
      // Only update if changed to avoid unnecessary re-renders
      setDisplayValue((prev) => (prev !== value ? value : prev));
      return;
    }
    if (typeof value !== "number") return;

    // Count-up animation for numeric values
    const duration = 1200;
    const start = performance.now();
    const target = value;

    function update(now: number) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out-cubic
      setDisplayValue(String(Math.round(eased * target)));
      if (progress < 1) {
        requestAnimationFrame(update);
      }
    }

    requestAnimationFrame(update);
  }, [value]);

  return (
    <div className="text-center">
      <div className="font-display text-4xl font-extrabold text-yellow">
        {displayValue}
      </div>
      <div className="text-sm text-muted mt-1">{label}</div>
    </div>
  );
}
