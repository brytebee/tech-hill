#!/usr/bin/env node
/**
 * Replaces all raw console.error / console.log / console.warn calls in
 * Next.js API route files with the structured logger.
 *
 * Usage: node scripts/migrate-logger.mjs
 */
import { readFileSync, writeFileSync } from "fs";
import { globSync } from "fs";
import path from "path";

// ── targets ──────────────────────────────────────────────────────────────────
const files = [
  "src/app/api/auth/verify/route.ts",
  "src/app/api/auth/passkeys/register/options/route.ts",
  "src/app/api/auth/passkeys/register/verify/route.ts",
  "src/app/api/auth/passkeys/[passkeyId]/route.ts",
  "src/app/api/auth/passkeys/list/route.ts",
  "src/app/api/auth/passkeys/login/options/route.ts",
  "src/app/api/auth/register/route.ts",
  "src/app/api/payment/callback/route.ts",
  "src/app/api/student/quiz/[quizId]/route.ts",
  "src/app/api/student/courses/[courseId]/next-topic/route.ts",
  "src/app/api/student/courses/[courseId]/progress/route.ts",
  "src/app/api/student/topics/[topicId]/progress/route.ts",
  "src/app/api/student/topics/[topicId]/mark-complete/route.ts",
  "src/app/api/checkout/initialize/route.ts",
  "src/app/api/subscriptions/initialize/route.ts",
  "src/app/api/dashboard/stats/route.ts",
  "src/app/api/coupons/validate/route.ts",
  "src/app/api/courses/[courseId]/archive/route.ts",
  "src/app/api/courses/[courseId]/publish/route.ts",
  "src/app/api/courses/[courseId]/route.ts",
  "src/app/api/courses/[courseId]/modules/route.ts",
  "src/app/api/courses/[courseId]/topics/route.ts",
  "src/app/api/courses/route.ts",
  "src/app/api/public/pricing/route.ts",
  "src/app/api/users/route.ts",
  "src/app/api/users/[userId]/route.ts",
  "src/app/api/modules/[moduleId]/route.ts",
  "src/app/api/modules/[moduleId]/topics/route.ts",
  "src/app/api/webhooks/paystack/route.ts",
  "src/app/api/quizzes/[quizId]/route.ts",
  "src/app/api/quizzes/[quizId]/questions/bulk/route.ts",
  "src/app/api/quizzes/[quizId]/questions/route.ts",
  "src/app/api/notifications/route.ts",
  "src/app/api/notifications/[id]/route.ts",
  "src/app/api/topics/[topicId]/route.ts",
  "src/app/api/topics/[topicId]/quizzes/route.ts",
];

const LOGGER_IMPORT = `import { logger } from "@/lib/logger";`;

// Derive a short context tag from the file path, e.g. "auth/register"
function contextTag(filePath) {
  const parts = filePath.replace("src/app/api/", "").split("/");
  // strip route.ts, collapse dynamic segments to just the param name
  return parts
    .filter((p) => p !== "route.ts")
    .map((p) => p.replace(/\[([^\]]+)\]/, "$1"))
    .join(":");
}

// Replace console.error("some msg", err) → logger.error("ctx", "some msg", err)
// Replace console.log("msg", data) → logger.info("ctx", "msg", data)
// Replace console.warn("msg", data) → logger.warn("ctx", "msg", data)
function replaceConsoleCalls(src, ctx) {
  return src
    .replace(
      /console\.error\(\s*(`[^`]*`|"[^"]*"|'[^']*')\s*,\s*/g,
      `logger.error("${ctx}", $1, `
    )
    .replace(
      /console\.error\(\s*(`[^`]*`|"[^"]*"|'[^']*')\s*\)/g,
      `logger.error("${ctx}", $1)`
    )
    .replace(
      /console\.log\(\s*(`[^`]*`|"[^"]*"|'[^']*')\s*,\s*/g,
      `logger.info("${ctx}", $1, `
    )
    .replace(
      /console\.log\(\s*(`[^`]*`|"[^"]*"|'[^']*')\s*\)/g,
      `logger.info("${ctx}", $1)`
    )
    .replace(
      /console\.warn\(\s*(`[^`]*`|"[^"]*"|'[^']*')\s*,\s*/g,
      `logger.warn("${ctx}", $1, `
    )
    .replace(
      /console\.warn\(\s*(`[^`]*`|"[^"]*"|'[^']*')\s*\)/g,
      `logger.warn("${ctx}", $1)`
    );
}

let changed = 0;

for (const rel of files) {
  const abs = path.resolve(process.cwd(), rel);
  let src;
  try {
    src = readFileSync(abs, "utf8");
  } catch {
    console.log(`⚠  SKIP (not found): ${rel}`);
    continue;
  }

  // Skip if no console calls
  if (!/console\.(error|log|warn)/.test(src)) {
    console.log(`✓  CLEAN: ${rel}`);
    continue;
  }

  const ctx = contextTag(rel);
  let updated = replaceConsoleCalls(src, ctx);

  // Inject logger import if not already present
  if (!updated.includes("from \"@/lib/logger\"") && !updated.includes("from '@/lib/logger'")) {
    // Insert after the last import line
    const lastImportIdx = [...updated.matchAll(/^import .+$/gm)].pop()?.index ?? -1;
    if (lastImportIdx !== -1) {
      const lineEnd = updated.indexOf("\n", lastImportIdx);
      updated =
        updated.slice(0, lineEnd + 1) +
        LOGGER_IMPORT +
        "\n" +
        updated.slice(lineEnd + 1);
    } else {
      // No imports found, prepend
      updated = LOGGER_IMPORT + "\n" + updated;
    }
  }

  writeFileSync(abs, updated, "utf8");
  console.log(`✅ MIGRATED: ${rel}`);
  changed++;
}

console.log(`\nDone. ${changed} file(s) updated.`);
