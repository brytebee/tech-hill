"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  Bell,
  Check,
  Info,
  ShieldAlert,
  Award,
  CreditCard,
  Tag,
  Sparkles,
  BookOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import { toast } from "sonner";

export interface Notification {
  id: string;
  type:
    | "SYSTEM"
    | "COURSE_UPDATE"
    | "ENROLLMENT"
    | "ASSESSMENT"
    | "BILLING"
    | "PROMOTIONAL";
  title: string;
  message: string;
  isRead: boolean;
  linkUrl?: string;
  createdAt: string;
}

const ICON_MAP: Record<string, React.ReactNode> = {
  SYSTEM: <ShieldAlert className="h-4 w-4 text-rose-500" />,
  COURSE_UPDATE: <Sparkles className="h-4 w-4 text-blue-500" />,
  ENROLLMENT: <BookOpen className="h-4 w-4 text-indigo-500" />,
  ASSESSMENT: <Award className="h-4 w-4 text-emerald-500" />,
  BILLING: <CreditCard className="h-4 w-4 text-amber-500" />,
  PROMOTIONAL: <Tag className="h-4 w-4 text-purple-500" />,
};

export function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const sseRef = useRef<EventSource | null>(null);

  // --- Initial fetch (for the dropdown list) ---
  const fetchNotificationList = useCallback(async () => {
    try {
      const res = await fetch("/api/notifications?limit=20");
      if (!res.ok) return;
      const data = await res.json();
      setNotifications(data.notifications ?? []);
      setUnreadCount(data.unreadCount ?? 0);
    } catch {
      // Swallowed — SSE will surface count changes anyway
    } finally {
      setIsLoading(false);
    }
  }, []);

  // --- SSE connection ---
  useEffect(() => {
    fetchNotificationList();

    const connect = () => {
      const es = new EventSource("/api/notifications/stream");
      sseRef.current = es;

      es.addEventListener("connected", (e) => {
        const data = JSON.parse(e.data);
        setUnreadCount(data.unreadCount ?? 0);
      });

      es.addEventListener("notifications", (e) => {
        const data = JSON.parse(e.data);
        const incoming: Notification[] = data.notifications ?? [];
        setUnreadCount(data.unreadCount ?? 0);

        // Prepend new, deduplicate
        setNotifications((prev) => {
          const existingIds = new Set(prev.map((n) => n.id));
          const fresh = incoming.filter((n) => !existingIds.has(n.id));
          return [...fresh, ...prev].slice(0, 50); // cap at 50
        });

        // Toast the most recent one
        if (incoming.length > 0) {
          const latest = incoming[incoming.length - 1];
          toast(latest.title, { description: latest.message });
        }
      });

      es.onerror = () => {
        es.close();
        // Reconnect after 5 s if not intentionally closed
        if (sseRef.current === es) {
          setTimeout(connect, 5000);
        }
      };
    };

    connect();

    return () => {
      sseRef.current?.close();
      sseRef.current = null;
    };
  }, [fetchNotificationList]);

  // Re-fetch the full list when the dropdown opens
  useEffect(() => {
    if (isOpen) fetchNotificationList();
  }, [isOpen, fetchNotificationList]);

  // --- Actions ---
  const markAsRead = async (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    e?.preventDefault();

    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
    setUnreadCount((c) => Math.max(0, c - 1));

    try {
      const res = await fetch(`/api/notifications/${id}`, { method: "PATCH" });
      if (!res.ok) throw new Error("Failed");
    } catch {
      fetchNotificationList(); // revert
    }
  };

  const markAllAsRead = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnreadCount(0);

    try {
      const res = await fetch("/api/notifications", { method: "PUT" });
      if (!res.ok) throw new Error("Failed");
      toast.success("All alerts cleared.");
    } catch {
      fetchNotificationList();
    }
  };

  // --- Render ---
  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          id="notification-bell-trigger"
          variant="ghost"
          size="icon"
          aria-label={`Notifications${unreadCount > 0 ? ` — ${unreadCount} unread` : ""}`}
          className="relative rounded-full h-10 w-10 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
        >
          <Bell className="h-5 w-5 text-slate-600 dark:text-slate-300" />
          {unreadCount > 0 && (
            <span className="absolute top-0 right-0 flex h-4 w-4 shrink-0 -translate-y-1/4 translate-x-1/4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-black text-white ring-2 ring-white dark:ring-slate-950 shadow-sm animate-in zoom-in duration-200">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="w-[380px] p-0 border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl shadow-2xl rounded-2xl overflow-hidden animate-in slide-in-from-top-2 duration-200"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-950/30">
          <div className="flex items-center gap-2">
            <span className="font-black text-slate-900 dark:text-white uppercase tracking-widest text-sm">
              Alerts
            </span>
            {unreadCount > 0 && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 animate-pulse">
                {unreadCount} New
              </span>
            )}
          </div>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={markAllAsRead}
              className="h-8 px-2 text-xs font-bold text-slate-500 hover:text-blue-600 dark:hover:text-blue-400"
            >
              <Check className="h-3.5 w-3.5 mr-1" /> Mark all read
            </Button>
          )}
        </div>

        {/* List */}
        <div className="max-h-[420px] overflow-y-auto">
          {isLoading ? (
            <div className="py-8 text-center space-y-3">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto" />
              <p className="text-xs text-slate-500 font-medium">
                Syncing telemetry...
              </p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="py-12 text-center px-4">
              <div className="h-12 w-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-3">
                <Bell className="h-6 w-6 text-slate-300 dark:text-slate-600" />
              </div>
              <p className="font-bold text-slate-900 dark:text-white text-sm">
                System Quiet
              </p>
              <p className="text-xs text-slate-500 mt-1 max-w-[200px] mx-auto">
                No active alerts in your operational matrix.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {notifications.map((n) => (
                <div
                  key={n.id}
                  role="button"
                  tabIndex={0}
                  className={`group px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer ${
                    n.isRead
                      ? "opacity-60"
                      : "bg-blue-50/40 dark:bg-blue-500/5"
                  }`}
                  onClick={() => {
                    if (!n.isRead) markAsRead(n.id);
                    if (n.linkUrl) window.location.href = n.linkUrl;
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      if (!n.isRead) markAsRead(n.id);
                      if (n.linkUrl) window.location.href = n.linkUrl;
                    }
                  }}
                >
                  <div className="flex gap-3 items-start">
                    <div className="mt-0.5 shrink-0 p-2 rounded-full bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shadow-sm">
                      {ICON_MAP[n.type] ?? (
                        <Info className="h-4 w-4 text-slate-400" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start gap-2 mb-0.5">
                        <p
                          className={`text-sm font-bold truncate ${
                            n.isRead
                              ? "text-slate-600 dark:text-slate-400"
                              : "text-slate-900 dark:text-white"
                          }`}
                        >
                          {n.title}
                        </p>
                        <span className="text-[10px] font-semibold text-slate-400 whitespace-nowrap pt-1 flex-shrink-0">
                          {formatDistanceToNow(new Date(n.createdAt), {
                            addSuffix: true,
                          })}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                        {n.message}
                      </p>
                    </div>
                    {!n.isRead && (
                      <span className="shrink-0 self-center block h-2 w-2 rounded-full bg-blue-500 ring-2 ring-blue-200 dark:ring-blue-900" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {notifications.length > 0 && (
          <div className="p-2 border-t border-slate-100 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-950/30">
            <Link href="/settings">
              <Button
                variant="ghost"
                className="w-full h-8 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white"
              >
                Notification preferences
              </Button>
            </Link>
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
