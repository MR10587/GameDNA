import fs from "fs";
import path from "path";
import { UserProfile, Game, PlayerMatch, CmsContent, AnalyticsData } from "../types.js";

const DB_FILE = path.join(process.cwd(), "data_gamedna.json");

interface DbStructure {
  users: UserProfile[];
  games: Game[];
  matches: PlayerMatch[];
  cms: CmsContent;
  analytics: AnalyticsData;
}

const DEFAULT_CMS: CmsContent = {
  homePage: {
    tagline: "NEXT-GEN GAMING INTELLIGENCE",
    heroTitle: "Discover Your Gaming DNA",
    heroSubtitle: "Analyze your behavior, unlock your unique playstyle profile, and find games and teammates perfectly synced with your competitive edge.",
    ctaAnalyzeText: "Analyze My Profile",
    ctaDemoText: "View Demo",
    statsCounterProfiles: "50k+",
    statsCounterAccuracy: "98%",
    statsCounterRating: "4.9/5",
    trustHeading: "Engineered for the Elite",
    trustText: "Our AI-driven algorithms digest thousands of gameplay data points to construct a profile that goes beyond simple stats.",
    scienceTitle: "More Than Just a High Score",
    scienceSubtitle: "We analyze reaction times, decision patterns, and spatial awareness to build a digital twin of your gaming subconscious. Whether you're a casual player or an aspiring pro, GameDNA provides the roadmap to your peak performance.",
    scienceBullet1: "Privacy-first data processing protocol",
    scienceBullet2: "Used by top eSports analysts globally",
    scienceBullet3: "Cross-platform support (PC, Console, Mobile)"
  },
  seoSettings: {
    metaTitle: "GameDNA - Discovery Your Gaming Playstyle DNA & Squadmates",
    metaDescription: "GameDNA uses machine learning to decode your gaming habits, map your gaming personality, recommend perfect titles, and connect you with compatible squadmates.",
    urlSlug: "game-dna-intel"
  },
  recWeights: {
    genreMatchWeight: 0.40,
    playstyleWeight: 0.40,
    hoursWeight: 0.20,
    matchingSensitivity: 0.85
  }
};

