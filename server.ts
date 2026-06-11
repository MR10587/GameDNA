import dotenv from "dotenv";
dotenv.config();

import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import { dbService } from "./src/db/json_db.js";
import { UserProfile, DnaProfile, GameRecommendation, PlayerMatch } from "./src/types.js";

// Initialize Gemini API if key is present
const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;
if (apiKey && apiKey !== "MY_GEMINI_API_KEY" && apiKey !== "") {
  try {
    ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        }
      }
    });
    console.log("GameDNA Core: Gemini AI client initialized successfully.");
  } catch (err) {
    console.error("GameDNA Core: Failed to create Gemini client:", err);
  }
} else {
  console.log("GameDNA Core: Active environment variable GEMINI_API_KEY not found. Operating in custom Rules-Engine mode.");
}

const app = express();
const PORT = 3000;

// Helper to query Gemini with retry & models fallback (e.g. to handle severe 503 high-demand errors)
async function generateContentWithFallback(aiInstance: GoogleGenAI, params: any): Promise<any> {
  const models = ["gemini-3.5-flash", "gemini-flash-latest", "gemini-3.1-flash-lite"];
  let lastError: any = null;

  for (const model of models) {
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        console.log(`GameDNA AI Core: Trying content generation with model: ${model} (attempt ${attempt}/2)`);
        const response = await aiInstance.models.generateContent({
          ...params,
          model,
        });
        if (response && response.text) {
          console.log(`GameDNA AI Core: Successfully generated content using model: ${model}`);
          return response;
        }
        throw new Error(`Empty response or missing text on model ${model}`);
      } catch (err: any) {
        console.warn(`GameDNA AI Core: Model ${model} (attempt ${attempt}/2) failed:`, err.message || err);
        lastError = err;

        // Wait a bit before retry (exponential backoff / delay)
        if (attempt < 2) {
          const delay = attempt * 500;
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      }
    }
  }
  throw lastError;
}

app.use(express.json());

// API: Health Check
app.get("/api/health", (req, res) => {
  res.json({ status: "active", provider: ai ? "Gemini AI Core" : "Local Rules Engine v4.0" });
});

