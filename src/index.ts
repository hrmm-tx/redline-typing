export default {
  async fetch(request: Request, env: any): Promise<Response> {
    const url = new URL(request.url);
    
    // Professional Headers for Nextcloud-style Cloud Suite
    const resHeaders = {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    };

    try {
      // 1. Handle Browser Handshake (CORS Preflight)
      if (request.method === "OPTIONS") {
        return new Response(null, { headers: resHeaders });
      }

      /**
       * 2. SEND OTP (Signup/Reset)
       * Expects: { "email": "user@example.com" }
       */
      if (url.pathname === "/auth/send-otp" && request.method === "POST") {
        const body: any = await request.json().catch(() => ({}));
        const { email } = body;

        if (!email) throw new Error("MISSING_EMAIL_PAYLOAD");

        const code = Math.floor(100000 + Math.random() * 900000).toString();

        // Database logic
        await env.DB.prepare("DELETE FROM verification_codes WHERE email = ?").bind(email).run();
        await env.DB.prepare("INSERT INTO verification_codes (email, code) VALUES (?, ?)")
          .bind(email, code)
          .run();

        // Log for your internal pinning/debugging
        console.log(`[AUTH_DIAGNOSTIC] Code for ${email}: ${code}`);

        return new Response(JSON.stringify({ success: true }), { headers: resHeaders });
      }

      /**
       * 3. VERIFY OTP & SYNC
       * Expects: { "email", "code", "password", "username" }
       */
      if (url.pathname === "/auth/verify-otp" && request.method === "POST") {
        const body: any = await request.json().catch(() => ({}));
        const { email, code, password, username } = body;

        if (!email || !code) throw new Error("INCOMPLETE_VERIFICATION_DATA");

        const record = await env.DB.prepare(
          "SELECT * FROM verification_codes WHERE email = ? AND code = ? AND expires_at > datetime('now')"
        )
          .bind(email, code)
          .first();

        if (!record) throw new Error("INVALID_OR_EXPIRED_OTP");

        // Create or Update User (Nextcloud-style Sync)
        await env.DB.prepare(`
          INSERT INTO users (username, email, password) VALUES (?, ?, ?)
          ON CONFLICT(email) DO UPDATE SET password=excluded.password
        `).bind(username || email.split('@')[0], email, password).run();

        return new Response(JSON.stringify({ success: true }), { headers: resHeaders });
      }

      /**
       * 4. WORD API (The Game Logic)
       */
      if (url.pathname === "/api/words") {
        const words = ["velocity", "nitrous", "redline", "clutch", "ignition", "gearbox", "turbo", "asphalt", "piston", "vector"];
        const list = Array.from({ length: 25 }, () => words[Math.floor(Math.random() * words.length)]);
        return new Response(JSON.stringify(list), { headers: resHeaders });
      }

      // Default landing if someone hits the API directly
      return new Response("Redline Cloud API - System Active", { status: 200 });

    } catch (err: any) {
      const errorData = {
        message: err.message || "Internal Server Error",
        stack: err.stack || "No stack trace available",
        time: new Date().toISOString(),
        path: url.pathname
      };

      // If it's an API call, return JSON so the app doesn't break
      if (url.pathname.includes("/auth") || url.pathname.includes("/api")) {
        return new Response(JSON.stringify({ error: errorData.message }), { 
          status: 400, 
          headers: resHeaders 
        });
      }

      // If it's a browser visit, show the Professional Error Page
      return new Response(renderNextcloudError(errorData), {
        status: 500,
        headers: { "Content-Type": "text/html" }
      });
    }
  }
};

/**
 * Nextcloud-Style Error Interface
 */
function renderNextcloudError(err: any) {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Internal Server Error - Redline Cloud</title>
        <style>
            :root { --nc-blue: #0082c9; --nc-bg: #f5f7f9; }
            body { background: linear-gradient(135deg, var(--nc-blue) 0%, #004e7a 100%); color: #313131; font-family: -apple-system, system-ui, sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; }
            .card { background: white; padding: 40px; width: 100%; max-width: 450px; text-align: center; border-radius: 8px; box-shadow: 0 10px 25px rgba(0,0,0,0.2); }
            .logo { width: 80px; height: 80px; margin-bottom: 20px; }
            h1 { font-size: 24px; font-weight: 300; margin: 0 0 15px 0; color: #000; }
            p { color: #555; font-size: 14px; margin-bottom: 30px; line-height: 1.6; }
            .btn { background: var(--nc-blue); color: #fff; text-decoration: none; padding: 12px 30px; border-radius: 3px; font-weight: 600; display: inline-block; transition: background 0.2s; }
            .debug-section { margin-top: 40px; border-top: 1px solid #eee; padding-top: 15px; }
            .show-more { color: #888; font-size: 12px; cursor: pointer; background: none; border: none; text-decoration: underline; }
            .debug-content { display: none; background: #282c34; color: #abb2bf; padding: 15px; font-family: monospace; font-size: 11px; border-radius: 4px; margin-top: 15px; text-align: left; white-space: pre-wrap; word-break: break-all; }
        </style>
    </head>
    <body>
        <div class="card">
            <svg class="logo" viewBox="0 0 24 24" fill="var(--nc-blue)"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>
            <h1>Internal Server Error</h1>
            <p>The server was unable to complete your request. If this happens again, please provide the technical details below.</p>
            <a href="/" class="btn">Back to Redline Cloud</a>
            <div class="debug-section">
                <button class="show-more" onclick="const d = document.getElementById('debug'); d.style.display = d.style.display === 'block' ? 'none' : 'block';">Technical details</button>
                <div id="debug" class="debug-content">
<strong>Request ID:</strong> ${err.time.replace(/[^0-9]/g, '').slice(-10)}
<strong>Error:</strong> ${err.message}
<strong>Path:</strong> ${err.path}
<hr style="border:0; border-top:1px solid #444; margin: 10px 0;">
<strong>Stack Trace:</strong>
${err.stack}
                </div>
            </div>
        </div>
    </body>
    </html>
  `;
}
