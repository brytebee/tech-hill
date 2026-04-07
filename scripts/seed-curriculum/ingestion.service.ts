const JINA_KEY = process.env.JINA_API_KEY ?? ""; // Optional: Set in .env for paid tier
const MAX_CONTEXT_CHARS = 8_000; // Guard against overflowing Llama's context window
const FETCH_TIMEOUT_MS = 15_000; // 15s per URL before aborting
const MIN_DELAY_MS = 500; // Minimum delay between fetches

export class IngestionService {
  /**
   * Fetches clean Markdown text from external URLs using the Jina AI Reader API.
   * Runs sequentially to prevent rate limits.
   * - Enforces a 15s timeout per URL to prevent indefinite hangs.
   * - Clamps fetched content to 8,000 chars to guard against Llama context overflow.
   * - Uses adaptive delay based on actual response time.
   *
   * @param urls Array of external documentation URLs
   * @returns Concatenated Markdown text from all URLs (context-window safe)
   */
  static async ingestUrlsSeq(urls: string[]): Promise<string> {
    if (!urls || urls.length === 0) return "";

    console.log(`\n    🌐 [RAG] Ingesting live data from ${urls.length} source(s)...`);
    let combinedMarkdown = "";

    for (let i = 0; i < urls.length; i++) {
      const url = urls[i];
      const targetUrl = `https://r.jina.ai/${url}`;
      const startTime = Date.now();

      try {
        console.log(`      ↳ Fetching: ${url}`);

        const controller = new AbortController();
        const timeoutHandle = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

        let response: Response;
        try {
          response = await fetch(targetUrl, {
            method: "GET",
            signal: controller.signal,
            headers: {
              "Accept": "text/plain",
              ...(JINA_KEY ? { Authorization: `Bearer ${JINA_KEY}` } : {}),
            },
          });
        } finally {
          clearTimeout(timeoutHandle);
        }

        if (!response.ok) {
          console.warn(`      ⚠️ [WARNING] Failed to fetch ${url} — Status: ${response.status}`);
          continue;
        }

        const rawText = await response.text();

        // Guard: clamp to MAX_CONTEXT_CHARS to protect Llama's context window
        const mdText = rawText.length > MAX_CONTEXT_CHARS
          ? rawText.slice(0, MAX_CONTEXT_CHARS) + "\n\n[...content truncated for context window safety]"
          : rawText;

        if (rawText.length > MAX_CONTEXT_CHARS) {
          console.warn(`      ✂️ [TRIM] ${url} returned ${rawText.length} chars — trimmed to ${MAX_CONTEXT_CHARS}.`);
        }

        combinedMarkdown += `\n\n--- Source: ${url} ---\n\n${mdText}`;
      } catch (error: any) {
        if (error.name === "AbortError") {
          console.error(`      ⏱️ [TIMEOUT] ${url} exceeded ${FETCH_TIMEOUT_MS / 1000}s — skipping.`);
        } else {
          console.error(`      ❌ [ERROR] Could not ingest ${url}:`, error.message);
        }
      }

      // Adaptive delay: subtract elapsed time from minimum so fast responses don't wait full 1s
      if (i < urls.length - 1) {
        const elapsed = Date.now() - startTime;
        const remaining = Math.max(MIN_DELAY_MS, 1000 - elapsed);
        await new Promise((resolve) => setTimeout(resolve, remaining));
      }
    }

    return combinedMarkdown.trim();
  }
}
