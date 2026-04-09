/**
 * Centralized logger for Tech Hill.
 * - In production: only WARN and ERROR are emitted.
 * - In development: all levels are emitted with colour coding.
 * - All calls pass through here — no raw console.log in route handlers.
 */

const isProd = process.env.NODE_ENV === "production";

type LogLevel = "debug" | "info" | "warn" | "error";

const LEVEL_ORDER: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

const MIN_LEVEL: LogLevel = isProd ? "warn" : "debug";

function shouldLog(level: LogLevel) {
  return LEVEL_ORDER[level] >= LEVEL_ORDER[MIN_LEVEL];
}

function formatMessage(level: LogLevel, context: string, message: string) {
  const timestamp = new Date().toISOString();
  return `[${timestamp}] [${level.toUpperCase()}] [${context}] ${message}`;
}

export const logger = {
  debug(context: string, message: string, data?: unknown) {
    if (!shouldLog("debug")) return;
    console.debug(formatMessage("debug", context, message), data ?? "");
  },
  info(context: string, message: string, data?: unknown) {
    if (!shouldLog("info")) return;
    console.info(formatMessage("info", context, message), data ?? "");
  },
  warn(context: string, message: string, data?: unknown) {
    if (!shouldLog("warn")) return;
    console.warn(formatMessage("warn", context, message), data ?? "");
  },
  error(context: string, message: string, error?: unknown) {
    if (!shouldLog("error")) return;
    console.error(
      formatMessage("error", context, message),
      error instanceof Error ? error.message : error ?? ""
    );
  },
};