const DEFAULT_GAMES: Game[] = [
  {
    id: "g1",
    name: "Apex Legends",
    genre: "FPS",
    tags: ["Battle Royale", "High Mobility", "Team Squads", "FPS"],
    playstyleAttributes: { aggression: 90, strategy: 65, teamwork: 75 },
    description: "Fast-paced free-to-play battle royale game where legendary characters with powerful abilities team up to battle for fame and fortune.",
    imageUrl: "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=600&auto=format&fit=crop"
  },
  {
    id: "g2",
    name: "Valorant",
    genre: "Strategy",
    tags: ["Tactical Shooter", "Patience", "Precision", "Team Coordination"],
    playstyleAttributes: { aggression: 60, strategy: 88, teamwork: 90 },
    description: "A 5v5 character-based tactical shooter where precise gunplay meets unique agent abilities. Highly strategic and team-focused.",
    imageUrl: "https://images.unsplash.com/photo-1553481187-be93c21490a9?q=80&w=600&auto=format&fit=crop"
  },
  {
    id: "g3",
    name: "Elden Ring",
    genre: "RPG",
    tags: ["Action RPG", "Soulslike", "Solo Discovery", "Open World"],
    playstyleAttributes: { aggression: 82, strategy: 92, teamwork: 25 },
    description: "An action-filled fantasy RPG where you traverse the Lands Between, study complex boss attack codes, and carve your own path.",
    imageUrl: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?q=80&w=600&auto=format&fit=crop"
  },
  {
    id: "g4",
    name: "League of Legends",
    genre: "MOBA",
    tags: ["MOBA", "Resource Control", "Map Awareness", "Deep Strategy"],
    playstyleAttributes: { aggression: 75, strategy: 82, teamwork: 95 },
    description: "Team-based video game with over 140 champions to make epic plays. Secure map objectives and execute team coordination to break the Nexus.",
    imageUrl: "https://images.unsplash.com/photo-1560253023-3ec5d502959f?q=80&w=600&auto=format&fit=crop"
  },
  {
    id: "g5",
    name: "Counter-Strike 2",
    genre: "FPS",
    tags: ["Tactical FPS", "Map Control", "Economy Management", "Classic Shooter"],
    playstyleAttributes: { aggression: 70, strategy: 85, teamwork: 88 },
    description: "The absolute gold standard of objective-based shooter gameplay. Strategize economy spending and execute smokes with perfect communication.",
    imageUrl: "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?q=80&w=600&auto=format&fit=crop"
  },
  {
    id: "g6",
    name: "The Witcher 3: Wild Hunt",
    genre: "RPG",
    tags: ["Story Driven", "Exploration", "Monster Hunting", "Narrative"],
    playstyleAttributes: { aggression: 55, strategy: 75, teamwork: 10 },
    description: "Explore a massive dark-fantasy world, formulate potion prep strategies, and follow the legendary white-haired monster hunter.",
    imageUrl: "https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=600&auto=format&fit=crop"
  },
  {
    id: "g7",
    name: "Dota 2",
    genre: "MOBA",
    tags: ["Hardcore Strategy", "MOBA", "Deep Mechanics", "Team Coordination"],
    playstyleAttributes: { aggression: 65, strategy: 95, teamwork: 98 },
    description: "A highly complex multiplayer online battle arena. Extremely steep learning curve; rewards tactical synchronization and map discipline.",
    imageUrl: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=600&auto=format&fit=crop"
  },
  {
    id: "g8",
    name: "Cyberpunk 2077",
    genre: "RPG",
    tags: ["Action RPG", "Cyberpunk", "High Mobility", "Solo Campaign"],
    playstyleAttributes: { aggression: 85, strategy: 60, teamwork: 15 },
    description: "Immerse yourself in Night City as a customized mercenary. Build high-mobility stealth or heavy assault characters with specialized tech.",
    imageUrl: "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=600&auto=format&fit=crop"
  }
];

const DEFAULT_MATCHES: PlayerMatch[] = [
  {
    userId: "m1",
    username: "WraithMain99",
    avatarUrl: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=150&auto=format&fit=crop",
    personalityName: "SHADOW ASSASSIN",
    compatibility: 96,
    playstyleLabels: ["Aggressive", "High Mobility", "Close Combat"],
    synergyExplanation: "They push aggressively, acting as the ultimate entry fragger while you orchestrate high-level strategies."
  },
  {
    userId: "m2",
    username: "Tactical_Tim",
    avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=150&auto=format&fit=crop",
    personalityName: "MASTER STRATEGIST",
    compatibility: 91,
    playstyleLabels: ["Tactical", "Shot Caller", "Objective Focused"],
    synergyExplanation: "Features exceptional communication synchronization. Tim coordinates structural layouts while you execute clutch strikes."
  },
  {
    userId: "m3",
    username: "Nova_Queen",
    avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=150&auto=format&fit=crop",
    personalityName: "ENTRY FRAGGER",
    compatibility: 88,
    playstyleLabels: ["High Voltage", "#ClutchQueen", "Hyper Active"],
    synergyExplanation: "Perfect for aggressive frontlines. They draw fire and disrupt enemy formations, allowing you clean follow-up targets."
  },
  {
    userId: "m4",
    username: "CyberRonin",
    avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=150&auto=format&fit=crop",
    personalityName: "HYBRID SNIPER",
    compatibility: 84,
    playstyleLabels: ["Support Combat", "Patience", "Map Spotter"],
    synergyExplanation: "Provides defensive and scout support. Holds back angles while you execute tactical mid-range actions."
  },
  {
    userId: "m5",
    username: "AstraGamer",
    avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=150&auto=format&fit=crop",
    personalityName: "SUPPORT MINDSET",
    compatibility: 79,
    playstyleLabels: ["Healer", "Patience", "Resource Giver"],
    synergyExplanation: "Keeps you supplied and patched up, giving you maximum uptime during long battle cycles."
  }
];

