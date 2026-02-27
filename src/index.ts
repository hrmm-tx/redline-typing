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
        easy: ["the", "car", "fast", "road", "race", "blue", "red", "gear", "lap", "win", "top", "gas", "oil", "rim", "hub", "fan", "sun", "hot", "cool", "day", "night"],
        mid: ["engine", "piston", "clutch", "torque", "octane", "exhaust", "nitrous", "turbo", "drift", "shift", "boost", "brake", "valve", "intake", "gauge", "spark"],
        hard: ["acceleration", "supercharger", "aerodynamics", "transmission", "suspension", "velocity", "manifold", "differential", "crankshaft", "alternator", "ignition"],
        extreme: ["thermodynamics", "synchronization", "hydroplaning", "interconnectivity", "electrification", "deceleration", "miniaturization", "standardization"]
      };

      const b = banks[level as keyof typeof banks] || banks.mid;
      const templates = [
        "The $1 is moving very $1 through the $1.",
        "Check the $1 before you start the $1.",
        "A professional $1 will tune the $1 for the $1.",
        "Speed is $1 but control of the $1 is the key."
      ];

      let stream = [];
      for(let i=0; i<60; i++) {
        let temp = templates[Math.floor(Math.random() * templates.length)];
        let sentence = temp.replace(/\$1/g, () => b[Math.floor(Math.random() * b.length)]);
        stream.push(...sentence.split(" "));
      }
      return new Response(JSON.stringify(stream), { headers: resHeaders });
    }
    return new Response("Engine Active", { status: 200 });
  }
}
