import React, { useState, useEffect } from "react";
import { 
  Cpu, Sliders, Database, Trash2, Edit2, Check, 
  BarChart, Layers, Globe, Users, PlusSquare
} from "lucide-react";
import { CmsContent, Game, UserProfile } from "../types";

interface CmsAdminDashboardProps {
  cms: CmsContent;
  onSaveCms: (updatedCms: CmsContent) => void;
  gameLibrary: Game[];
  onAddGame: (game: Omit<Game, "id">) => void;
  onUpdateGame: (id: string, game: Partial<Game>) => void;
  onDeleteGame: (id: string) => void;
  profiles: UserProfile[];
  onDeleteProfile: (id: string) => void;
}

type AdminTab = "analytics" | "cms" | "seo" | "weights" | "profiles" | "games";

export default function CmsAdminDashboard({
  cms,
  onSaveCms,
  gameLibrary,
  onAddGame,
  onUpdateGame,
  onDeleteGame,
  profiles,
  onDeleteProfile
}: CmsAdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<AdminTab>("analytics");
  const [analytics, setAnalytics] = useState<any>(null);
  
  // CMS state
  const [hpTagline, sHpTagline] = useState(cms.homePage.tagline);
  const [hpHeroTitle, sHpHeroTitle] = useState(cms.homePage.heroTitle);
  const [hpHeroSubtitle, sHpHeroSubtitle] = useState(cms.homePage.heroSubtitle);
  const [hpTrustHeading, sHpTrustHeading] = useState(cms.homePage.trustHeading);
  const [hpTrustText, sHpTrustText] = useState(cms.homePage.trustText);
  const [hpScienceTitle, sHpScienceTitle] = useState(cms.homePage.scienceTitle);
  const [hpScienceSubtitle, sHpScienceSubtitle] = useState(cms.homePage.scienceSubtitle);

  // SEO state
  const [seoMetaTitle, sSeoMetaTitle] = useState(cms.seoSettings.metaTitle);
  const [seoMetaDesc, sSeoMetaDesc] = useState(cms.seoSettings.metaDescription);
  const [seoUrlSlug, sSeoUrlSlug] = useState(cms.seoSettings.urlSlug);

  // Weights state
  const [wGenre, sWGenre] = useState<number>(cms.recWeights.genreMatchWeight);
  const [wPlaystyle, sWPlaystyle] = useState<number>(cms.recWeights.playstyleWeight);
  const [wHours, sWHours] = useState<number>(cms.recWeights.hoursWeight);
  const [wSensitivity, sWSensitivity] = useState<number>(cms.recWeights.matchingSensitivity);

  // New Game Library State
  const [newGameName, setNewGameName] = useState("");
  const [newGameGenre, setNewGameGenre] = useState("FPS");
  const [newGameAgg, setNewGameAgg] = useState<number>(70);
  const [newGameStrat, setNewGameStrat] = useState<number>(70);
  const [newGameTeam, setNewGameTeam] = useState<number>(70);
  const [newGameDesc, setNewGameDesc] = useState("");
  const [newGameImageUrl, setNewGameImageUrl] = useState("");
  const [editingGameId, setEditingGameId] = useState<string | null>(null);

  // General Notification
  const [notif, setNotif] = useState<string | null>(null);

  const fetchAnalytics = async () => {
    try {
      const res = await fetch("/api/analytics");
      if (res.ok) {
        const data = await res.json();
        setAnalytics(data);
      }
    } catch (err) {
      console.error("Error fetching admin stats:", err);
    }
  };

  useEffect(() => {
    fetchAnalytics();
    const interval = setInterval(fetchAnalytics, 15000);
    return () => clearInterval(interval);
  }, []);

  const triggerNotif = (msg: string) => {
    setNotif(msg);
    setTimeout(() => setNotif(null), 3500);
  };

  const handleSaveCmsConfig = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: CmsContent = {
      ...cms,
      homePage: {
        ...cms.homePage,
        tagline: hpTagline,
        heroTitle: hpHeroTitle,
        heroSubtitle: hpHeroSubtitle,
        trustHeading: hpTrustHeading,
        trustText: hpTrustText,
        scienceTitle: hpScienceTitle,
        scienceSubtitle: hpScienceSubtitle
      }
    };
    onSaveCms(updated);
    triggerNotif("CMS HOMEPAGE COPY UPDATED SUCCESSFUL ✓");
  };

  const handleSaveSeoConfig = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: CmsContent = {
      ...cms,
      seoSettings: {
        metaTitle: seoMetaTitle,
        metaDescription: seoMetaDesc,
        urlSlug: seoUrlSlug
      }
    };
    onSaveCms(updated);
    triggerNotif("SEO METADATA & OG DATA SAVED SUCCESSFUL ✓");
  };

  const handleSaveAlgorithmWeights = (e: React.FormEvent) => {
    e.preventDefault();
    const total = wGenre + wPlaystyle + wHours;
    const normGenre = Number((wGenre / total).toFixed(2));
    const normPlaystyle = Number((wPlaystyle / total).toFixed(2));
    const normHours = Number((wHours / total).toFixed(2));

    const updated: CmsContent = {
      ...cms,
      recWeights: {
        genreMatchWeight: normGenre,
        playstyleWeight: normPlaystyle,
        hoursWeight: normHours,
        matchingSensitivity: wSensitivity
      }
    };
    onSaveCms(updated);
    
    sWGenre(normGenre);
    sWPlaystyle(normPlaystyle);
    sWHours(normHours);

    triggerNotif("MATHEMATICAL ALGORITHM WEIGHTS NORMALIZED ✓");
  };

  const handleAddOrEditGame = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGameName.trim() || !newGameDesc.trim()) {
      alert("Missing required fields for game registration");
      return;
    }

    const payload = {
      name: newGameName,
      genre: newGameGenre,
      tags: [newGameGenre, newGameAgg > 75 ? "Aggressive" : "Tactical", "Database Added"],
      playstyleAttributes: {
        aggression: newGameAgg,
        strategy: newGameStrat,
        teamwork: newGameTeam
      },
      description: newGameDesc,
      imageUrl: newGameImageUrl || "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=400&auto=format&fit=crop"
    };

    if (editingGameId) {
      onUpdateGame(editingGameId, payload);
      triggerNotif(`UPDATED GAME: ${newGameName.toUpperCase()}`);
      setEditingGameId(null);
    } else {
      onAddGame(payload);
      triggerNotif(`ADDED GAME: ${newGameName.toUpperCase()}`);
    }

    setNewGameName("");
    setNewGameDesc("");
    setNewGameImageUrl("");
  };

  return (
    <div className="min-h-screen bg-[#0a0b10] text-white py-12 px-4 md:px-8 relative select-none">
      <div className="mx-auto max-w-7xl">
        
        {/* Header Summary Tab rows */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border-b border-white/5 pb-8 mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full border border-purple-500/30 bg-purple-953/10 px-3 py-1 text-[10px] text-purple-400 font-mono tracking-widest uppercase mb-3 font-bold">
              <Cpu className="h-3.5 w-3.5 animate-pulse" />
              ADMINISTRATIVE CORE PANEL v4 // READ ONLY ACTIVE
            </div>
            <h1 className="font-sans text-2xl md:text-3xl font-black text-white uppercase tracking-wider">
              GAMEDNA <span className="text-purple-455 text-purple-400 font-mono font-bold">// CONTROL CORE</span>
            </h1>
            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mt-1">
              Live algorithmic weights, CMS content managers, library records, and player analytics monitors.
            </p>
          </div>

          {/* Quick Notification Capsule */}
          {notif && (
            <div className="rounded-xl border border-green-500/20 bg-green-950/20 px-4 py-2.5 text-[10px] text-green-400 font-mono flex items-center gap-2 animate-bounce uppercase font-bold tracking-widest">
              <Check className="h-4 w-4 shrink-0" />
              {notif}
            </div>
          )}
        </div>

        {/* Dashboard Grid split sidebar */}
        <div className="grid gap-8 lg:grid-cols-12 items-start">
          
          {/* LEFT: Sidebar Navigation Tabs */}
          <div className="lg:col-span-3 flex flex-col gap-2 bg-[#0a0b10] border border-white/5 rounded-2xl p-4 shadow-xl">
            
            <button
              onClick={() => setActiveTab("analytics")}
              className={`flex items-center gap-2.5 w-full text-left px-4 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition cursor-pointer border ${
                activeTab === "analytics" ? "bg-purple-600 border-purple-500 text-white shadow-lg" : "text-slate-400 hover:bg-white/5 border-transparent"
              }`}
            >
              <BarChart className="h-4 w-4" />
              ANALYTICS & TRAFFIC
            </button>

            <button
              onClick={() => setActiveTab("cms")}
              className={`flex items-center gap-2.5 w-full text-left px-4 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition cursor-pointer border ${
                activeTab === "cms" ? "bg-purple-600 border-purple-500 text-white shadow-lg" : "text-slate-400 hover:bg-white/5 border-transparent"
              }`}
            >
              <Layers className="h-4 w-4" />
              HOMEPAGE COPY EDIT
            </button>

            <button
              onClick={() => setActiveTab("seo")}
              className={`flex items-center gap-2.5 w-full text-left px-4 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition cursor-pointer border ${
                activeTab === "seo" ? "bg-purple-600 border-purple-500 text-white shadow-lg" : "text-slate-400 hover:bg-white/5 border-transparent"
              }`}
            >
              <Globe className="h-4 w-4" />
              SEO & ROUTING SLUGS
            </button>

            <button
              onClick={() => setActiveTab("weights")}
              className={`flex items-center gap-2.5 w-full text-left px-4 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition cursor-pointer border ${
                activeTab === "weights" ? "bg-purple-600 border-purple-500 text-white shadow-lg" : "text-slate-400 hover:bg-white/5 border-transparent"
              }`}
            >
              <Sliders className="h-4 w-4" />
              ALGORITHM MUTATORS
            </button>

            <button
              onClick={() => setActiveTab("profiles")}
              className={`flex items-center gap-2.5 w-full text-left px-4 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition cursor-pointer border ${
                activeTab === "profiles" ? "bg-purple-600 border-purple-500 text-white shadow-lg" : "text-slate-400 hover:bg-white/5 border-transparent"
              }`}
            >
              <Users className="h-4 w-4" />
              PLAYER PROFILES
            </button>

            <button
              onClick={() => setActiveTab("games")}
              className={`flex items-center gap-2.5 w-full text-left px-4 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition cursor-pointer border ${
                activeTab === "games" ? "bg-purple-600 border-purple-500 text-white shadow-lg" : "text-slate-400 hover:bg-white/5 border-transparent"
              }`}
            >
              <Database className="h-4 w-4" />
              GAMES DATABASE
            </button>

          </div>

          {/* RIGHT: Active Config Panel (9 cols) */}
          <div className="lg:col-span-9 glass-effect rounded-3xl p-6 md:p-8 shadow-2xl border border-white/5 relative">
            
            {/* TAB 1: Real-time Analytics Dashboard */}
            {activeTab === "analytics" && (
              <div id="admin-analytics-view" className="flex flex-col gap-6 uppercase font-semibold">
                <div>
                  <h3 className="font-sans text-[9px] uppercase tracking-widest text-cyan-400 font-mono font-bold">REAL-TIME PLATFORM LOGS</h3>
                  <h2 className="font-sans text-lg font-black text-white mt-1">ANALYTICS SYSTEM MONITOR</h2>
                </div>

                {/* Counter row cards */}
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="bg-[#0a0b10] border border-white/5 rounded-2xl p-4 shadow-md">
                    <span className="text-[8px] text-slate-500 uppercase tracking-widest font-mono font-bold">ANALYZED PROFILES</span>
                    <div className="font-mono text-xl font-black text-white mt-1.5">
                      {analytics ? analytics.totalAnalyzedProfiles : "0"}
                    </div>
                  </div>

                  <div className="bg-[#0a0b10] border border-white/5 rounded-2xl p-4 shadow-md">
                    <span className="text-[8px] text-slate-500 uppercase tracking-widest font-mono font-bold">ACTIVE DEPLOYED KERNELS</span>
                    <div className="font-mono text-xl font-black text-cyan-400 mt-1.5">
                      {analytics ? analytics.activeSessions : "0"}
                    </div>
                  </div>

                  <div className="bg-[#0a0b10] border border-white/5 rounded-2xl p-4 shadow-md">
                    <span className="text-[8px] text-slate-500 uppercase tracking-widest font-mono font-bold">SUCCESSFUL MATCHNAMES</span>
                    <div className="font-mono text-xl font-black text-purple-400 mt-1.5">
                      {analytics ? analytics.successfulMatchups : "0"}
                    </div>
                  </div>
                </div>

                {/* Recommended Games counting splits */}
                <div className="mt-4 bg-[#0a0b10]/60 border border-white/5 rounded-2xl p-5 shadow-inner">
                  <h4 className="text-[9px] font-bold font-mono uppercase text-slate-400 border-b border-white/5 pb-3 mb-4 tracking-widest">
                    RECOMMENDATION DISPATCH FREQUENCIES
                  </h4>
                  
                  <div className="flex flex-col gap-4 font-mono">
                    {analytics && analytics.mostRecommendedGames ? (
                      analytics.mostRecommendedGames.map((game: any, idx: number) => {
                        const percents = [100, 75, 45, 30, 20];
                        const countPercent = percents[idx] || 15;
                        return (
                          <div key={game.name}>
                            <div className="flex justify-between items-center text-[10px] mb-1.5 font-bold">
                              <span className="font-sans font-black text-slate-300">{game.name.toUpperCase()}</span>
                              <span className="text-slate-550 font-bold">{game.count} RECOMMENDATION HITS</span>
                            </div>
                            <div className="h-1.5 w-full bg-[#0a0b10] rounded-full overflow-hidden border border-white/5">
                              <div
                                style={{ width: `${Math.max(10, countPercent)}%` }}
                                className="bg-gradient-to-r from-purple-600 to-cyan-400 h-full rounded-full shadow-[0_0_8px_#3b82f6]"
                              />
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <span className="text-[10px] text-slate-500 italic tracking-widest font-bold">NO TELEMETRY RECORDED REGISTRY IN DEV.</span>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: Homepage General CMS Content */}
            {activeTab === "cms" && (
              <form onSubmit={handleSaveCmsConfig} className="flex flex-col gap-6 uppercase font-semibold">
                <div>
                  <h3 className="font-sans text-[9px] uppercase tracking-widest text-cyan-400 font-mono font-bold">FRONTEND SECTION EDITORIAL</h3>
                  <h2 className="font-sans text-lg font-black text-white mt-1">CMS HOME CONFIGURATION</h2>
                </div>

                <div className="grid gap-5">
                  <div>
                    <label className="block text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-2 font-mono">TAGLINE ANNOUNCEMENT BAR</label>
                    <input
                      type="text"
                      value={hpTagline}
                      onChange={(e) => sHpTagline(e.target.value)}
                      className="w-full bg-[#0a0b10] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-400 font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-2 font-mono">HERO BIG HEADER TITLE</label>
                    <input
                      type="text"
                      value={hpHeroTitle}
                      onChange={(e) => sHpHeroTitle(e.target.value)}
                      className="w-full bg-[#0a0b10] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-400 font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-2 font-mono">HERO PARAGRAPH SUMMARY DESC</label>
                    <textarea
                      value={hpHeroSubtitle}
                      onChange={(e) => sHpHeroSubtitle(e.target.value)}
                      className="w-full h-22 bg-[#0a0b10] border border-white/10 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-cyan-400 leading-relaxed resize-none font-semibold uppercase"
                    />
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label className="block text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-2 font-mono">TRUST ACCREDITATION HEADER</label>
                      <input
                        type="text"
                        value={hpTrustHeading}
                        onChange={(e) => sHpTrustHeading(e.target.value)}
                        className="w-full bg-[#0a0b10] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-400 font-semibold"
                      />
                    </div>
                    <div>
                      <label className="block text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-2 font-mono">SCIENCE TITLE LAYOUT</label>
                      <input
                        type="text"
                        value={hpScienceTitle}
                        onChange={(e) => sHpScienceTitle(e.target.value)}
                        className="w-full bg-[#0a0b10] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-400 font-semibold"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-2 font-mono">TRUST METHODOLOGY EXPLAINER</label>
                    <textarea
                      value={hpTrustText}
                      onChange={(e) => sHpTrustText(e.target.value)}
                      className="w-full h-18 bg-[#0a0b10] border border-white/10 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-cyan-400 leading-relaxed resize-none font-semibold uppercase"
                    />
                  </div>
                </div>

                <div className="mt-4 border-t border-white/5 pt-5 flex justify-end">
                  <button
                    type="submit"
                    className="rounded-xl bg-purple-650 bg-purple-650 bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-[10px] tracking-widest px-6 py-3 transition uppercase shadow-md cursor-pointer border border-purple-500"
                  >
                    DEPLOY COPY UPDATES
                  </button>
                </div>
              </form>
            )}

            {/* TAB 3: SEO OpenGraph Meta Settings */}
            {activeTab === "seo" && (
              <form onSubmit={handleSaveSeoConfig} className="flex flex-col gap-6 uppercase font-semibold">
                <div>
                  <h3 className="font-sans text-[9px] uppercase tracking-widest text-purple-400 font-mono font-bold">SEARCH ENGINE OPTIMIZATIONS</h3>
                  <h2 className="font-sans text-lg font-black text-white mt-1">META DATA CONTROL PANEL</h2>
                </div>

                <div className="grid gap-5">
                  <div>
                    <label className="block text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-2 font-mono">CANONICAL TITLE SPEC</label>
                    <input
                      type="text"
                      value={seoMetaTitle}
                      onChange={(e) => sSeoMetaTitle(e.target.value)}
                      className="w-full bg-[#0a0b10] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-400 font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-2 font-mono">OPENGRAPH VALUE SUMMARY</label>
                    <textarea
                      value={seoMetaDesc}
                      onChange={(e) => sSeoMetaDesc(e.target.value)}
                      className="w-full h-24 bg-[#0a0b10] border border-white/10 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-cyan-400 leading-relaxed resize-none font-semibold uppercase"
                    />
                  </div>

                  <div>
                    <label className="block text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-2 font-mono">CANONICAL SECURE SLUG ROUTE</label>
                    <input
                      type="text"
                      value={seoUrlSlug}
                      onChange={(e) => sSeoUrlSlug(e.target.value)}
                      className="w-full bg-[#0a0b10] border border-white/10 rounded-xl px-4 py-2.5 text-xs font-mono text-purple-400 focus:outline-none font-bold"
                    />
                  </div>
                </div>

                <div className="mt-4 border-t border-white/5 pt-5 flex justify-end">
                  <button
                    type="submit"
                    className="rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-[10px] tracking-widest px-6 py-3 transition uppercase shadow-md cursor-pointer border border-purple-550"
                  >
                    SAVE SEO DEPLOYMENTS
                  </button>
                </div>
              </form>
            )}

            {/* TAB 4: Scoring Weights sliders */}
            {activeTab === "weights" && (
              <form onSubmit={handleSaveAlgorithmWeights} className="flex flex-col gap-6 uppercase font-semibold">
                <div>
                  <h3 className="font-sans text-[9px] uppercase tracking-widest text-cyan-400 font-mono font-bold">ALGORITHMS PARAMETER TUNER</h3>
                  <h2 className="font-sans text-lg font-black text-white mt-1">WEIGHT MULTIPLIER REGULATOR</h2>
                  <p className="text-[10px] text-slate-500 leading-normal mt-1 border-b border-white/5 pb-4 uppercase tracking-wider font-bold">
                    Tweak importance ratios of matching algorithm metrics. Weights will normalize automatically.
                  </p>
                </div>

                <div className="flex flex-col gap-5 mt-2">
                  
                  {/* Weight 1 */}
                  <div>
                    <div className="flex justify-between items-center text-[10px] font-mono mb-1.5 font-bold">
                      <span className="text-slate-450 uppercase tracking-widest">GENE MATCH RATIO WEIGHT</span>
                      <span className="text-cyan-400">{Math.round(wGenre * 100)}%</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="100"
                      value={Math.round(wGenre * 100)}
                      onChange={(e) => sWGenre(parseInt(e.target.value) / 100)}
                      className="w-full h-1 bg-[#0a0b10] appearance-none accent-cyan-400 rounded-lg"
                    />
                  </div>

                  {/* Weight 2 */}
                  <div>
                    <div className="flex justify-between items-center text-[10px] font-mono mb-1.5 font-bold">
                      <span className="text-slate-455 uppercase tracking-widest">PLAYSTYLE SPECTRUM WEIGHT</span>
                      <span className="text-purple-400">{Math.round(wPlaystyle * 100)}%</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="100"
                      value={Math.round(wPlaystyle * 100)}
                      onChange={(e) => sWPlaystyle(parseInt(e.target.value) / 100)}
                      className="w-full h-1 bg-[#0a0b10] appearance-none accent-purple-500 rounded-lg"
                    />
                  </div>

                  {/* Weight 3 */}
                  <div>
                    <div className="flex justify-between items-center text-[10px] font-mono mb-1.5 font-bold">
                      <span className="text-slate-455 uppercase tracking-widest">HOURS BIAS COMPENSATOR</span>
                      <span className="text-slate-300">{Math.round(wHours * 100)}%</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="100"
                      value={Math.round(wHours * 100)}
                      onChange={(e) => sWHours(parseInt(e.target.value) / 100)}
                      className="w-full h-1 bg-[#0a0b10] appearance-none accent-slate-300 rounded-lg"
                    />
                  </div>

                  <hr className="border-white/5 my-2" />

                  {/* Sensitivity */}
                  <div>
                    <div className="flex justify-between items-center text-[10px] font-mono mb-1.5 font-bold">
                      <span className="text-slate-455 uppercase tracking-widest">TEAMMATE HARMONIC SENSITIVITY</span>
                      <span className="text-pink-400">{Math.round(wSensitivity * 100)}% ACCURACY</span>
                    </div>
                    <input
                      type="range"
                      min="50"
                      max="100"
                      value={Math.round(wSensitivity * 100)}
                      onChange={(e) => sWSensitivity(parseInt(e.target.value) / 100)}
                      className="w-full h-1 bg-[#0a0b10] appearance-none accent-pink-550 rounded-lg"
                    />
                    <p className="text-[9px] text-slate-550 mt-2 italic leading-normal">
                      Adjusts teammate search tolerance grids. Lower sensitivity expands discovery match ranges.
                    </p>
                  </div>

                </div>

                <div className="mt-4 border-t border-white/5 pt-5 flex justify-end">
                  <button
                    type="submit"
                    className="rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-[10px] tracking-widest px-6 py-3 transition uppercase shadow-md cursor-pointer border border-purple-500"
                  >
                    NORMALIZE & COMMIT
                  </button>
                </div>
              </form>
            )}

            {/* TAB 5: Player Profiles User Manager */}
            {activeTab === "profiles" && (
              <div className="flex flex-col gap-6 uppercase font-semibold">
                <div>
                  <h3 className="font-sans text-[9px] uppercase tracking-widest text-purple-400 font-mono font-bold">DURABLE PROFILE DATABASE LOGS</h3>
                  <h2 className="font-sans text-lg font-black text-white mt-1">USER RECORDS MANAGER</h2>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-[11px] text-slate-300">
                    <thead className="bg-[#0a0b10] font-mono font-extrabold text-slate-500 uppercase tracking-widest border-b border-white/5">
                      <tr>
                        <th className="px-4 py-3">PLAYER AVATAR</th>
                        <th className="px-4 py-3">NICKNAME</th>
                        <th className="px-4 py-3">GENE PROFILE</th>
                        <th className="px-4 py-3">STATUS CODE</th>
                        <th className="px-4 py-3 text-right">PURGE ACTIONS</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {profiles.map(user => (
                        <tr key={user.id} className="hover:bg-white/5 transition-all">
                          <td className="px-4 py-3 shrink-0">
                            <img src={user.avatarUrl} className="h-8 w-8 rounded-full object-cover border border-white/10" />
                          </td>
                          <td className="px-4 py-3 font-bold text-slate-200">{user.username.toUpperCase()}</td>
                          <td className="px-4 py-3 font-mono text-cyan-400 text-[10px] font-bold">
                            {user.dnaProfile ? user.dnaProfile.personalityName.toUpperCase() : "SWEEPING DEPLOY..."}
                          </td>
                          <td className="px-4 py-3">
                            {user.isDemo ? (
                              <span className="bg-purple-500/15 text-purple-400 font-black px-2 py-0.5 rounded border border-purple-500/20 text-[8px] tracking-wide">DEMO SET // v4</span>
                            ) : (
                              <span className="bg-cyan-500/15 text-cyan-400 font-black px-2 py-0.5 rounded border border-cyan-500/20 text-[8px] tracking-wide">PRODUCTION // LIVE</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <button
                              onClick={() => {
                                onDeleteProfile(user.id);
                                triggerNotif(`PURGED PROFILE: ${user.username.toUpperCase()}`);
                              }}
                              className="text-red-400 hover:text-red-500 p-2 hover:bg-red-500/10 rounded-lg transition cursor-pointer"
                              title="Delete profile record"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB 6: Game Library Manager (Create/Edit games) */}
            {activeTab === "games" && (
              <div className="flex flex-col gap-6 uppercase font-semibold">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div>
                    <h3 className="font-sans text-[9px] uppercase tracking-widest text-cyan-400 font-mono font-bold">RECOMMENDATION DATASET INDEX</h3>
                    <h2 className="font-sans text-lg font-black text-white mt-1">MATRIX CATALOG REGISTRY</h2>
                  </div>
                  
                  {editingGameId && (
                    <button
                      onClick={() => {
                        setEditingGameId(null);
                        setNewGameName("");
                        setNewGameDesc("");
                      }}
                      className="bg-white/5 hover:bg-white/15 text-slate-400 hover:text-white px-2.5 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-wider cursor-pointer border border-white/10"
                    >
                      Clear Edit Mode
                    </button>
                  )}
                </div>

                {/* Game Builder/Editor Form */}
                <form onSubmit={handleAddOrEditGame} className="bg-[#0a0b10] border border-white/5 rounded-2xl p-5 grid gap-4 shadow-2xl">
                  <h4 className="text-[9px] font-bold font-mono text-cyan-400 uppercase flex items-center gap-1.5 mb-2 tracking-widest">
                    <PlusSquare className="h-4 w-4 animate-bounce" />
                    {editingGameId ? "MODIFY RECS MATRIX SPECIFICATION" : "REGISTER DATABASE MATRIX TITLE"}
                  </h4>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="block text-[8px] uppercase font-mono text-slate-500 mb-2 font-bold tracking-widest">GAME METADATA TITLE</label>
                      <input
                        type="text"
                        placeholder="e.g. WITCHER III, CHORROS..."
                        value={newGameName}
                        onChange={(e) => setNewGameName(e.target.value)}
                        className="w-full bg-[#0a0b10] border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none font-semibold uppercase"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-[8px] uppercase font-mono text-slate-500 mb-2 font-bold tracking-widest">GENRE SPECTRUM CODE</label>
                      <select
                        value={newGameGenre}
                        onChange={(e) => setNewGameGenre(e.target.value)}
                        className="w-full bg-[#0a0b10] border border-white/10 rounded-xl px-3 py-2.5 text-xs text-slate-300 focus:outline-none font-bold uppercase"
                      >
                        <option value="FPS">Tactical FPS</option>
                        <option value="RPG">Action RPG / Adventure</option>
                        <option value="Strategy">Strategic Layout</option>
                        <option value="MOBA">MOBA Arena</option>
                        <option value="Simulation">Simulation</option>
                      </select>
                    </div>
                  </div>

                  {/* Playstyle Dimension adjustments inside builder */}
                  <div className="grid gap-4 sm:grid-cols-3 bg-[#0a0b10]/40 border border-white/5 rounded-xl p-3 shadow-inner">
                    
                    <div>
                      <div className="flex justify-between text-[8px] font-mono text-rose-400 mb-2 font-extrabold tracking-widest">
                        <span>AGGRESSION FREQ</span>
                        <span>{newGameAgg}%</span>
                      </div>
                      <input
                        type="range"
                        min="1"
                        max="100"
                        value={newGameAgg}
                        onChange={(e) => setNewGameAgg(parseInt(e.target.value))}
                        className="w-full h-1 bg-[#0a0b10] appearance-none accent-rose-500 rounded-lg"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-[8px] font-mono text-cyan-400 mb-2 font-extrabold tracking-widest">
                        <span>TACTICAL STRAT</span>
                        <span>{newGameStrat}%</span>
                      </div>
                      <input
                        type="range"
                        min="1"
                        max="100"
                        value={newGameStrat}
                        onChange={(e) => setNewGameStrat(parseInt(e.target.value))}
                        className="w-full h-1 bg-[#0a0b10] appearance-none accent-cyan-400 rounded-lg"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-[8px] font-mono text-blue-400 mb-2 font-extrabold tracking-widest">
                        <span>TEAMWORK COHERENCE</span>
                        <span>{newGameTeam}%</span>
                      </div>
                      <input
                        type="range"
                        min="1"
                        max="100"
                        value={newGameTeam}
                        onChange={(e) => setNewGameTeam(parseInt(e.target.value))}
                        className="w-full h-1 bg-[#0a0b10] appearance-none accent-blue-500 rounded-lg"
                      />
                    </div>

                  </div>

                  <div>
                    <label className="block text-[8px] uppercase font-mono text-slate-500 mb-2 font-bold tracking-widest">ALGORITHMIC REPORT DESCRIPTION</label>
                    <input
                      type="text"
                      placeholder="e.g. High precision action parameters meets heroic choices..."
                      value={newGameDesc}
                      onChange={(e) => setNewGameDesc(e.target.value)}
                      className="w-full bg-[#0a0b10] border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none uppercase font-semibold"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[8px] uppercase font-mono text-slate-500 mb-2 font-bold tracking-widest">STATIC IMAGE RELATIVE OR CLOUD URL</label>
                    <input
                      type="text"
                      placeholder="e.g. https://images.unsplash.com/..."
                      value={newGameImageUrl}
                      onChange={(e) => setNewGameImageUrl(e.target.value)}
                      className="w-full bg-[#0a0b10] border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-300 font-mono focus:outline-none font-bold"
                    />
                  </div>

                  <div className="flex justify-end gap-2 mt-2">
                    <button
                      type="submit"
                      className="rounded-xl bg-cyan-500 text-black font-sans font-black text-[10px] tracking-widest px-5 py-3 hover:bg-cyan-400 transition cursor-pointer"
                    >
                      {editingGameId ? "APPLY AMENDMENTS WRITE ✓" : "ENQUEUE NEW INDEX TARGET +"}
                    </button>
                  </div>
                </form>

                {/* Library list scroll panel */}
                <div className="grid gap-3 max-h-[400px] overflow-y-auto pr-2">
                  {gameLibrary.map(g => (
                    <div
                      key={g.id}
                      className="bg-[#0a0b10] border border-white/5 p-4 rounded-xl flex items-center justify-between gap-4 shadow-md hover:border-cyan-500/10 transition-all duration-200"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-extrabold text-xs text-slate-200">{g.name.toUpperCase()}</h4>
                          <span className="bg-[#0a0b10]/80 text-[8px] font-mono uppercase px-1.5 py-0.5 rounded text-cyan-400 font-bold border border-white/5 tracking-wider">
                            {g.genre}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-500 mt-1 line-clamp-1 uppercase tracking-wide font-semibold">{g.description}</p>
                        
                        {/* Playstyle attribute labels */}
                        <div className="flex gap-4 text-[9px] font-mono font-bold mt-2 text-slate-550 border-t border-white/5 pt-1.5 uppercase tracking-widest">
                          <span className="text-red-500/80">AGGRESSION: {g.playstyleAttributes.aggression}%</span>
                          <span className="text-cyan-410 text-cyan-400/80">STRATEGY: {g.playstyleAttributes.strategy}%</span>
                          <span className="text-purple-400">TEAMWORK: {g.playstyleAttributes.teamwork}%</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0 font-bold font-mono">
                        <button
                          onClick={() => {
                            setEditingGameId(g.id);
                            setNewGameName(g.name);
                            setNewGameGenre(g.genre);
                            setNewGameAgg(g.playstyleAttributes.aggression);
                            setNewGameStrat(g.playstyleAttributes.strategy);
                            setNewGameTeam(g.playstyleAttributes.teamwork);
                            setNewGameDesc(g.description);
                            setNewGameImageUrl(g.imageUrl || "");
                            triggerNotif(`MUTATING METADATA: ${g.name.toUpperCase()}`);
                          }}
                          className="text-slate-400 hover:text-white p-2 hover:bg-white/5 rounded-lg transition shrink-0 cursor-pointer border border-white/5"
                          title="Edit dimensions"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            onDeleteGame(g.id);
                            triggerNotif(`DELETED DATABASE REGISTER: ${g.name.toUpperCase()}`);
                          }}
                          className="text-red-400 hover:text-red-500 p-2 hover:bg-red-500/10 rounded-lg transition shrink-0 cursor-pointer border border-white/5"
                          title="Erase title register"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>

        </div>

      </div>
    </div>
  );
}
