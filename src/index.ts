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
        easy: [
          "the", "fast", "car", "red", "blue", "road", "track", "race", "tire", "gear", "run", "go", "big", "sun", "hot", "cool", "top", "win", "lap", "map",
          "street", "drive", "fast", "slow", "turn", "stop", "oil", "gas", "fuel", "tank", "door", "seat", "belt", "line", "sign", "light", "dark", "day", "night",
          "team", "fan", "club", "hub", "rim", "nut", "bolt", "tool", "kit", "box", "bag", "map", "way", "path", "end", "start", "new", "old", "used", "best",
          "good", "bad", "low", "high", "wide", "thin", "hard", "soft", "loud", "quiet", "fast", "quick", "swift", "rapid", "steady", "ready", "set", "go", "done",
          "left", "right", "back", "up", "down", "side", "view", "rear", "front", "hood", "roof", "trunk", "glass", "mirror", "dash", "wheel", "pedal", "brake", "horn"
        ],
        mid: [
          "engine", "piston", "clutch", "torque", "octane", "exhaust", "nitrous", "turbo", "driver", "street", "drift", "speed", "manual", "auto", "shift", "valve",
          "intake", "header", "muffler", "radiator", "coolant", "battery", "spark", "plug", "wire", "sensor", "gauge", "panel", "boost", "vacuum", "filter", "pump",
          "pulley", "belt", "chain", "gears", "shaft", "axle", "joint", "strut", "shock", "spring", "brake", "rotor", "pad", "caliper", "fluid", "line", "hose",
          "gasket", "seal", "bearing", "mount", "bracket", "frame", "chassis", "body", "fender", "bumper", "grille", "spoiler", "wing", "diffuser", "splitter",
          "skirt", "vent", "scoop", "flare", "camber", "toe", "caster", "offset", "width", "height", "stance", "fitment", "traction", "grip", "launch", "burnout",
          "staging", "lights", "timer", "quarter", "mile", "track", "circuit", "sector", "apex", "corner", "braking", "entry", "exit", "throttle", "steering"
        ],
        hard: [
          "acceleration", "supercharger", "aerodynamics", "transmission", "suspension", "intercooler", "manifold", "differential", "driveshaft", "crankshaft", "camshaft",
          "alternator", "compressor", "evaporator", "condenser", "thermostat", "distributor", "ignition", "injection", "carburetor", "fueling", "calibration", "tuning",
          "mapping", "diagnostics", "telemetry", "logistics", "performance", "reliability", "durability", "efficiency", "combustion", "friction", "velocity", "inertia",
          "momentum", "gravity", "downforce", "turbulence", "drag", "lift", "stability", "handling", "balance", "weight", "distribution", "geometry", "alignment",
          "articulation", "oscillation", "resonance", "frequency", "amplitude", "pressure", "temperature", "viscosity", "density", "volume", "capacity", "output",
          "horsepower", "wattage", "voltage", "amperage", "resistance", "inductance", "capacitance", "circuitry", "module", "controller", "actuator", "solenoid",
          "hydraulic", "pneumatic", "mechanical", "electrical", "synthetic", "organic", "composite", "alloy", "aluminum", "titanium", "carbon", "fiber", "kevlar"
        ],
        extreme: [
          "thermodynamics", "synchronization", "hydroplaning", "interconnectivity", "electrification", "deceleration", "miniaturization", "standardization", "neutralization",
          "optimization", "specification", "quantification", "verification", "validation", "integration", "configuration", "implementation", "transformation", "diversification",
          "intensification", "amplification", "stabilization", "rectification", "modification", "simplification", "multiplication", "polarization", "magnetization",
          "vaporization", "liquefaction", "solidification", "crystallization", "fragmentation", "categorization", "specialization", "industrialization", "modernization",
          "globalization", "privatization", "centralization", "decentralization", "urbanization", "commercialization", "popularization", "rehabilitation", "reconstruction",
          "reorganization", "redistribution", "recalculation", "revaluation", "renegotiation", "reclassification", "recalibration", "reconfiguration", "reinstallation",
          "reauthorization", "reauthentication", "bioluminescence", "photosynthesis", "electromagnetism", "radioactivity", "biodegradability", "sustainability"
        ]
      };

      const b = banks[level as keyof typeof banks] || banks.mid;
      
      // LOGICAL SENTENCE TEMPLATES
      const templates = [
        "the $1 is moving very $1 through the $1",
        "you must check the $1 before you start the $1",
        "a professional $1 will always tune the $1 for the $1",
        "if the $1 fails then the $1 might damage the $1",
        "speed is $1 but control of the $1 is the $1 to winning",
        "the $1 was designed for $1 and high $1",
        "never let a $1 get in the way of a perfect $1",
        "the sound of the $1 is better than a $1 in the $1",
        "push the $1 to the limit on every $1 tonight"
      ];

      let stream = [];
      for(let i=0; i<30; i++) {
        let temp = templates[Math.floor(Math.random() * templates.length)];
        // Replace placeholders with random words from the current bank
        let sentence = temp.replace(/\$1/g, () => b[Math.floor(Math.random() * b.length)]);
        stream.push(...sentence.split(" "));
      }
      
      return new Response(JSON.stringify(stream), { headers: resHeaders });
    }
    
    return new Response("Redline Core Online", { status: 200 });
  }
}
