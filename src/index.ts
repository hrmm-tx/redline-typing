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

    // Handle CORS preflight
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    // Health Check
    if (url.pathname === "/health") {
      return new Response(JSON.stringify({ status: "ACTIVE", engine: "REDLINE v2.5" }), {
        headers: corsHeaders,
      });
    }

    // GET /api/passage - Fetches curated content
    if (url.pathname === "/api/passage") {
      const language = url.searchParams.get("language") || "english";
      
      const banks: Record<string, string[]> = {
        english: [
          "Precision is the foundational key to all high-frequency response sequences.",
          "System architecture requires consistent input frequency to stabilize the neural link.",
          "Innovation distinguishes between a leader and a follower in the digital landscape.",
          "The quick brown fox jumps over the lazy dog under the red neon lights of the terminal.",
          "Maintain absolute focus to reach peak velocity in this high-performance environment."
        ],
        python: [
          "def calculate_wpm(chars, time):\n    return (chars / 5) / (time / 60)",
          "class TypingEngine:\n    def __init__(self, mode='time'):\n        self.mode = mode",
          "import time\nstart = time.time()\n# Execute high performance sequence",
          "results = [r for r in db.query() if r.wpm > 100]",
          "print(f'Velocity achieved: {live_wpm} WPM')"
        ],
        lua: [
          "local function onTick()\n    updateCaretPosition()\nend",
          "if player.wpm > 120 then\n    setRank('REDLINE')\nend",
          "for i=1, #words do\n    validateInput(words[i])\nend",
          "local stats = { wpm = 0, accuracy = 100 }",
          "event.subscribe('keypress', handleKey)"
        ],
        html: [
          "<div class='caret animate-pulse'></div>",
          "<section id='hud' data-velocity='high'></section>",
          "<script src='/engine.js' async></script>",
          "<header class='redline-header'>v2.5 ACTIVE</header>",
          "<main class='typing-area' autofocus></main>"
        ]
      };

      const bank = banks[language] || banks['english'];
      const passage = bank[Math.floor(Math.random() * bank.length)];
      
      return new Response(JSON.stringify({ passage, language }), {
        headers: corsHeaders,
      });
    }

    // POST /api/results - Saves performance data
    if (url.pathname === "/api/results" && request.method === "POST") {
      try {
        const data = await request.json();
        const { wpm, accuracy, rawWpm, characters, difficulty, mode, language } = data as any;

        await env.DB.prepare(
          "INSERT INTO results (wpm, accuracy, raw_wpm, characters, difficulty, mode, language, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
        )
        .bind(wpm, accuracy, rawWpm, characters, difficulty, mode, language || 'english', Date.now())
        .run();

        return new Response(JSON.stringify({ success: true, status: "SYNCED" }), {
          headers: corsHeaders,
        });
      } catch (err: any) {
        return new Response(JSON.stringify({ error: err.message }), {
          status: 500,
          headers: corsHeaders,
        });
      }
    }

    return new Response("REDLINE ENGINE: PROTOCOL ERROR", { status: 404, headers: corsHeaders });
  },
};
