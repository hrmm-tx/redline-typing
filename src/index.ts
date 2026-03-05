/**
 * REDLINE PERFORMANCE BACKEND
 * Optimized for Cloudflare Workers + D1
 */

export interface Env {
  DB: D1Database;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Content-Type": "application/json",
    };

    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    // Health Check / System Status
    if (url.pathname === "/health") {
      return new Response(JSON.stringify({ status: "ACTIVE", engine: "REDLINE v2.5" }), {
        headers: corsHeaders,
      });
    }

    // GET /api/passage - Fetches a curated typing passage
    if (url.pathname === "/api/passage") {
      const difficulty = url.searchParams.get("difficulty") || "easy";
      const language = url.searchParams.get("language") || "english";
      
      // Professional sentence bank
      const bank = [
        "The engine is calibrated for maximum velocity. Maintain focus and precision for peak performance.",
        "System architecture requires consistent input frequency to stabilize the neural link.",
        "Precision is the foundational key to all high-frequency response sequences.",
        "Innovation distinguishes between a leader and a follower in the digital landscape.",
        "The quick brown fox jumps over the lazy dog under the red neon lights of the terminal."
      ];

      const passage = bank[Math.floor(Math.random() * bank.length)];
      return new Response(JSON.stringify({ passage, difficulty, language }), {
        headers: corsHeaders,
      });
    }

    // POST /api/results - Saves typing performance to D1
    if (url.pathname === "/api/results" && request.method === "POST") {
      try {
        const result = await request.json();
        const { wpm, accuracy, rawWpm, characters, difficulty, mode } = result as any;

        await env.DB.prepare(
          "INSERT INTO results (wpm, accuracy, raw_wpm, characters, difficulty, mode, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)"
        )
        .bind(wpm, accuracy, rawWpm, characters, difficulty, mode, Date.now())
        .run();

        return new Response(JSON.stringify({ success: true, rank: "SYNCED" }), {
          headers: corsHeaders,
        });
      } catch (err: any) {
        return new Response(JSON.stringify({ error: err.message }), {
          status: 500,
          headers: corsHeaders,
        });
      }
    }

    return new Response("REDLINE ENGINE: INVALID PROTOCOL", { status: 404, headers: corsHeaders });
  },
};