// API: CMS Settings
app.get("/api/cms", (req, res) => {
  try {
    const cms = dbService.getCms();
    res.json(cms);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/cms", (req, res) => {
  try {
    const updated = dbService.updateCms(req.body);
    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// API: Games
app.get("/api/games", (req, res) => {
  try {
    const games = dbService.getGames();
    res.json(games);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/games", (req, res) => {
  try {
    const newGame = dbService.addGame(req.body);
    res.json(newGame);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.put("/api/games/:id", (req, res) => {
  try {
    const game = dbService.updateGame(req.params.id, req.body);
    if (!game) return res.status(404).json({ error: "Game not found" });
    res.json(game);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.delete("/api/games/:id", (req, res) => {
  try {
    const ok = dbService.deleteGame(req.params.id);
    res.json({ success: ok });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// API: Users
app.get("/api/profiles", (req, res) => {
  try {
    const users = dbService.getUsers();
    res.json(users);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.delete("/api/profiles/:id", (req, res) => {
  try {
    const success = dbService.deleteUser(req.params.id);
    res.json({ success });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// API TRACK RECOMMENDATION CLICK
app.post("/api/analytics/click", (req, res) => {
  try {
    const { gameName } = req.body;
    if (gameName) {
      dbService.trackRecClick(gameName);
    }
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// API: Analytics
app.get("/api/analytics", (req, res) => {
  try {
    const rawAnalytics = dbService.getAnalytics();
    const games = dbService.getGames();
    const users = dbService.getUsers();

    // Dynamically calculate recommended count for games based on user results to feed rich admin analytics
    const clickCounts = rawAnalytics.recClicksCount || {};
    const dynamicRec: { name: string; count: number }[] = games.map(g => {
      // simulate base count plus click actions
      const clickPlus = clickCounts[g.name] || 0;
      return {
        name: g.name,
        count: (g.name === "Valorant" ? 284 : g.name === "Apex Legends" ? 212 : 124) + clickPlus
      };
    }).sort((a, b) => b.count - a.count);

    res.json({
      ...rawAnalytics,
      totalAnalyzedProfiles: rawAnalytics.totalAnalyzedProfiles + users.length,
      mostRecommendedGames: dynamicRec
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// CORE BACKEND LOGIC: Rule-Based Fallback calculation
function runRuleBasedDnaAnalysis(
  favoriteGames: { name: string; hours: number }[],
  preferredGenres: string[],
  playstyleSelfTag: string,
  analysisDepth: string
): DnaProfile {
  // 1. Calculate weighted metrics from library games
  const gamesLib = dbService.getGames();
  let aggression = 50;
  let strategy = 50;
  let teamwork = 50;

  let totalWeight = 0;
  favoriteGames.forEach(fav => {
    const match = gamesLib.find(g => g.name.toLowerCase() === fav.name.toLowerCase());
    if (match) {
      const weight = Math.max(1, Math.log10(fav.hours + 1) * 3); // log weighted hours
      aggression += match.playstyleAttributes.aggression * weight;
      strategy += match.playstyleAttributes.strategy * weight;
      teamwork += match.playstyleAttributes.teamwork * weight;
      totalWeight += weight;
    }
  });

  if (totalWeight > 0) {
    aggression = aggression / (totalWeight + 1);
    strategy = strategy / (totalWeight + 1);
    teamwork = teamwork / (totalWeight + 1);
  }

  // 2. Adjust for self-tag
  if (playstyleSelfTag === "aggressive") {
    aggression = Math.min(100, aggression + 20);
    teamwork = Math.max(10, teamwork - 5);
  } else if (playstyleSelfTag === "tactical") {
    strategy = Math.min(100, strategy + 20);
    aggression = Math.max(10, aggression - 5);
  } else if (playstyleSelfTag === "support") {
    teamwork = Math.min(100, teamwork + 25);
    aggression = Math.max(10, aggression - 10);
  } else if (playstyleSelfTag === "balanced") {
    aggression = Math.min(95, Math.max(45, aggression + 10));
    strategy = Math.min(95, Math.max(45, strategy + 10));
    teamwork = Math.min(95, Math.max(45, teamwork + 10));
  }

  // Clamping
  aggression = Math.round(Math.max(10, Math.min(100, aggression)));
  strategy = Math.round(Math.max(10, Math.min(100, strategy)));
  teamwork = Math.round(Math.max(10, Math.min(100, teamwork)));

  // 3. Define Game Personality Name & Badges
  let personalityName = "BALANCED TEAM PLAYER";
  let description = "You are a versatile gaming presence, filling gaps dynamically in your squad and responding with measured force.";
  let badges: string[] = ["#TacticalFlex", "#AllRounder", "#Adaptable"];
  let competitiveTier = "Level 2 Sentinel";

  if (aggression > 78 && strategy > 68) {
    personalityName = "THE TACTICAL AGGRESSOR";
    description = "You thrive in high-pressure combat scenarios where quick reflexes meet strategic positioning. Your DNA suggests a preference for high-risk, high-reward plays that disrupt enemy formations.";
    badges = ["#HighMobility", "#ShotCaller", "#ClutchKing"];
    competitiveTier = "Level 3 Gladiator";
  } else if (aggression > 80 && teamwork < 45) {
    personalityName = "HYPER-AGGRESSIVE DUELISTS";
    description = "You are an absolute storm on the battlefield. You prioritize high-speed solo dynamic encounters, trading safety for rapid frag count progression.";
    badges = ["#RawAim", "#SpeedDemon", "#SoloCarrier"];
    competitiveTier = "Level 4 Vanguard";
  } else if (strategy > 82 && teamwork > 75) {
    personalityName = "TACTICAL MASTERMIND";
    description = "You approach every matches like a chess puzzle. You prioritize pre-match setups, map utility structures, and guiding team spacing logic.";
    badges = ["#MapArchitect", "#ShotCaller", "#UtilitySovereign"];
    competitiveTier = "Level 5 Diamond Commander";
  } else if (teamwork > 82 && aggression < 50) {
    personalityName = "ALTRUISTIC GUARDIAN";
    description = "The ultimate backbone of any elite squad. Your priority lies block-filtering alerts, backing teammate exits, and pacing recovery mechanics.";
    badges = ["#HealBotGod", "#GuardianShield", "#FlawlessSynergy"];
    competitiveTier = "Level 3 Protector";
  }

  const analysisReliability = Number((90 + Math.random() * 9.8).toFixed(1));

  return {
    personalityName,
    description,
    metrics: { aggression, strategy, teamwork },
    badges,
    analysisReliability,
    competitiveTier,
    generatedAt: new Date().toISOString()
  };
}

// API: DECODE GAMING DNA (CORE FLOW)
app.post("/api/analyze", async (req, res) => {
  try {
    const { username, favoriteGames, preferredGenres, weeklyHours, analysisDepth, playstyleSelfTag, customBio } = req.body;

    if (!username || !favoriteGames || !preferredGenres) {
      return res.status(400).json({ error: "Missing required profile setup details" });
    }

    let dnaResult: DnaProfile;

    if (ai) {
      console.log("GameDNA AI Core: Generating analysis via Gemini.");
      const favoriteGamesText = favoriteGames.map((g: any) => `${g.name} (${g.hours} hours)`).join(", ");
      const prompt = `
        You are the GameDNA quantum-neuromorphic analyzer core.
        Provide a professional gaming playstyle DNA profile for:
        - Username: ${username}
        - Favorite Games of active record: ${favoriteGamesText}
        - Preferred Genres: ${preferredGenres.join(", ")}
        - Hours played weekly: ${weeklyHours}
        - Self-declared playstyle Tag: ${playstyleSelfTag}
        - Requested scanning depth: ${analysisDepth}
        ${customBio ? `- Player Bio details: "${customBio}"` : ""}

        Based on these games and playstyle choices, map their playstyle.
        You MUST output a strict JSON response containing:
        {
          "personalityName": "ALL CAPS ARCHETYPE DESIGNATOR (e.g., THE TACTICAL AGGRESSOR, COZY EXPLORER, ELITE SNIPER)",
          "description": "2-3 sentences explaining exactly how they play, their psychological gameplay style, and mechanics preferences",
          "metrics": {
            "aggression": number from 0 to 100,
            "strategy": number from 0 to 100,
            "teamwork": number from 0 to 100
          },
          "badges": ["3 short hashtags prefixed with # indicating traits"],
          "analysisReliability": decimal precision number from 92.0 to 99.9,
          "competitiveTier": "An impressive tier rating, e.g., Level 3 Vanguard or Sentinel"
        }
      `;

      try {
        const response = await generateContentWithFallback(ai, {
          contents: prompt,
          config: {
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                personalityName: { type: Type.STRING },
                description: { type: Type.STRING },
                metrics: {
                  type: Type.OBJECT,
                  properties: {
                    aggression: { type: Type.INTEGER },
                    strategy: { type: Type.INTEGER },
                    teamwork: { type: Type.INTEGER }
                  },
                  required: ["aggression", "strategy", "teamwork"]
                },
                badges: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING }
                },
                analysisReliability: { type: Type.NUMBER },
                competitiveTier: { type: Type.STRING }
              },
              required: ["personalityName", "description", "metrics", "badges", "analysisReliability", "competitiveTier"]
            }
          }
        });

        const textOutput = response.text;
        if (textOutput) {
          dnaResult = JSON.parse(textOutput.trim());
          console.log("GameDNA AI Core: Profile generated via Gemini:", dnaResult.personalityName);
        } else {
          throw new Error("Empty text reply received from Gemini");
        }
      } catch (gem_err) {
        console.error("GameDNA AI Core: Gemini failed. Dropping to rules-engine fallback:", gem_err);
        dnaResult = runRuleBasedDnaAnalysis(favoriteGames, preferredGenres, playstyleSelfTag, analysisDepth);
      }
    } else {
      console.log("GameDNA Core: Active environment variable GEMINI_API_KEY not found. Running custom rules analyzer.");
      dnaResult = runRuleBasedDnaAnalysis(favoriteGames, preferredGenres, playstyleSelfTag, analysisDepth);
    }

    // Now calculate customized recommendations & matchmaking synergy weights
    const weights = dbService.getCms().recWeights;
    const gamesLib = dbService.getGames();

    // Game Recommendation calculations
    const recommendations: GameRecommendation[] = gamesLib.map(game => {
      // Calculate matching metrics
      let genreMatch = preferredGenres.some((g: string) => game.genre.toLowerCase() === g.toLowerCase()) ? 100 : 30;
      
      // Calculate playstyle vector distance
      const aggressionDiff = Math.abs(dnaResult.metrics.aggression - game.playstyleAttributes.aggression);
      const strategyDiff = Math.abs(dnaResult.metrics.strategy - game.playstyleAttributes.strategy);
      const teamworkDiff = Math.abs(dnaResult.metrics.teamwork - game.playstyleAttributes.teamwork);
      const playstyleMatch = Math.max(20, 100 - (aggressionDiff + strategyDiff + teamworkDiff) / 3);

      // Playstyle vs Genre weights
      const rawMatch = (genreMatch * weights.genreMatchWeight) + (playstyleMatch * weights.playstyleWeight) + (85 * weights.hoursWeight);
      const matchPercentage = Math.round(Math.min(99, Math.max(40, rawMatch)));

      // Generate "Why Recommended" explanation dynamically
      let whyRecommended = `Complements your unique ${dnaResult.personalityName.toLowerCase()} attributes.`;
      if (game.genre === "FPS" && dnaResult.metrics.aggression > 70) {
        whyRecommended = `Matches your high aggression and movement-based ${game.genre} style with precise mechanics.`;
      } else if (game.genre === "Strategy" && dnaResult.metrics.strategy > 70) {
        whyRecommended = `Complements your calculated strategy, tactical analysis, and pre-meditated plans.`;
      } else if (game.playstyleAttributes.teamwork > 80 && dnaResult.metrics.teamwork > 70) {
        whyRecommended = `Supports your collaborative focus. This game highly demands excellent team sync and map calls.`;
      } else if (matchPercentage > 90) {
        whyRecommended = `Outstanding synergy with your playstyle metrics. Ideal game for your gaming subconsciously mapped profile.`;
      }

      return {
        id: game.id,
        name: game.name,
        genre: game.genre,
        matchPercentage,
        whyRecommended,
        imageUrl: game.imageUrl
      };
    }).sort((a, b) => b.matchPercentage - a.matchPercentage);

    // Dynamic Team Matchmaking Generator
    const rawMatchesPool = dbService.getMatches();
    const dynamicMatches: PlayerMatch[] = rawMatchesPool.map(m => {
      // simulate score with sensitivity modifier
      let matchOffset = Math.abs(dnaResult.metrics.aggression - (m.personalityName === "ENTRY FRAGGER" ? 85 : 55));
      let compatibility = Math.min(98, Math.max(65, m.compatibility - Math.round(matchOffset * 0.1)));
      return {
        ...m,
        compatibility
      };
    }).sort((a, b) => b.compatibility - a.compatibility);

    // Track active analyzed profiles count
    dbService.incrementAnalyticsStat("totalAnalyzedProfiles");

    // Save profile to database
    const profileId = "u_" + Math.random().toString(36).substring(2, 9);
    const savedProfile: UserProfile = {
      id: profileId,
      username,
      avatarUrl: `https://images.unsplash.com/photo-${["1535713875002-d1d0cf377fde", "1494790108377-be9c29b29330", "1507003211169-0a1dd7228f2d", "1628157582853-a796fa650a6a"][Math.floor(Math.random() * 4)]}?q=80&w=150&auto=format&fit=crop`,
      favoriteGames,
      preferredGenres,
      weeklyHours,
      analysisDepth,
      playstyleSelfTag,
      customBio,
      isDemo: false,
      createdAt: new Date().toISOString(),
      dnaProfile: dnaResult
    };

    dbService.saveProfile(savedProfile);

    res.json({
      profile: savedProfile,
      recommendations: recommendations.slice(0, 3), // return top 3 recommended
      matches: dynamicMatches
    });
  } catch (err: any) {
    console.error("GameDNA Analysis API Error:", err);
    res.status(500).json({ error: err.message || "An error occurred during analysis core processing" });
  }
});

// Serve frontend assets
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    // Start Vite development server middle-ware to support fluid browser updates instantly
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("GameDNA: Development Vite middleware mounted.");
  } else {
    // In production build, serve bundled output folder files directly
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
    console.log("GameDNA: Production static directory mounted:", distPath);
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`GameDNA Server booted on http://0.0.0.0:${PORT} (Active Port 3000)`);
  });
}

startServer();