const DEFAULT_USERS: UserProfile[] = [
  {
    id: "u_demo_fps",
    username: "ApexPredator",
    avatarUrl: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=150&auto=format&fit=crop",
    favoriteGames: [{ name: "Apex Legends", hours: 450 }, { name: "Counter-Strike 2", hours: 1200 }],
    preferredGenres: ["FPS", "MOBA"],
    weeklyHours: 25,
    analysisDepth: "Neural Decryption",
    playstyleSelfTag: "aggressive",
    customBio: "Always push, look for high-tempo fights, active team strategist.",
    isDemo: true,
    createdAt: new Date().toISOString(),
    dnaProfile: {
      personalityName: "THE TACTICAL AGGRESSOR",
      description: "You thrive in high-pressure combat scenarios where quick reflexes meet strategic positioning. Your DNA suggests a preference for high-risk, high-reward plays that disrupt enemy formations.",
      metrics: { aggression: 88, strategy: 72, teamwork: 65 },
      badges: ["#HighMobility", "#ShotCaller", "#ClutchKing"],
      analysisReliability: 99.2,
      competitiveTier: "Level 3",
      generatedAt: new Date().toISOString()
    }
  },
  {
    id: "u_demo_casual",
    username: "CozyLlama",
    avatarUrl: "https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=150&auto=format&fit=crop",
    favoriteGames: [{ name: "The Witcher 3: Wild Hunt", hours: 120 }],
    preferredGenres: ["RPG", "Simulation"],
    weeklyHours: 5,
    analysisDepth: "Standard",
    playstyleSelfTag: "support",
    customBio: "Just looking to relax after work and dive deep into beautiful lore.",
    isDemo: true,
    createdAt: new Date().toISOString(),
    dnaProfile: {
      personalityName: "COZY EXPLORER",
      description: "You enjoy rich worldbuilding, immersive solo environments, and low-stress mechanics where the journey is the primary reward.",
      metrics: { aggression: 15, strategy: 68, teamwork: 40 },
      badges: ["#LoreSeeker", "#CozyVibes", "#PatienceMaster"],
      analysisReliability: 91.5,
      competitiveTier: "Casual Explorer",
      generatedAt: new Date().toISOString()
    }
  },
  {
    id: "u_demo_comp",
    username: "VanguardSovereign",
    avatarUrl: "https://images.unsplash.com/photo-1628157582853-a796fa650a6a?q=80&w=150&auto=format&fit=crop",
    favoriteGames: [{ name: "Valorant", hours: 950 }, { name: "Dota 2", hours: 820 }],
    preferredGenres: ["Strategy", "MOBA"],
    weeklyHours: 42,
    analysisDepth: "Quantum Synthesis",
    playstyleSelfTag: "tactical",
    customBio: "Competitive play only. Detail-oriented on map calls and timing windows.",
    isDemo: true,
    createdAt: new Date().toISOString(),
    dnaProfile: {
      personalityName: "TACTICAL MASTERMIND",
      description: "You analyze maps like search grids, coordinate utility deployments in advance, and act as a critical team shot-caller.",
      metrics: { aggression: 50, strategy: 96, teamwork: 94 },
      badges: ["#UtilityKing", "#ShotCaller", "#CalculatedPlay"],
      analysisReliability: 99.8,
      competitiveTier: "Level 5 Diamond",
      generatedAt: new Date().toISOString()
    }
  }
];

const DEFAULT_ANALYTICS: AnalyticsData = {
  totalAnalyzedProfiles: 48912,
  activeSessions: 182,
  successfulMatchups: 1542,
  recClicksCount: { "Apex Legends": 242, "Valorant": 198, "Elden Ring": 115 },
  mostRecommendedGames: [
    { name: "Valorant", count: 2405 },
    { name: "Apex Legends", count: 1985 },
    { name: "Elden Ring", count: 1450 }
  ]
};

