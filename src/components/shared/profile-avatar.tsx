"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";

// ─── Module-level in-memory cache ────────────────────────────────────────────
// Scoped to the user's id so switching accounts always fetches fresh.
// Keyed by userId → { url, fetchedAt }
const avatarCache = new Map<string, { url: string | null; fetchedAt: number }>();
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

/** Call this after successfully saving a new avatar to bust the cache. */
export function clearAvatarCache(userId?: string) {
  if (userId) {
    avatarCache.delete(userId);
  } else {
    avatarCache.clear();
  }
}

async function fetchAvatarUrl(userId: string): Promise<string | null> {
  const cached = avatarCache.get(userId);
  if (cached && Date.now() - cached.fetchedAt < CACHE_TTL_MS) {
    return cached.url;
  }
  try {
    const res = await fetch("/api/user/profile");
    if (!res.ok) return null;
    const data = await res.json();
    const url = data?.user?.profileImage ?? null;
    avatarCache.set(userId, { url, fetchedAt: Date.now() });
    return url;
  } catch {
    return null;
  }
}

// ─── Component ────────────────────────────────────────────────────────────────
interface ProfileAvatarProps {
  /** Fallback element rendered when there is no avatar (e.g. a Lucide icon) */
  fallback: React.ReactNode;
  /** Extra CSS applied to the <img> tag */
  imgClassName?: string;
}

/**
 * Renders the current user's avatar.
 * - Fetches from /api/user/profile once per 5 minutes (module-level cache).
 * - Falls back to `props.fallback` when no image is available.
 * - Completely decoupled from the NextAuth JWT/session pipeline.
 */
export function ProfileAvatar({ fallback, imgClassName = "w-full h-full object-cover" }: ProfileAvatarProps) {
  const { data: session } = useSession();
  const userId = session?.user?.id;
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    fetchAvatarUrl(userId).then((url) => {
      if (!cancelled) setAvatarUrl(url);
    });
    return () => { cancelled = true; };
  }, [userId]);

  if (avatarUrl) {
    return <img src={avatarUrl} alt="Avatar" className={imgClassName} />;
  }
  return <>{fallback}</>;
}
