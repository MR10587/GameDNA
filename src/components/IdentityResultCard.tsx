import { Award, RefreshCw, BarChart3, ShieldCheck } from "lucide-react";
import { UserProfile } from "../types";

interface IdentityResultCardProps {
  profile: UserProfile;
  onReset: () => void;
}

export default function IdentityResultCard({ profile, onReset }: IdentityResultCardProps) {
  const dna = profile.dnaProfile;
  if (!dna) return null;

  return (
    <div id="results-master-card" className="grid gap-6 lg:grid-cols-12 items-stretch">
      
      {/* 1. Main Highlights Box (Left panel: 8 cols) */}
      <div className="lg:col-span-8 glass-effect rounded-3xl p-6 md:p-8 relative overflow-hidden flex flex-col justify-between shadow-2xl">
        
        {/* Glow vector spot */}
        <div className="pointer-events-none absolute right-0 top-0 h-48 w-48 rounded-full bg-cyan-500/10 blur-[80px]" />
        
        <div id="result-badge-row" className="flex items-center gap-2.5 mb-6">
          <span className="rounded-full bg-cyan-500/10 border border-cyan-500/30 px-3 py-1 text-[9px] text-cyan-400 font-mono tracking-widest uppercase font-bold">
            PROFILE ANALYZED // ACTIVE HABITS
          </span>
          <span className="text-[10px] text-slate-500 font-mono font-bold uppercase tracking-wider">
            SEQUENCE_ID: #{profile.id.replace("u_", "").toUpperCase()}
          </span>
        </div>

        {/* User Identity avatar & description */}
        <div id="identity-header-grid" className="flex flex-col md:flex-row items-center gap-6 mb-8">
          
          {/* Avatar cylinder with cyan rings */}
          <div className="relative shrink-0 select-none">
            <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-cyan-400 via-blue-500 to-purple-600 animate-[spin_8s_linear_infinite]" />
            <div className="absolute inset-[3px] rounded-full bg-[#0a0b10]" />
            <img
              referrerPolicy="no-referrer"
              src={profile.avatarUrl}
              alt={profile.username}
              className="relative z-10 rounded-full h-24 w-24 object-cover border border-white/5"
            />
          </div>

          <div className="flex-1 text-center md:text-left">
            <span className="text-[10px] text-slate-400 uppercase tracking-widest font-mono font-bold">YOUR COMPILER GENOTYPE</span>
            <h1 className="font-sans text-2xl md:text-3xl font-black text-white uppercase tracking-tight mt-1.5 leading-none">
              {dna.personalityName}
            </h1>
            <p className="text-xs text-slate-350 mt-4 leading-relaxed max-w-xl uppercase font-semibold tracking-wider">
              {dna.description}
            </p>
          </div>

        </div>

        {/* Badges list row */}
        <div id="dna-badges-list" className="flex flex-wrap gap-2.5 mb-4 border-t border-white/5 pt-6 font-mono font-bold">
          {dna.badges.map((badge, idx) => (
            <span
              key={idx}
              className="rounded-full bg-white/5 border border-white/10 px-3.5 py-1 text-[10px] text-cyan-400 uppercase tracking-wider"
            >
              {badge}
            </span>
          ))}
          <span className="rounded-full bg-purple-500/10 border border-purple-500/20 px-3.5 py-1 text-[10px] text-purple-400 uppercase tracking-wider">
            #{dna.competitiveTier.replace(/\s+/g, "").toUpperCase()}
          </span>
        </div>

      </div>

      {/* 2. Side metrics & triggers (Right panel: 4 cols) */}
      <div className="lg:col-span-4 flex flex-col gap-6 justify-between">
        
        {/* Playstyle Metrics sliders */}
        <div className="glass-effect rounded-3xl p-6 relative flex-1 flex flex-col justify-between shadow-2xl">
          <div>
            <h3 className="font-sans text-[10px] font-bold text-white uppercase tracking-widest mb-6 flex items-center gap-1.5 font-mono">
              <BarChart3 className="h-4 w-4 text-cyan-400 animate-pulse" /> PLAYSTYLE METRICS
            </h3>

            <div id="sliders-bars-container" className="flex flex-col gap-4 font-mono">
              {/* Metric 1 */}
              <div>
                <div className="flex justify-between items-center text-[10px] mb-1.5 font-bold">
                  <span className="text-slate-400 uppercase tracking-wider">AGGRESSION</span>
                  <span className="text-rose-400">{dna.metrics.aggression}%</span>
                </div>
                <div className="h-1.5 w-full bg-[#0a0b10] border border-white/5 rounded-full overflow-hidden">
                  <div
                    style={{ width: `${dna.metrics.aggression}%` }}
                    className="bg-gradient-to-r from-rose-650 to-rose-450 h-full rounded-full shadow-[0_0_8px_#f43f5e]"
                  />
                </div>
              </div>

              {/* Metric 2 */}
              <div>
                <div className="flex justify-between items-center text-[10px] mb-1.5 font-bold">
                  <span className="text-slate-400 uppercase tracking-wider">STRATEGY</span>
                  <span className="text-cyan-400">{dna.metrics.strategy}%</span>
                </div>
                <div className="h-1.5 w-full bg-[#0a0b10] border border-white/5 rounded-full overflow-hidden">
                  <div
                    style={{ width: `${dna.metrics.strategy}%` }}
                    className="bg-gradient-to-r from-cyan-600 to-cyan-450 h-full rounded-full shadow-[0_0_8px_#06b6d4]"
                  />
                </div>
              </div>

              {/* Metric 3 */}
              <div>
                <div className="flex justify-between items-center text-[10px] mb-1.5 font-bold">
                  <span className="text-slate-400 uppercase tracking-wider">TEAMWORK</span>
                  <span className="text-purple-400">{dna.metrics.teamwork}%</span>
                </div>
                <div className="h-1.5 w-full bg-[#0a0b10] border border-white/5 rounded-full overflow-hidden">
                  <div
                    style={{ width: `${dna.metrics.teamwork}%` }}
                    className="bg-gradient-to-r from-purple-650 to-purple-450 h-full rounded-full shadow-[0_0_8px_#a855f7]"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 border-t border-white/5 pt-4 flex items-center justify-between font-mono font-bold">
            <span className="text-[9px] text-slate-500 uppercase tracking-widest">RELIABILITY INDEX</span>
            <span className="text-[10px] text-cyan-400 tracking-wider uppercase">{dna.analysisReliability}% ACCURACY</span>
          </div>

        </div>

        {/* Competitive Toggles box */}
        <div className="glass-effect rounded-3xl p-5 flex items-center gap-4 shadow-xl">
          <div className="h-10 w-10 shrink-0 rounded-xl bg-purple-500/10 border border-purple-500/40 flex items-center justify-center text-purple-400 shadow-[0_0_10px_rgba(168,85,247,0.15)]">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div className="flex-1 uppercase font-semibold">
            <h4 className="text-[10px] font-bold text-white tracking-widest font-sans">COMPETITIVE SHIELD</h4>
            <p className="text-[9px] text-slate-500 tracking-wider mt-0.5">
              Qualified for {dna.competitiveTier} matching servers.
            </p>
          </div>
          <button
            onClick={onReset}
            className="rounded-lg bg-white/5 hover:bg-white/15 text-slate-400 hover:text-white p-2.5 transition shrink-0 cursor-pointer border border-white/10"
            title="Re-run DNA Sequencing"
          >
            <RefreshCw className="h-3.5 w-3.5" />
          </button>
        </div>

      </div>

    </div>
  );
}
