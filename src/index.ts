export default {
  async fetch(request: Request, env: any) {
    const url = new URL(request.url);
    const resHeaders = {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    };

    if (request.method === "OPTIONS") return new Response(null, { headers: resHeaders });

    // New Dynamic Word Logic: 4 Tiers
    if (url.pathname === "/api/words") {
      const difficulty = url.searchParams.get("level") || "mid";
      const wordBank = {
        easy: ["the", "at", "it", "is", "on", "go", "car", "run", "fast", "top"],
        mid: ["engine", "piston", "clutch", "driver", "torque", "racing", "vector", "octane"],
        hard: ["acceleration", "supercharger", "transmission", "aerodynamic", "suspension"],
        extreme: ["synchronization", "thermodynamics", "interconnectivity", "hydroplaning"]
      };

      const selectedBank = wordBank[difficulty as keyof typeof wordBank] || wordBank.mid;
      const list = Array.from({ length: 100 }, () => selectedBank[Math.floor(Math.random() * selectedBank.length)]);
      
      return new Response(JSON.stringify(list), { headers: resHeaders });
    }

    // AUTH logic remains the same as previous stable version...
    return new Response("Engine Active", { status: 200 });
  }
}
