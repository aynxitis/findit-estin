import { collection, query, where, getDocs, Timestamp } from "firebase/firestore";
import { getClientDb } from "@/lib/firebase/client";

const MAX_POSTS_PER_HOUR = 3;
const MAX_POSTS_PER_DAY = 10;
const ONE_HOUR_MS = 60 * 60 * 1000;
const ONE_DAY_MS = 24 * 60 * 60 * 1000;

interface RateLimitResult {
  allowed: boolean;
  hourlyRemaining: number;
  dailyRemaining: number;
  resetIn: string | null; // human-readable reset time
}

/**
 * Check if user can create a new post based on rate limiting
 * Limits: 3 posts per hour, 10 posts per day
 */
export async function checkPostRateLimit(userId: string): Promise<RateLimitResult> {
  const db = getClientDb();
  const now = Date.now();
  const oneHourAgo = Timestamp.fromMillis(now - ONE_HOUR_MS);
  const oneDayAgo = Timestamp.fromMillis(now - ONE_DAY_MS);

  const itemsRef = collection(db, "items");
  
  // Query posts from last 24 hours (covers both checks)
  const recentPostsQuery = query(
    itemsRef,
    where("userUID", "==", userId),
    where("createdAt", ">=", oneDayAgo)
  );

  const snapshot = await getDocs(recentPostsQuery);
  
  let hourlyCount = 0;
  let dailyCount = 0;
  let oldestHourlyTimestamp = now;
  let oldestDailyTimestamp = now;

  snapshot.forEach((doc) => {
    const createdAt = doc.data().createdAt?.toMillis?.() || now;
    dailyCount++;
    
    if (createdAt < oldestDailyTimestamp) {
      oldestDailyTimestamp = createdAt;
    }
    
    if (createdAt >= oneHourAgo.toMillis()) {
      hourlyCount++;
      if (createdAt < oldestHourlyTimestamp) {
        oldestHourlyTimestamp = createdAt;
      }
    }
  });

  // Check daily limit first (stricter)
  if (dailyCount >= MAX_POSTS_PER_DAY) {
    const resetTime = oldestDailyTimestamp + ONE_DAY_MS;
    const resetInMs = resetTime - now;
    const hours = Math.floor(resetInMs / (60 * 60 * 1000));
    const minutes = Math.ceil((resetInMs % (60 * 60 * 1000)) / (60 * 1000));
    
    return {
      allowed: false,
      hourlyRemaining: Math.max(0, MAX_POSTS_PER_HOUR - hourlyCount),
      dailyRemaining: 0,
      resetIn: hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`,
    };
  }

  // Check hourly limit
  if (hourlyCount >= MAX_POSTS_PER_HOUR) {
    const resetTime = oldestHourlyTimestamp + ONE_HOUR_MS;
    const resetInMinutes = Math.ceil((resetTime - now) / (60 * 1000));

    return {
      allowed: false,
      hourlyRemaining: 0,
      dailyRemaining: MAX_POSTS_PER_DAY - dailyCount,
      resetIn: `${Math.max(1, resetInMinutes)}m`,
    };
  }

  return {
    allowed: true,
    hourlyRemaining: MAX_POSTS_PER_HOUR - hourlyCount,
    dailyRemaining: MAX_POSTS_PER_DAY - dailyCount,
    resetIn: null,
  };
}
