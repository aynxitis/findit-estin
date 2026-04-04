"use client";

import Image from "next/image";
import { useAuth } from "@/hooks/use-auth";
import { toTitleCase } from "@/lib/utils";

interface ProfileHeaderProps {
  stats: {
    found: number;
    lost: number;
    claimed: number;
  };
}

export function ProfileHeader({ stats }: ProfileHeaderProps) {
  const { user } = useAuth();

  if (!user) return null;

  // Parse name
  const nameParts = (user.displayName || "Student").trim().split(" ").filter(Boolean);
  const firstName = nameParts.length > 1 
    ? nameParts.slice(0, -1).map(toTitleCase).join(" ")
    : nameParts[0] || "Student";
  const lastName = nameParts.length > 1 
    ? nameParts[nameParts.length - 1].toUpperCase()
    : "";

  return (
    <>
      {/* Profile header */}
      <div className="flex items-center gap-6 mb-8 flex-wrap">
        {/* Avatar */}
        <div className="w-[72px] h-[72px] rounded-full border-2 border-white/10 bg-white/5 flex-shrink-0 overflow-hidden flex items-center justify-center">
          {user.photoURL ? (
            <Image
              src={user.photoURL}
              alt={user.displayName || "Profile"}
              width={72}
              height={72}
              className="w-full h-full object-cover"
            />
          ) : (
            <svg viewBox="0 0 72 72" className="w-[72px] h-[72px]">
              <circle cx="36" cy="36" r="36" fill="rgba(255,255,255,0.05)" />
              <circle cx="36" cy="27" r="10.5" fill="rgba(255,255,255,0.2)" />
              <path d="M12 60c0-12 10.8-21 24-21s24 9 24 21" fill="rgba(255,255,255,0.2)" />
            </svg>
          )}
        </div>

        {/* Info */}
        <div className="flex-1">
          <p className="font-display text-[0.68rem] font-bold tracking-[0.18em] uppercase text-teal mb-1">
            ESTIN · Student
          </p>
          <h1 className="font-display text-[clamp(1.5rem,4vw,2.2rem)] font-extrabold tracking-tight leading-tight mb-1">
            {firstName} <span className="text-yellow">{lastName}</span>
          </h1>
          <p className="text-sm text-[var(--muted)]">{user.email}</p>
        </div>
      </div>

      {/* Stats row */}
      <div className="flex gap-4 mb-8 flex-wrap">
        <div className="flex-1 min-w-[120px] bg-white/[0.03] border border-white/[0.07] rounded-xl p-5 flex flex-col gap-1">
          <div className="font-display text-[1.8rem] font-extrabold tracking-tight leading-none text-teal">
            {stats.found}
          </div>
          <div className="font-display text-[0.72rem] font-bold tracking-[0.08em] uppercase text-white/30">
            Found posts
          </div>
        </div>
        <div className="flex-1 min-w-[120px] bg-white/[0.03] border border-white/[0.07] rounded-xl p-5 flex flex-col gap-1">
          <div className="font-display text-[1.8rem] font-extrabold tracking-tight leading-none text-red">
            {stats.lost}
          </div>
          <div className="font-display text-[0.72rem] font-bold tracking-[0.08em] uppercase text-white/30">
            Lost reports
          </div>
        </div>
        <div className="flex-1 min-w-[120px] bg-white/[0.03] border border-white/[0.07] rounded-xl p-5 flex flex-col gap-1">
          <div className="font-display text-[1.8rem] font-extrabold tracking-tight leading-none text-yellow">
            {stats.claimed}
          </div>
          <div className="font-display text-[0.72rem] font-bold tracking-[0.08em] uppercase text-white/30">
            Items resolved
          </div>
        </div>
      </div>
    </>
  );
}
