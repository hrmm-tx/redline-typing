export default {
  async fetch(request: Request, env: any): Promise<Response> {
    const url = new URL(request.url);
    const resHeaders = {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    };

    try {
      if (request.method === "OPTIONS") return new Response(null, { headers: resHeaders });

      // 1. Send OTP Code
      if (url.pathname === "/auth/send-otp" && request.method === "POST") {
        const { email } = await request.json() as any;
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        await env.DB.prepare("DELETE FROM verification_codes WHERE email = ?").bind(email).run();
        await env.DB.prepare("INSERT INTO verification_codes (email, code) VALUES (?, ?)")
          .bind(email, code).run();
        console.log(`Code for ${email}: ${code}`);
        return new Response(JSON.stringify({ success: true }), { headers: resHeaders });
      }

      // 2. Verify OTP & Create/Update User
      if (url.pathname === "/auth/verify-otp" && request.method === "POST") {
        const { email, code, password, username } = await request.json() as any;
        const record = await env.DB.prepare("SELECT * FROM verification_codes WHERE email = ? AND code = ? AND expires_at > datetime('now')")
          .bind(email, code).first();
        if (!record) throw new Error("INVALID_CODE");
        await env.DB.prepare(`INSERT INTO users (username, email, password) VALUES (?, ?, ?) ON CONFLICT(email) DO UPDATE SET password=excluded.password`)
          .bind(username || email.split('@')[0], email, password).run();
        return new Response(JSON.stringify({ success: true }), { headers: resHeaders });
      }

      // 3. Game Words API
      if (url.pathname === "/api/words") {
        const words = ["velocity", "nitrous", "redline", "clutch", "ignition", "turbo", "gearbox"];
        const list = Array.from({length: 20}, () => words[Math.floor(Math.random()*words.length)]);
        return new Response(JSON.stringify(list), { headers: resHeaders });
      }

      return new Response("Redline API Active", { status: 200 });

    } catch (err: any) {
      const errorData = { message: err.message, stack: err.stack, time: new Date().toISOString(), path: url.pathname };
      if (url.pathname.includes("/auth") || url.pathname.includes("/api")) {
        return new Response(JSON.stringify({ error: err.message }), { status: 400, headers: resHeaders });
      }
      return new Response(renderNextcloudError(errorData), { status: 500, headers: { "Content-Type": "text/html" } });
    }
  }
}

function renderNextcloudError(err: any) {
  return `<!DOCTYPE html><html><head><style>body{background:#0082c9;color:#333;font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0}.card{background:#fff;padding:40px;border-radius:8px;text-align:center;box-shadow:0 10px 25px rgba(0,0,0,0.2);max-width:400px}h1{font-size:22px;margin:0 0 10px}p{color:#666;font-size:14px}.btn{background:#0082c9;color:#fff;text-decoration:none;padding:10px 20px;display:inline-block;margin-top:20px;border-radius:4px}.debug{display:none;text-align:left;background:#f4f4f4;padding:10px;margin-top:20px;font-size:11px;word-break:break-all}</style></head><body><div class="card"><h1>Internal Server Error</h1><p>The server was unable to complete your request.</p><a href="/" class="btn">Back to Redline</a><div style="margin-top:20px"><button onclick="document.querySelector('.debug').style.display='block'" style="background:none;border:none;color:#999;cursor:pointer;text-decoration:underline">Technical details</button><div class="debug"><strong>Error:</strong> ${err.message}<br><strong>Path:</strong> ${err.path}<br><strong>Stack:</strong> ${err.stack}</div></div></div></body></html>`;
}
