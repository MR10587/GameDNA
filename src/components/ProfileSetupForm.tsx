import React, { useState } from "react";
import { Gamepad, Search, Plus, Sliders, Sparkles } from "lucide-react";

interface ProfileSetupFormProps {
  onAnalyze: (formData: any) => void;
  gameLibrary: Array<{ name: string; genre: string }>;
}

export default function ProfileSetupForm({ onAnalyze, gameLibrary }: ProfileSetupFormProps) {
  // Input states
  const [username, setUsername] = useState("");
  const [gameInput, setGameInput] = useState("");
  const [gameHours, setGameHours] = useState<number>(100);
  const [addedGames, setAddedGames] = useState<Array<{ name: string; hours: number }>>([]);
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [weeklyHours, setWeeklyHours] = useState<number>(15);
  const [analysisDepth, setAnalysisDepth] = useState("Neural Decryption");
  const [playstyleSelfTag, setPlaystyleSelfTag] = useState<"aggressive" | "tactical" | "support" | "balanced">("balanced");
  const [customBio, setCustomBio] = useState("");

  // Suggestions filter
  const filteredSuggestions = gameLibrary.filter(
    g => g.name.toLowerCase().includes(gameInput.toLowerCase()) && 
    !addedGames.some(ag => ag.name === g.name)
  );

  const handleAddGame = (gameName: string) => {
    if (!gameName.trim()) return;
    if (addedGames.some(g => g.name.toLowerCase() === gameName.toLowerCase())) return;
    setAddedGames([...addedGames, { name: gameName, hours: gameHours }]);
    setGameInput("");
  };

  const handleRemoveGame = (name: string) => {
    setAddedGames(addedGames.filter(g => g.name !== name));
  };

  const toggleGenre = (genre: string) => {
    if (selectedGenres.includes(genre)) {
      setSelectedGenres(selectedGenres.filter(g => g !== genre));
    } else {
      setSelectedGenres([...selectedGenres, genre]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) {
      alert("Please enter a username to link your DNA sequence.");
      return;
    }
    if (addedGames.length === 0) {
      alert("Please select at least 1 core game to evaluate.");
      return;
    }
    onAnalyze({
      username,
      favoriteGames: addedGames,
      preferredGenres: selectedGenres,
      weeklyHours,
      analysisDepth,
      playstyleSelfTag,
      customBio
    });
  };

  return (
    <div id="form-wrapping" className="min-h-screen bg-[#0a0b10] text-[#e2e8f0] py-12 px-4 md:px-8 relative">
      {/* Background elements */}
      <div className="absolute left-1/3 top-10 pointer-events-none h-64 w-64 rounded-full bg-cyan-500/5 blur-[100px]" />
      <div className="absolute right-1/4 bottom-10 pointer-events-none h-64 w-64 rounded-full bg-purple-500/5 blur-[100px]" />

      <div className="mx-auto max-w-6xl">
        
        {/* Title Header */}
        <div className="text-center mb-12">
          <div className="inline-block rounded-full bg-cyan-500/10 border border-cyan-500/30 px-3 py-1 text-[10px] text-cyan-450 font-mono tracking-widest uppercase mb-3 font-bold">
            STEP 1: SEQUENCING
          </div>
          <h1 className="font-sans text-3xl md:text-4xl font-black uppercase tracking-tight text-white mb-2">
            Configure Your <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">Gaming DNA</span>
          </h1>
          <p className="text-xs text-slate-400 mt-2 max-w-xl mx-auto uppercase tracking-wider font-semibold">
            Provide your playstyle data to initialize the analysis protocol.
          </p>
        </div>

        {/* Master Form & Sidebar layout - Centered */}
        <div id="setup-layout-grid" className="max-w-3xl mx-auto mt-8">
          
          {/* Main Form Panel */}
          <form onSubmit={handleSubmit} className="glass-effect rounded-3xl p-6 md:p-8 shadow-2xl">
            
            <div id="fields-layout-v" className="flex flex-col gap-6">
              
              {/* Field 0: Player Username */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2.5 font-mono">
                  PLAYER IDENTITY / CODENAME
                </label>
                <input
                  id="form-user-input"
                  type="text"
                  placeholder="e.g. ApexPredator, NeonSovereign"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-[#0a0b10] border border-white/10 rounded-xl px-4 py-3 text-slate-100 placeholder-slate-700 focus:outline-none focus:border-cyan-400 transition font-sans text-xs"
                  required
                />
              </div>

              {/* Field 1: Core Titles Search & Hours */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2.5 font-mono flex items-center justify-between">
                  <span>CORE TITLES & HOURS INVESTED</span>
                  <span className="text-[9px] text-cyan-400 uppercase font-semibold italic">click suggestions to add</span>
                </label>

                {/* Sub-inputs row */}
                <div id="game-tagger-row" className="flex flex-col gap-3 sm:flex-row mb-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-500" />
                    <input
                      id="game-input-tagger"
                      type="text"
                      placeholder="Search title (e.g., Elden Ring, Valorant...)"
                      value={gameInput}
                      onChange={(e) => setGameInput(e.target.value)}
                      className="w-full bg-[#0a0b10] border border-white/10 rounded-xl pl-10 pr-4 py-3 text-slate-100 placeholder-slate-700 focus:outline-none focus:border-cyan-400 transition text-xs"
                    />
                    {/* Auto-suggestions list */}
                    {gameInput.trim().length > 0 && filteredSuggestions.length > 0 && (
                      <div className="absolute left-0 right-0 top-full mt-1.5 z-40 bg-[#0a0b10] border border-white/10 rounded-xl overflow-hidden shadow-2xl max-h-48 overflow-y-auto">
                        {filteredSuggestions.map(g => (
                          <button
                            key={g.name}
                            type="button"
                            onClick={() => handleAddGame(g.name)}
                            className="w-full text-left px-4 py-2.5 text-[10px] font-bold uppercase tracking-wider text-slate-300 hover:bg-cyan-500/10 hover:text-cyan-400 hover:pl-5 transition"
                          >
                            + {g.name} ({g.genre})
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 max-w-[170px]">
                    <Sliders className="h-4 w-4 text-slate-550 shrink-0" />
                    <input
                      type="number"
                      placeholder="Hours"
                      value={gameHours}
                      onChange={(e) => setGameHours(Math.max(1, parseInt(e.target.value) || 0))}
                      className="w-full bg-[#0a0b10] border border-white/10 rounded-xl px-3 py-3 text-slate-105 focus:outline-none text-xs text-center font-mono"
                    />
                    <span className="text-[10px] text-slate-500 font-mono font-bold uppercase">HRS</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleAddGame(gameInput)}
                    className="rounded-xl bg-white/5 border border-white/10 text-slate-250 px-5 py-3 hover:bg-cyan-500 hover:text-black font-black text-xs transition uppercase flex items-center justify-center gap-1 shrink-0 cursor-pointer"
                  >
                    <Plus className="h-4 w-4" /> ADD
                  </button>
                </div>

                {/* Added games display list */}
                <div id="added-game-tags-list" className="flex flex-wrap gap-2.5 bg-white/[0.02] border border-white/5 rounded-xl p-3">
                  {addedGames.length === 0 ? (
                    <span className="text-[10px] text-slate-500 italic uppercase tracking-wider font-bold">No games added yet. Enter title detail above to calculate DNA dimensions.</span>
                  ) : (
                    addedGames.map((game) => (
                      <div
                        key={game.name}
                        className="flex items-center gap-2 bg-[#0a0b10] border border-white/5 rounded-lg py-1 px-2.5 text-xs text-slate-200"
                      >
                        <Gamepad className="h-3 w-3 text-cyan-400" />
                        <span className="font-semibold text-slate-300 text-xs">{game.name}</span>
                        <span className="bg-white/5 text-cyan-400 px-1.5 py-0.5 rounded font-mono text-[9px] font-bold">
                          {game.hours}H
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemoveGame(game.name)}
                          className="text-red-400 hover:text-red-500 transition cursor-pointer font-bold ml-1 text-xs"
                        >
                          ×
                        </button>
                      </div>
                    ))
                  )}
                </div>

              </div>

              {/* Field 2: Preferred Genres */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2.5 font-mono">
                  PREFERRED GENRES
                </label>
                <div id="genres-badges-layout" className="flex flex-wrap gap-2.5">
                  {["FPS", "RPG", "Strategy", "MOBA", "Simulation", "Horror", "Sports", "Adventure"].map((genre) => {
                    const active = selectedGenres.includes(genre);
                    return (
                      <button
                        type="button"
                        key={genre}
                        onClick={() => toggleGenre(genre)}
                        className={`px-4 py-2 text-[10px] font-bold uppercase tracking-widest rounded-lg border transition cursor-pointer ${
                          active
                            ? "bg-cyan-500/10 border-cyan-400 text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.15)]"
                            : "bg-[#0a0b10] border-white/10 text-slate-400 hover:text-white"
                        }`}
                      >
                        {genre}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Field 3: Double column hours and depth */}
              <div id="double-inputs-row" className="grid gap-6 md:grid-cols-2">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2.5 font-mono">
                    WEEKLY PLAY TIME
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min="1"
                      max="80"
                      value={weeklyHours}
                      onChange={(e) => setWeeklyHours(parseInt(e.target.value))}
                      className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-cyan-405"
                    />
                    <span className="text-xs font-bold tracking-wider text-cyan-400 font-mono shrink-0 w-16 text-right">
                      {weeklyHours} HRS
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2.5 font-mono">
                    ANALYSIS PROTOCOL DEPTH
                  </label>
                  <select
                    value={analysisDepth}
                    onChange={(e) => setAnalysisDepth(e.target.value)}
                    className="w-full bg-[#0a0b10] border border-white/10 rounded-xl px-3 py-2.5 text-slate-305 text-xs focus:outline-none focus:border-cyan-400 transition font-bold"
                  >
                    <option value="Standard">STANDARD (Fast profiling)</option>
                    <option value="Neural Decryption">NEURAL DECRYPTION (Behavioral checks)</option>
                    <option value="Quantum Synthesis">QUANTUM SYNTHESIS (Deeper alignment)</option>
                  </select>
                </div>
              </div>

              {/* Field 4: Playstyle Tag */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2.5 font-mono">
                  PLAYSTYLE SELF-ASSESSMENT
                </label>
                <div id="playstyle-grid" className="grid grid-cols-2 gap-3 sm:grid-cols-4 font-mono">
                  {[
                    { val: "aggressive", label: "AGGRESSIVE", desc: "Frontline Fragger" },
                    { val: "tactical", label: "TACTICAL", desc: "Strategy Master" },
                    { val: "support", label: "SUPPORT", desc: "Team Protector" },
                    { val: "balanced", label: "BALANCED", desc: "Versatile Flex" }
                  ].map((p) => {
                    const active = playstyleSelfTag === p.val;
                    return (
                      <button
                        type="button"
                        key={p.val}
                        onClick={() => setPlaystyleSelfTag(p.val as any)}
                        className={`p-3 rounded-xl border text-left transition cursor-pointer ${
                          active
                            ? "bg-purple-500/10 border-purple-400 text-purple-300 shadow-[0_0_15px_rgba(168,85,247,0.15)]"
                            : "bg-[#0a0b10] border-white/10 text-slate-400 hover:text-slate-300"
                        }`}
                      >
                        <div className="font-bold text-[10px] uppercase tracking-wider">{p.label}</div>
                        <div className="text-[8px] uppercase tracking-widest text-slate-500 font-bold mt-1 max-w-[120px] overflow-hidden truncate">{p.desc}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Field 5: Bio text */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2.5 font-mono">
                  ADDITIONAL CONTEXT (BIO / FOCUS) - OPTIONAL
                </label>
                <textarea
                  placeholder="e.g. Primarily looking for duo queues in Valorant. I communicate often on discord, prefer tactical pacing."
                  value={customBio}
                  onChange={(e) => setCustomBio(e.target.value)}
                  className="w-full h-20 bg-[#0a0b10] border border-white/10 rounded-xl px-4 py-3 text-slate-100 placeholder-slate-800 transition text-xs font-semibold leading-relaxed resize-none focus:outline-none focus:border-cyan-400"
                />
              </div>

              {/* Button Action */}
              <div id="submit-action-panel" className="mt-4 border-t border-white/5 pt-6">
                <button
                  id="btn-trigger-analysis"
                  type="submit"
                  className="w-full py-4 bg-cyan-500 text-black font-black text-xs rounded-xl hover:bg-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.4)] transition-all uppercase tracking-tighter flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Sparkles className="h-4 w-4 text-black animate-pulse" />
                  BEGIN DNA ANALYSIS PROTOCOL
                </button>
                <p className="text-center text-[9px] text-slate-500 uppercase tracking-widest font-mono font-bold mt-3">
                  By proceeding, you agree to our <span className="text-cyan-400 underline cursor-pointer">Protocol Privacy Standards</span>.
                </p>
              </div>

            </div>

          </form>

        </div>

      </div>
    </div>
  );
}
