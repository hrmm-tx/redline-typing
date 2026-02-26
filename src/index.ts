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
      const lang = url.searchParams.get("lang") || "english";
      
      const banks = {
        english: {
          easy: ["the", "dog", "ran", "fast", "blue", "car", "sky", "is", "big", "home"],
          mid: ["driver", "engine", "piston", "clutch", "torque", "racing", "octane", "street"],
          hard: ["acceleration", "supercharger", "aerodynamics", "transmission", "suspension"],
          extreme: ["thermodynamics", "synchronization", "hydroplaning", "interconnectivity"]
        },
        spanish: {
          easy: ["el", "perro", "corre", "azul", "casa", "sol", "gran", "esta", "va", "luz"],
          mid: ["motor", "piston", "embrague", "piloto", "torque", "carrera", "octanaje", "calle"]
        }
      };

      const selected = banks[lang as keyof typeof banks] || banks.english;
      const bank = selected[level as keyof typeof selected] || selected.mid;
      
      // Logic to build "Natural" pseudo-sentences
      const list = [];
      for(let i=0; i<150; i++) {
          list.push(bank[Math.floor(Math.random() * bank.length)]);
      }
      return new Response(JSON.stringify(list), { headers: resHeaders });
    }
    
    return new Response("Redline Core Online", { status: 200 });
  }
}
