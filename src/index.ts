export default {
  async fetch(request: Request, env: any) {
    const url = new URL(request.url);
    const resHeaders = {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    };

    try {
      if (request.method === "OPTIONS") return new Response(null, { headers: resHeaders });

      // --- AUTH SYSTEM ---
      if (url.pathname === "/auth/send-otp" && request.method === "POST") {
        const { email } = await request.json() as any;
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        await env.DB.prepare("DELETE FROM verification_codes WHERE email = ?").bind(email).run();
        await env.DB.prepare("INSERT INTO verification_codes (email, code) VALUES (?, ?)")
          .bind(email, code).run();
        return new Response(JSON.stringify({ success: true }), { headers: resHeaders });
      }

      if (url.pathname === "/auth/verify-otp" && request.method === "POST") {
        const { email, code, password } = await request.json() as any;
        const record = await env.DB.prepare("SELECT * FROM verification_codes WHERE email = ? AND code = ? AND expires_at > datetime('now')").bind(email, code).first();
        if (!record) throw new Error("INVALID_CODE");
        await env.DB.prepare("INSERT INTO users (email, password) VALUES (?, ?) ON CONFLICT(email) DO UPDATE SET password=excluded.password").bind(email, password).run();
        return new Response(JSON.stringify({ success: true }), { headers: resHeaders });
      }

      // --- WORD ENGINE ---
      if (url.pathname === "/api/words") {
        const words = ["turbo", "redline", "nitrous", "clutch", "ignition", "gearbox", "exhaust", "manifold", "piston", "velocity"];
        const list = Array.from({length: 30}, () => words[Math.floor(Math.random()*words.length)]);
        return new Response(JSON.stringify(list), { headers: resHeaders });
      }

      return new Response("Engine Online", { status: 200 });
    } catch (err: any) {
      return new Response(JSON.stringify({ error: err.message }), { status: 400, headers: resHeaders });
    }
  }
}
