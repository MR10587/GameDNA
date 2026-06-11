import { useState } from "react";
import { GameRecommendation, Game } from "../types";
import { Check, ThumbsUp, ThumbsDown, Library, Film, ExternalLink } from "lucide-react";

interface RecommendationsViewProps {
  recommendations: GameRecommendation[];
  allGames: Game[];
  onTrackClick: (gameName: string) => void;
}

export default function RecommendationsView({ recommendations, allGames, onTrackClick }: RecommendationsViewProps) {
  const [showLibrary, setShowLibrary] = useState(false);
  const [feedback, setFeedback] = useState<Record<string, "yes" | "no">>({});
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("All");

  const handleFeedback = (gameId: string, value: "yes" | "no") => {
    setFeedback(prev => ({ ...prev, [gameId]: value }));
  };

  const handleRecClick = (name: string) => {
    onTrackClick(name);
  };

  // Filtered games inside the full library modal
  const filteredLibrary = allGames.filter(game => {
    const matchesSearch = game.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          game.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesGenre = selectedGenre === "All" || game.genre === selectedGenre;
    return matchesSearch && matchesGenre;
  });

  return (
    <div id="recs-wrapping-div" className="mt-8 relative select-none">
      
      {/* Header section with View Library link trigger */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-sans text-lg font-black tracking-widest text-white flex items-center gap-2 uppercase">
            <span className="flex h-2.5 w-2.5 rounded-full bg-cyan-500 animate-pulse" />
            Curated DNA Recommendations
          </h2>
          <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-widest font-bold">
            Algorithmic maps matched dynamically with your cognitive gaming parameters.
          </p>
        </div>
        
        <button
          onClick={() => setShowLibrary(true)}
          className="text-[10px] text-cyan-405 text-cyan-400 font-extrabold tracking-widest flex items-center gap-1 hover:text-cyan-300 transition uppercase cursor-pointer"
        >
          <Library className="h-3.5 w-3.5 animate-pulse" />
          View All Library &gt;
        </button>
      </div>

      {/* Grid of 3 Recommendations cards */}
      <div id="recs-cards-grid" className="grid gap-6 md:grid-cols-3">
        {recommendations.slice(0, 3).map((rec) => {
          const gameFeedback = feedback[rec.id];

          return (
            <div
              key={rec.id}
              onClick={() => handleRecClick(rec.name)}
              className="group glass-effect rounded-3xl overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_4px_25px_rgba(6,182,212,0.15)] flex flex-col justify-between cursor-pointer border border-white/5"
            >
              <div>
                {/* Visual Image container with Match indicator */}
                <div className="relative h-44 overflow-hidden bg-[#0d0e14]">
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0a0b10] via-transparent to-transparent z-10" />
                  
                  {rec.imageUrl ? (
                    <img
                      referrerPolicy="no-referrer"
                      src={rec.imageUrl}
                      alt={rec.name}
                      className="w-full h-full object-cover transition duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-[#0d0e14] text-slate-800">
                      <Film className="h-10 w-10" />
                    </div>
                  )}

                  {/* Absolute Badge */}
                  <span className="absolute top-3 right-3 z-20 rounded-full bg-cyan-500 text-slate-950 font-mono text-[9px] font-black tracking-widest px-2.5 py-1 uppercase">
                    {rec.matchPercentage}% MATCH
                  </span>
                </div>

                {/* Info Text */}
                <div className="p-5">
                  <div className="text-[9px] text-cyan-400 uppercase font-black tracking-widest font-mono">
                    {rec.genre === "FPS" ? "TACTICAL FPS" : rec.genre === "RPG" ? "ACTION RPG" : rec.genre === "MOBA" ? "MOBA ARENA" : rec.genre.toUpperCase()}
                  </div>
                  <h3 className="font-sans text-sm font-black text-white mt-1.5 flex items-center gap-1.5 justify-between uppercase tracking-wide">
                    <span>{rec.name}</span>
                    <ExternalLink className="h-3.5 w-3.5 text-slate-600 group-hover:text-cyan-400 transition" />
                  </h3>
                  
                  <div id="rec-why-explainer" className="mt-4 bg-[#0a0b10]/80 border border-white/5 rounded-xl p-3.5 text-xs leading-relaxed text-slate-400 relative">
                    <span className="text-cyan-400 font-bold block mb-1 uppercase text-[9px] tracking-widest font-mono">Why:</span>
                    &ldquo;{rec.whyRecommended}&rdquo;
                  </div>
                </div>
              </div>

              {/* Lower Feedback button row */}
              <div id="card-fb-row" className="px-5 pb-5 pt-3 border-t border-white/5 flex items-center justify-between text-[10px] text-slate-500 uppercase font-bold tracking-wider font-mono">
                <span>Accurate recommendation?</span>
                
                <div className="flex items-center gap-2">
                  {gameFeedback ? (
                    <span className="text-green-400 font-extrabold flex items-center gap-1 animate-pulse">
                      <Check className="h-3 w-3" /> RECORDED
                    </span>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleFeedback(rec.id, "yes");
                        }}
                        className="bg-[#0a0b10] hover:bg-white/10 p-1.5 rounded-lg text-emerald-400/80 hover:text-emerald-400 transition cursor-pointer border border-white/10"
                        title="Yes, highly accurate"
                      >
                        <ThumbsUp className="h-3 w-3" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleFeedback(rec.id, "no");
                        }}
                        className="bg-[#0a0b10] hover:bg-white/10 p-1.5 rounded-lg text-rose-400 transition cursor-pointer border border-white/10"
                        title="No, not my style"
                      >
                        <ThumbsDown className="h-3 w-3" />
                      </button>
                    </>
                  )}
                </div>
              </div>

            </div>
          );
        })}
      </div>

      {/* FULL LIBRARY VIEW MODAL */}
      {showLibrary && (
        <div className="fixed inset-0 z-50 bg-[#0a0b10]/95 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-effect rounded-3xl w-full max-w-4xl max-h-[85vh] overflow-hidden shadow-2xl flex flex-col justify-between border border-white/10">
            
            {/* Modal header */}
            <div className="p-6 border-b border-white/5 flex items-center justify-between">
              <div>
                <h3 className="font-sans text-lg font-black text-white flex items-center gap-2 uppercase tracking-wide">
                  <Library className="h-4 w-4 text-cyan-400 animate-pulse" />
                  GAMEDNA CENTRAL HABITS DATABASE
                </h3>
                <p className="text-[10px] text-slate-500 mt-1 uppercase tracking-wider font-bold">Explore all compiled metadata metrics and playstyle parameters.</p>
              </div>
              <button
                onClick={() => setShowLibrary(false)}
                className="bg-white/5 hover:bg-white/15 text-slate-350 hover:text-white px-3.5 py-1.5 rounded-xl text-[10px] font-bold tracking-widest transition uppercase cursor-pointer border border-white/10"
              >
                Close Library
              </button>
            </div>

            {/* Filters panel inside modal */}
            <div className="bg-[#0a0b10]/80 p-4 border-b border-white/5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              
              {/* Search */}
              <input
                type="text"
                placeholder="Search database (e.g. Valorant, RPG...)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-[#0a0b10] border border-white/10 rounded-xl px-4 py-2 text-xs text-slate-100 placeholder-slate-700 w-full sm:max-w-xs focus:outline-none focus:border-cyan-400 font-bold"
              />

              {/* Genre Filters badges */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 font-mono font-bold">
                {["All", "FPS", "RPG", "Strategy", "MOBA"].map(gen => (
                  <button
                    key={gen}
                    onClick={() => setSelectedGenre(gen)}
                    className={`px-3 py-1.5 rounded-lg text-[9px] uppercase tracking-widest border transition shrink-0 cursor-pointer ${
                      selectedGenre === gen
                        ? "bg-cyan-500 text-slate-950 border-cyan-400"
                        : "bg-[#0a0b10] border-white/10 text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    {gen}
                  </button>
                ))}
              </div>

            </div>

            {/* Games grid list inside modal */}
            <div className="flex-1 overflow-y-auto p-6 bg-[#0a0b10]/20">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {filteredLibrary.map(game => (
                  <div
                    key={game.id}
                    onClick={() => handleRecClick(game.name)}
                    className="bg-[#0a0b10] border border-white/5 rounded-2xl p-4 flex items-start gap-3.5 hover:border-cyan-500/20 cursor-pointer hover:bg-[#0a0b10]/70 transition-all duration-200"
                  >
                    {game.imageUrl && (
                      <img
                        referrerPolicy="no-referrer"
                        src={game.imageUrl}
                        alt={game.name}
                        className="h-12 w-12 rounded-xl object-cover border border-white/5 shrink-0"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="font-bold text-xs text-slate-200 truncate uppercase tracking-wider">{game.name}</h4>
                        <span className="text-[8px] px-1.5 py-0.5 rounded bg-white/5 text-cyan-400 font-mono font-bold shrink-0 uppercase tracking-widest">
                          {game.genre}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-500 line-clamp-2 mt-1 uppercase tracking-wide font-semibold">{game.description}</p>
                      
                      {/* Playstyle weights indicator bar */}
                      <div className="flex gap-2.5 mt-2.5 text-[8px] font-mono text-slate-400 font-bold border-t border-white/5 pt-1.5 uppercase tracking-widest">
                        <span className="text-red-500">AGG: {game.playstyleAttributes.aggression}%</span>
                        <span className="text-cyan-400">STR: {game.playstyleAttributes.strategy}%</span>
                        <span className="text-purple-400">TEM: {game.playstyleAttributes.teamwork}%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {filteredLibrary.length === 0 && (
                <div className="text-center py-12 text-slate-500 text-[10px] font-bold uppercase tracking-widest italic">
                  No games found matching search parameters. Modify filters or add new titles in the Admin CMS!
                </div>
              )}
            </div>

            {/* Modal footer info */}
            <div className="p-4 bg-[#0a0b10] border-t border-white/5 text-center text-[8px] text-slate-500 uppercase tracking-widest font-mono font-bold mb-1">
              TOTAL DATABASE TITLES LOADED: {allGames.length} // OPERATIONS ACTIVE UNDER SECURE THEME PROTOCOLS
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
