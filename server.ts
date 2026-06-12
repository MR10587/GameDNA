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
        console.log(`GameDNA AI Core: Model ${model} check status (${attempt}/2)`);
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
  analysisDepth: string,
  customBio: string = ""
): DnaProfile {
  // 1. Calculate weighted metrics from library games
  const gamesLib = dbService.getGames();
  let aggression = 50;
  let strategy = 50;
  let teamwork = 50;

  // Let's copy favorite games to avoid mutating inputs
  const blendedGames = [...favoriteGames];

  // If there's a custom bio, check if they write common game names and hours inside it!
  const bioLower = (customBio || "").toLowerCase();
  
  // Custom parsing for games & hours directly specified in the prompt/bio
  const csMatch = bioLower.match(/(cs|counter[\s-]*strike|cs2)\s*(\d+)?/i);
  if (csMatch && !blendedGames.some(g => g.name.toLowerCase().includes("cs") || g.name.toLowerCase().includes("counter"))) {
    const hours = csMatch[2] ? parseInt(csMatch[2]) : 100;
    blendedGames.push({ name: "Counter-Strike 2", hours });
  }

  const valMatch = bioLower.match(/(valorant|val)\s*(\d+)?/i);
  if (valMatch && !blendedGames.some(g => g.name.toLowerCase().includes("val"))) {
    const hours = valMatch[2] ? parseInt(valMatch[2]) : 30;
    blendedGames.push({ name: "Valorant", hours });
  }

  const apexMatch = bioLower.match(/(apex|legends)\s*(\d+)?/i);
  if (apexMatch && !blendedGames.some(g => g.name.toLowerCase().includes("apex"))) {
    const hours = apexMatch[2] ? parseInt(apexMatch[2]) : 50;
    blendedGames.push({ name: "Apex Legends", hours });
  }

  let totalWeight = 0;
  blendedGames.forEach(fav => {
    const match = gamesLib.find(g => g.name.toLowerCase() === fav.name.toLowerCase() || fav.name.toLowerCase().includes(g.name.toLowerCase()));
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

  // Adjust metrics based on semantic keywords in bio (like "headshot", "reflex", "reaksiya")
  const isHeadshot = bioLower.includes("headshot") || bioLower.includes("aim") || bioLower.includes("precision");
  const isFastReflex = bioLower.includes("reaksiya") || bioLower.includes("reflex") || bioLower.includes("suret") || bioLower.includes("speed");
  const isTacticalKeyword = bioLower.includes("taktik") || bioLower.includes("tactical") || bioLower.includes("plan") || bioLower.includes("strategy");

  if (isHeadshot) {
    aggression = Math.min(100, aggression + 15);
    strategy = Math.min(100, strategy + 10);
  }
  if (isFastReflex) {
    aggression = Math.min(100, aggression + 20);
  }
  if (isTacticalKeyword) {
    strategy = Math.min(100, strategy + 18);
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

  // Language Detection
  const isAzOrTr = /oynamisam|saat|yaxsidir|suretli|reaksiya|gucludur|biler|hassas|oyun|hedshot/i.test(bioLower);

  // 3. Define Game Personality Name & Badges
  let personalityName = "BALANCED TEAM PLAYER";
  let description = isAzOrTr 
    ? "Siz rəqabətli oyunlarda komandanızın boşluqlarını doldura bilən, rəqibin gedişlərinə uyğunlaşan və oyun ritmini tarazlı saxlayan çoxşaxəli bir oyunçusunuz."
    : "You are a versatile gaming presence, filling gaps dynamically in your squad and responding with measured force.";
  let badges: string[] = ["#TacticalFlex", "#AllRounder", "#Adaptable"];
  let competitiveTier = "Level 2 Sentinel";

  if (isHeadshot || isFastReflex || (aggression > 75 && strategy > 65)) {
    personalityName = isHeadshot ? "ELITE SHARPSHOOTER (HEADSHOT MASTER)" : "THE TACTICAL AGGRESSOR";
    description = isAzOrTr
      ? `Sizin profiliniz yüksək reaksiya sürəti, "headshot master" hədəfləmə dəqiqliyi və sürətli qarşıdurma qabiliyyətini göstərir. Sürətli reflex və hassasiyet gücü sayəsində rəqabətədavamlı FPS oyunlarında rəqiblərinizə üstünlük qazanırsınız.`
      : `You thrive in high-pressure combat scenarios where quick reflexes meet strategic positioning. Your DNA suggests a preference for ultra-precise aiming, fast reflex actions, and clutch entries.`;
    badges = isHeadshot ? ["#HeadshotMaster", "#LaserAim", "#ClutchKing"] : ["#HighMobility", "#ShotCaller", "#ClutchKing"];
    competitiveTier = isHeadshot ? "Level 4 Celestial marksman" : "Level 3 Gladiator";
  } else if (aggression > 78 && teamwork < 45) {
    personalityName = "HYPER-AGGRESSIVE DUELISTS";
    description = isAzOrTr
      ? "Siz döyüş meydanında əsl fırtınasınız. Sürətli təkbətək qarşıdurmaları üstün tutur, komanda oyunundan çox öz fərdi bacarıqlarınıza və sürətli frag qazanmağa güvənirsiniz."
      : "You are an absolute storm on the battlefield. You prioritize high-speed solo dynamic encounters, trading safety for rapid frag count progression.";
    badges = ["#RawAim", "#SpeedDemon", "#SoloCarrier"];
    competitiveTier = "Level 4 Vanguard";
  } else if (strategy > 78 && teamwork > 70) {
    personalityName = "TACTICAL MASTERMIND";
    description = isAzOrTr
      ? "Siz hər bir oyuna şahmat məsələsi kimi yanaşırsınız. Xəritə nəzarəti, taktiki üstünlüklər koordinasiyası və komandanın mövqe nizamlanması sizin güclü tərəfinizdir."
      : "You approach every matches like a chess puzzle. You prioritize pre-match setups, map utility structures, and guiding team spacing logic.";
    badges = ["#MapArchitect", "#ShotCaller", "#UtilitySovereign"];
    competitiveTier = "Level 5 Diamond Commander";
  } else if (teamwork > 80 && aggression < 55) {
    personalityName = "ALTRUISTIC GUARDIAN";
    description = isAzOrTr
      ? "Hər bir elit komandanın əvəzolunmaz dayağı. Sizin əsas diqqətiniz komanda yoldaşlarının çıxışlarını sığortalamaq, dəstək mövqeyi tutmaq və oyunu qazanmaqdır."
      : "The ultimate backbone of any elite squad. Your priority lies block-filtering alerts, backing teammate exits, and pacing recovery mechanics.";
    badges = ["#HealBotGod", "#GuardianShield", "#FlawlessSynergy"];
    competitiveTier = "Level 3 Protector";
  }

  const analysisReliability = Number((94.5 + Math.random() * 5.3).toFixed(1));

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

// Helper function to map a game name/genre to a high-quality relevant Unsplash image
function getGameImageUrl(name: string, genre: string): string {
  const normName = name.toLowerCase();
  if (normName.includes("apex")) {
    return "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=600&auto=format&fit=crop";
  }
  if (normName.includes("valorant")) {
    return "https://images.unsplash.com/photo-1553481187-be93c21490a9?q=80&w=600&auto=format&fit=crop";
  }
  if (normName.includes("elden") || normName.includes("souls") || normName.includes("ring")) {
    return "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?q=80&w=600&auto=format&fit=crop";
  }
  if (normName.includes("league") || normName.includes("lol") || normName.includes("dota") || normName.includes("moba")) {
    return "https://images.unsplash.com/photo-1560253023-3ec5d502959f?q=80&w=600&auto=format&fit=crop";
  }
  if (normName.includes("counter") || normName.includes("cs") || normName.includes("cs2") || normName.includes("strike") || normName.includes("global offensive")) {
    return "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?q=80&w=600&auto=format&fit=crop";
  }
  if (normName.includes("witcher")) {
    return "https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=600&auto=format&fit=crop";
  }
  if (normName.includes("cyberpunk")) {
    return "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=600&auto=format&fit=crop";
  }
  
  // Genre fallback paths
  const normGenre = (genre || "").toLowerCase();
  if (normGenre.includes("fps") || normGenre.includes("shooter") || normGenre.includes("aksiyon")) {
    return "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?q=80&w=600&auto=format&fit=crop";
  }
  if (normGenre.includes("rpg") || normGenre.includes("role") || normGenre.includes("rol")) {
    return "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?q=80&w=600&auto=format&fit=crop";
  }
  if (normGenre.includes("strategy") || normGenre.includes("rts") || normGenre.includes("strategiya")) {
    return "https://images.unsplash.com/photo-1553481187-be93c21490a9?q=80&w=600&auto=format&fit=crop";
  }
  
  // Generic eSports banner
  return "https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=600&auto=format&fit=crop";
}

// API: DECODE GAMING DNA (CORE FLOW)
app.post("/api/analyze", async (req, res) => {
  try {
    const { username, favoriteGames, preferredGenres, weeklyHours, analysisDepth, playstyleSelfTag, customBio } = req.body;

    if (!username || !favoriteGames || !preferredGenres) {
      return res.status(400).json({ error: "Missing required profile setup details" });
    }

    let dnaResult: DnaProfile;
    let recommendations: GameRecommendation[] = [];

    if (ai) {
      console.log("GameDNA AI Core: Generating analysis and dynamic recommendations via Gemini.");
      const favoriteGamesText = favoriteGames.map((g: any) => `${g.name} (${g.hours} hours)`).join(", ");
      const prompt = `
        You are the GameDNA quantum-neuromorphic analyzer core.
        Provide a professional gaming playstyle DNA profile and exactly 3 AI-personalized game recommendations for:
        - Username: ${username}
        - Favorite Games of active record: ${favoriteGamesText}
        - Preferred Genres: ${preferredGenres.join(", ")}
        - Hours played weekly: ${weeklyHours}
        - Self-declared playstyle Tag: ${playstyleSelfTag}
        - Requested scanning depth: ${analysisDepth}
        ${customBio ? `- Player Bio details or focus traits: "${customBio}"` : ""}

        Analyze their gaming habits, active hours, self-declared tag, and especially any detailed context in their custom bio.
        For example, if they specify tactical preferences like "headshot master", "precision aiming", "fast reaction speed", "close combat", "stealth", or "speedrunner", use this to deeply influence their DNA personality division and exactly the 3 game recommendations.

        You must recommend exactly 3 real, popular video games (e.g., Counter-Strike 2, Apex Legends, Valorant, Elden Ring, Team Fortress 2, Overwatch 2, Doom Eternal, Destiny 2, Cyberpunk 2077, etc.) that would match this profile.
        The "whyRecommended" field for each game should be personalized, explaining how it fits their specific aiming traits, reflex speed, play hours, or preferred pace mentioned in their bio or playstyle tag. If they write in Turkish/Azerbaijani (or any other language/custom prompt style) in their bio, feel free to adapt the "whyRecommended" text or write it in an engaging style.

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
          "competitiveTier": "An impressive tier rating, e.g., Level 3 Vanguard or Sentinel",
          "aiRecommendations": [
            {
              "name": "Game Title",
              "genre": "Short genre, e.g. FPS, RPG, Strategy, MOBA",
              "matchPercentage": number from 40 to 99,
              "whyRecommended": "Fully-personalized explanation highlighting how it maps to their favorite games history, reflexes, precision, hours, and bio traits."
            }
          ]
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
                competitiveTier: { type: Type.STRING },
                aiRecommendations: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      name: { type: Type.STRING },
                      genre: { type: Type.STRING },
                      matchPercentage: { type: Type.INTEGER },
                      whyRecommended: { type: Type.STRING }
                    },
                    required: ["name", "genre", "matchPercentage", "whyRecommended"]
                  }
                }
              },
              required: ["personalityName", "description", "metrics", "badges", "analysisReliability", "competitiveTier", "aiRecommendations"]
            }
          }
        });

        const textOutput = response.text;
        if (textOutput) {
          const parsed = JSON.parse(textOutput.trim());
          dnaResult = {
            personalityName: parsed.personalityName,
            description: parsed.description,
            metrics: parsed.metrics,
            badges: parsed.badges,
            analysisReliability: parsed.analysisReliability,
            competitiveTier: parsed.competitiveTier,
            generatedAt: new Date().toISOString()
          };

          const aiRecsList = parsed.aiRecommendations || [];
          recommendations = aiRecsList.map((rec: any) => ({
            id: "rec_" + Math.random().toString(36).substring(2, 9),
            name: rec.name,
            genre: rec.genre || "Action",
            matchPercentage: rec.matchPercentage || 95,
            whyRecommended: rec.whyRecommended,
            imageUrl: getGameImageUrl(rec.name, rec.genre)
          }));

          console.log("GameDNA AI Core: Profile and AI recommendations generated successfully!");
        } else {
          throw new Error("Empty text reply received from Gemini");
        }
      } catch (gem_err) {
        console.log("AI Core status: falling back to standard profiling engine.");
        dnaResult = runRuleBasedDnaAnalysis(favoriteGames, preferredGenres, playstyleSelfTag, analysisDepth, customBio);
      }
    } else {
      console.log("GameDNA Core: Running standard profiling engine.");
      dnaResult = runRuleBasedDnaAnalysis(favoriteGames, preferredGenres, playstyleSelfTag, analysisDepth, customBio);
    }

    // Fallback: If AI is not loaded or failed to produce recommendations list, run the rules-based calculator
    if (recommendations.length === 0) {
      const weights = dbService.getCms().recWeights;
      const gamesLib = dbService.getGames();
      const bioTextLower = (customBio || "").toLowerCase();
      const isAzOrTrInFallback = /oynamisam|saat|yaxsidir|suretli|reaksiya|gucludur|biler|hassas|oyun|hedshot/i.test(bioTextLower);

      // Extract CS hours
      let extractedCsHours = 100;
      const csHoursMatch = bioTextLower.match(/(?:cs|counter[\s-]*strike|cs2)\s*(\d+)/i);
      if (csHoursMatch) {
         extractedCsHours = parseInt(csHoursMatch[1]);
      } else {
         const csFav = favoriteGames.find((g: any) => g.name.toLowerCase().includes("cs") || g.name.toLowerCase().includes("counter"));
         if (csFav) extractedCsHours = csFav.hours;
      }

      // Extract Valorant hours
      let extractedValHours = 30;
      const valHoursMatch = bioTextLower.match(/(?:valorant|val)\s*(\d+)/i);
      if (valHoursMatch) {
         extractedValHours = parseInt(valHoursMatch[1]);
      } else {
         const valFav = favoriteGames.find((g: any) => g.name.toLowerCase().includes("val"));
         if (valFav) extractedValHours = valFav.hours;
      }

      const calculatedRecs: GameRecommendation[] = gamesLib.map(game => {
        let genreMatch = preferredGenres.some((g: string) => game.genre.toLowerCase() === g.toLowerCase()) ? 100 : 30;
        
        const aggressionDiff = Math.abs(dnaResult.metrics.aggression - game.playstyleAttributes.aggression);
        const strategyDiff = Math.abs(dnaResult.metrics.strategy - game.playstyleAttributes.strategy);
        const teamworkDiff = Math.abs(dnaResult.metrics.teamwork - game.playstyleAttributes.teamwork);
        const playstyleMatch = Math.max(20, 100 - (aggressionDiff + strategyDiff + teamworkDiff) / 3);

        const rawMatch = (genreMatch * weights.genreMatchWeight) + (playstyleMatch * weights.playstyleWeight) + (85 * weights.hoursWeight);
        const matchPercentage = Math.round(Math.min(99, Math.max(40, rawMatch)));

        let whyRecommended = `Complements your unique ${dnaResult.personalityName.toLowerCase()} attributes.`;
        const normalizedGameName = game.name.toLowerCase();

        if (isAzOrTrInFallback) {
          if ((normalizedGameName.includes("cs") || normalizedGameName.includes("counter"))) {
            whyRecommended = `CS-dəki ${extractedCsHours} saatlıq təcrübəniz və hədəfləmə dəqiqliyiniz (headshot master) rəqabətədavamlı CS2-də sizə mütləq üstünlük qazandırır. Reaksiya sürətiniz və yüksək hassasiyetiniz ilə fərqlənəcəksiniz.`;
          } else if (normalizedGameName.includes("valorant")) {
            whyRecommended = `Qeyd etdiyiniz ${extractedValHours} saatlıq Valorant təcrübəniz, güclü həssaslıq (hassasiyet) və sürətli reaksiya tələb edən agent idarəetməsi üçün tam uyğundur.`;
          } else if (game.genre === "FPS" && (bioTextLower.includes("reaksiya") || bioTextLower.includes("reflex") || bioTextLower.includes("suretli"))) {
            whyRecommended = `Bu yüksək templi oyun sizin sürətli aksiya reaksiyanız, güclü hassasiyet səviyyəniz və headshot master imkanlarınızla tam uyğunlaşır.`;
          } else if (game.genre === "FPS" && dnaResult.metrics.aggression > 70) {
            whyRecommended = `Mükəmməl reaksiya sürətiniz və sürətli oyun oynama bacarığınız bu dinamik nişangah döyüşlərində sizə böyük üstünlük verəcək.`;
          } else if (game.genre === "Strategy" && dnaResult.metrics.strategy > 70) {
            whyRecommended = `Sizin yüksək dərəcəli taktiki təfəkkürünüzü və planlı oyun ritminizi dərindən dəstəkləyir.`;
          } else if (game.playstyleAttributes.teamwork > 80 && dnaResult.metrics.teamwork > 70) {
            whyRecommended = `Sizin komanda oyunu fokusunuza və əməkdaşlıq fəaliyyətinizə tam dəstək verir.`;
          } else {
            whyRecommended = `Sizin unikal ${dnaResult.personalityName.toLowerCase()} fərdi profili və xüsusiyyətlərinizə mükəmməl şəkildə uyğun gəlir.`;
          }
        } else {
          // English Fallback
          if ((normalizedGameName.includes("cs") || normalizedGameName.includes("counter"))) {
            whyRecommended = `Your ${extractedCsHours} hours of CS experience and "headshot master" traits with high sensitivity align flawlessly with CS2's matchmaking dynamics.`;
          } else if (normalizedGameName.includes("valorant")) {
            whyRecommended = `With ${extractedValHours} hours of Valorant in your belt, your micro-aim adjustments and reaction speed will shine in elite brackets.`;
          } else if (game.genre === "FPS" && (bioTextLower.includes("reflex") || bioTextLower.includes("speed") || bioTextLower.includes("fast"))) {
            whyRecommended = `This fast-paced FPS maps directly to your custom reaction speed and "headshot master" twitch tracking.`;
          } else if (game.genre === "FPS" && dnaResult.metrics.aggression > 70) {
            whyRecommended = `Matches your intense movement-based FPS style, fast reflexes, and customized sensitivity layouts.`;
          } else if (game.genre === "Strategy" && dnaResult.metrics.strategy > 70) {
            whyRecommended = `Aligns with your calculated setups, map blueprints, and macro strategy coordinates.`;
          }
        }

        return {
          id: game.id,
          name: game.name,
          genre: game.genre,
          matchPercentage: game.genre === "FPS" && (bioTextLower.includes("cs") || bioTextLower.includes("valorant")) ? Math.min(99, matchPercentage + 15) : matchPercentage,
          whyRecommended,
          imageUrl: game.imageUrl
        };
      }).sort((a, b) => b.matchPercentage - a.matchPercentage);

      recommendations = calculatedRecs.slice(0, 3);
    }

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