function readDb(): DbStructure {
  if (!fs.existsSync(DB_FILE)) {
    const initialDb: DbStructure = {
      users: DEFAULT_USERS,
      games: DEFAULT_GAMES,
      matches: DEFAULT_MATCHES,
      cms: DEFAULT_CMS,
      analytics: DEFAULT_ANALYTICS,
    };
    fs.writeFileSync(DB_FILE, JSON.stringify(initialDb, null, 2), "utf8");
    return initialDb;
  }
  try {
    const data = fs.readFileSync(DB_FILE, "utf8");
    return JSON.parse(data);
  } catch (err) {
    console.error("Error reading JSON DB, rebuilding defaults:", err);
    return {
      users: DEFAULT_USERS,
      games: DEFAULT_GAMES,
      matches: DEFAULT_MATCHES,
      cms: DEFAULT_CMS,
      analytics: DEFAULT_ANALYTICS,
    };
  }
}

function writeDb(db: DbStructure) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), "utf8");
  } catch (err) {
    console.error("Error writing to JSON DB:", err);
  }
}

export const dbService = {
  // CMS Content
  getCms: (): CmsContent => {
    return readDb().cms;
  },
  updateCms: (cms: Partial<CmsContent>): CmsContent => {
    const db = readDb();
    db.cms = { ...db.cms, ...cms };
    writeDb(db);
    return db.cms;
  },

  // Games
  getGames: (): Game[] => {
    return readDb().games;
  },
  addGame: (game: Omit<Game, "id">): Game => {
    const db = readDb();
    const newGame: Game = {
      ...game,
      id: "g_" + Math.random().toString(36).substring(2, 9)
    };
    db.games.push(newGame);
    writeDb(db);
    return newGame;
  },
  updateGame: (id: string, updatedGame: Partial<Game>): Game | null => {
    const db = readDb();
    const idx = db.games.findIndex(g => g.id === id);
    if (idx === -1) return null;
    db.games[idx] = { ...db.games[idx], ...updatedGame };
    writeDb(db);
    return db.games[idx];
  },
  deleteGame: (id: string): boolean => {
    const db = readDb();
    const initialLen = db.games.length;
    db.games = db.games.filter(g => g.id !== id);
    writeDb(db);
    return db.games.length < initialLen;
  },

  // Users / Profiles
  getUsers: (): UserProfile[] => {
    return readDb().users;
  },
  getUser: (id: string): UserProfile | null => {
    const db = readDb();
    return db.users.find(u => u.id === id) || null;
  },
  saveProfile: (profile: UserProfile): UserProfile => {
    const db = readDb();
    const idx = db.users.findIndex(u => u.id === profile.id);
    if (idx !== -1) {
      db.users[idx] = profile;
    } else {
      db.users.push(profile);
    }
    writeDb(db);
    return profile;
  },
  deleteUser: (id: string): boolean => {
    const db = readDb();
    const initialLen = db.users.length;
    db.users = db.users.filter(u => u.id !== id);
    writeDb(db);
    return db.users.length < initialLen;
  },

  // Matches Pool
  getMatches: (): PlayerMatch[] => {
    return readDb().matches;
  },
  addMatchProfile: (match: PlayerMatch): PlayerMatch => {
    const db = readDb();
    db.matches.push(match);
    writeDb(db);
    return match;
  },

  // Analytics
  getAnalytics: (): AnalyticsData => {
    const db = readDb();
    return db.analytics;
  },
  incrementAnalyticsStat: (key: "totalAnalyzedProfiles" | "activeSessions" | "successfulMatchups") => {
    const db = readDb();
    db.analytics[key]++;
    writeDb(db);
  },
  trackRecClick: (gameName: string) => {
    const db = readDb();
    if (!db.analytics.recClicksCount) {
      db.analytics.recClicksCount = {};
    }
    db.analytics.recClicksCount[gameName] = (db.analytics.recClicksCount[gameName] || 0) + 1;
    writeDb(db);
  }
};
