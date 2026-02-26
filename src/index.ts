export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const resHeaders = { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" };

    // 1. Send Verification Code (Signup/Reset)
    if (url.pathname === "/auth/send-code" && request.method === "POST") {
      const { email } = await request.json();
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      
      // Store code in D1 with a 5-minute expiry
      await env.DB.prepare("INSERT INTO verification_codes (email, code, expires_at) VALUES (?, ?, datetime('now', '+5 minutes'))")
        .bind(email, code).run();

      // NOTE: Here you would call your Email API (Resend/SendGrid)
      console.log(`Sending code ${code} to ${email}`); 
      
      return new Response(JSON.stringify({ success: true, message: "Code Sent" }), { headers: resHeaders });
    }

    // 2. Verify and Finalize
    if (url.pathname === "/auth/verify" && request.method === "POST") {
      const { email, code, username, password } = await request.json();
      const valid = await env.DB.prepare("SELECT * FROM verification_codes WHERE email = ? AND code = ? AND expires_at > datetime('now')")
        .bind(email, code).first();

      if (!valid) return new Response(JSON.stringify({ error: "Invalid/Expired Code" }), { status: 401 });

      await env.DB.prepare("INSERT INTO users (username, email, password) VALUES (?, ?, ?)")
        .bind(username, email, password).run();
      
      return new Response(JSON.stringify({ success: true }), { headers: resHeaders });
    }

    // ... (Keep your /api/words route from before)
    return new Response("API Online", { status: 200 });
  }
}
