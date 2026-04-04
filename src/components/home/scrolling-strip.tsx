"use client";

const STRIP_ITEMS = [
  { label: "Stop the email spam. Find your stuff.", icon: "✦" },
  { label: "FINDit", icon: "✦" },
  { label: "2026", icon: "✦" },
  { label: "ESTIN", icon: "✦" },
  { label: "Built by Anis BELAMRI", icon: "✦" },
];

export function ScrollingStrip() {
  // Double the items for seamless loop
  const items = [...STRIP_ITEMS, ...STRIP_ITEMS];

  return (
    <div className="strip-wrapper mt-16">
      <div className="strip-track">
        {items.map((item, i) => (
          <span key={i} className="strip-item">
            <span className="strip-dot" />
            {item.label}
            <span className="strip-icon">{item.icon}</span>
          </span>
        ))}
      </div>
    </div>
  );
}
