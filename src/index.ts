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
        easy: ["car", "track", "fast", "road", "tire", "race", "blue", "red", "driver", "gear", "lap", "win", "top", "gas", "fuel"],
        mid: ["engine", "piston", "clutch", "torque", "octane", "exhaust", "nitrous", "turbo", "drift", "shift", "boost", "brake"],
        hard: ["acceleration", "supercharger", "aerodynamics", "transmission", "suspension", "intercooler", "manifold", "velocity"],
        extreme: ["thermodynamics", "synchronization", "hydroplaning", "interconnectivity", "electrification", "deceleration"]
      };

      const b = banks[level as keyof typeof banks] || banks.mid;
      const templates = [
        "the $1 is moving very $1 through the $1",
        "you must check the $1 before you start the $1",
        "a professional $1 will tune the $1 for the $1",
        "speed is $1 but control of the $1 is $1",
        "the $1 was designed for $1 and high $1"
      ];

      let stream = [];
      for(let i=0; i<40; i++) {
        let temp = templates[Math.floor(Math.random() * templates.length)];
        let sentence = temp.replace(/\$1/g, () => b[Math.floor(Math.random() * b.length)]);
        // Capitalize first letter and add a period
        sentence = sentence.charAt(0).toUpperCase() + sentence.slice(1) + ".";
        stream.push(...sentence.split(" "));
      }
      return new Response(JSON.stringify(stream), { headers: resHeaders });
    }
    return new Response("Redline Online", { status: 200 });
  }
}
