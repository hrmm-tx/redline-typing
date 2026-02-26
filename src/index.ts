export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const resHeaders = { 
        "Content-Type": "application/json", 
        "Access-Control-Allow-Origin": "*" 
    };

    if (request.method === "OPTIONS") return new Response(null, { headers: resHeaders });

    // 1. Generate & Store OTP
    if (url.pathname === "/auth/send-otp" && request.method === "POST") {
      const { email } = await request.json() as any;
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      
      // Remove old codes for this email first
      await env.DB.prepare("DELETE FROM verification_codes WHERE email = ?").bind(email).run();
      // Insert new code
      await env.DB.prepare("INSERT INTO verification_codes (email, code) VALUES (?, ?)")
        .bind(email, code).run();

      console.log(`DEBUG: Code for ${email} is ${code}`);
      return new Response(JSON.stringify({ success: true, msg: "Code sent to console" }), { headers: resHeaders });
    }

    // 2. Verify OTP & Finalize User (Signup or Reset)
    if (url.pathname === "/auth/verify-otp" && request.method === "POST") {
      const { email, code, password, username } = await request.json() as any;
      
      const record = await env.DB.prepare("SELECT * FROM verification_codes WHERE email = ? AND code = ? AND expires_at > datetime('now')")
        .bind(email, code).first();

      if (!record) return new Response(JSON.stringify({ error: "Invalid or expired code" }), { status: 401, headers: resHeaders });

      // Upsert user (Update if exists, Insert if new)
      await env.DB.prepare(`
        INSERT INTO users (username, email, password) VALUES (?, ?, ?)
        ON CONFLICT(email) DO UPDATE SET password=excluded.password
      `).bind(username || email.split('@')[0], email, password).run();

      return new Response(JSON.stringify({ success: true }), { headers: resHeaders });
    }

    // 3. Word API (The Game)
    if (url.pathname === "/api/words") {
      const words = ["velocity", "nitrous", "redline", "clutch", "ignition", "gearbox", "turbo"];
      const list = Array.from({length: 20}, () => words[Math.floor(Math.random()*words.length)]);
      return new Response(JSON.stringify(list), { headers: resHeaders });
    }

    return new Response("Redline API Active", { status: 200 });
  }
}
