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

    if (url.pathname === "/api/words") {
      const level = url.searchParams.get("level") || "mid";
      const banks = {
        easy: ["the", "car", "fast", "road", "race", "blue", "red", "gear", "lap", "win", "top", "gas"],
        mid: ["engine", "piston", "clutch", "torque", "octane", "exhaust", "nitrous", "turbo", "drift"],
        hard: ["acceleration", "supercharger", "aerodynamics", "transmission", "suspension", "velocity"],
        extreme: ["thermodynamics", "synchronization", "hydroplaning", "interconnectivity", "deceleration"]
      };

      const b = banks[level as keyof typeof banks] || banks.mid;
      const templates = [
        "The $1 is moving very $1 through the $1.",
        "Check the $1 before you start the $1.",
        "A professional $1 will tune the $1 for the $1.",
        "Speed is $1 but control of the $1 is the $1."
      ];

      let stream = [];
      // Generate 100 sentences to ensure no "Loading" delays
      for(let i=0; i<100; i++) {
        let temp = templates[Math.floor(Math.random() * templates.length)];
        let sentence = temp.replace(/\$1/g, () => b[Math.floor(Math.random() * b.length)]);
        stream.push(...sentence.split(" "));
      }
      return new Response(JSON.stringify(stream), { headers: resHeaders });
    }
    return new Response("Redline Online", { status: 200 });
  }
}
