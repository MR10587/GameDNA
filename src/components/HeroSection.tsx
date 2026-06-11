import { Sparkles, BarChart2, ShieldCheck, Zap, Layers, Trophy, CheckCircle, Flame } from "lucide-react";
import { CmsContent } from "../types";

interface HeroSectionProps {
  cms: CmsContent;
  onStartAnalysis: () => void;
  onEnterDemo: () => void;
}

export default function HeroSection({ cms, onStartAnalysis, onEnterDemo }: HeroSectionProps) {
  const hp = cms.homePage;

  return (
    <div id="hero-wrapping-div" className="relative min-h-screen overflow-hidden bg-[#0a0b10] text-[#e2e8f0]">
      
      {/* Visual cyber mesh/grid indicators */}
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-35" />

      {/* Cyber gradient ambient spots */}
      <div className="pointer-events-none absolute left-10 top-20 -z-10 h-96 w-96 rounded-full bg-cyan-500/10 blur-[130px]" />
      <div className="pointer-events-none absolute right-10 bottom-20 -z-10 h-96 w-96 rounded-full bg-purple-600/10 blur-[130px]" />

      <div className="mx-auto max-w-7xl px-4 py-16 md:px-8 md:py-24">
        
        {/* Dynamic Marketing Hero Row */}
        <div className="grid items-center gap-12 lg:grid-cols-12">
          
          {/* Left Text content */}
          <div className="flex flex-col items-start gap-6 lg:col-span-7">
            
            <div id="cyber-pill" className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-bold tracking-widest text-cyan-400 uppercase shadow-inner">
              <Sparkles className="h-3 w-3 animate-pulse text-cyan-400" />
              {hp.tagline}
            </div>

            <h1 id="hero-headline" className="font-sans text-4xl font-black tracking-tighter lg:text-6xl text-white leading-tight">
              {hp.heroTitle.split(" ").slice(0, -1).join(" ")}{" "}
              <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-500 bg-clip-text font-black text-transparent">
                {hp.heroTitle.split(" ").slice(-1)}
              </span>
            </h1>

            <p id="hero-desc" className="text-sm md:text-base leading-relaxed text-slate-400 max-w-xl">
              {hp.heroSubtitle}
            </p>

            <div id="hero-actions" className="flex flex-wrap items-center gap-4 mt-2">
              <button
                id="hero-start-cta"
                onClick={onStartAnalysis}
                className="py-3.5 px-8 bg-cyan-500 text-black font-black text-xs rounded-xl hover:bg-cyan-400 shadow-[0_0_25px_rgba(6,182,212,0.45)] transition-all uppercase tracking-tighter flex items-center gap-2 cursor-pointer"
              >
                <span>{hp.ctaAnalyzeText}</span>
                <Zap className="h-4 w-4 text-black shrink-0" />
              </button>

              <button
                id="hero-demo-cta"
                onClick={onEnterDemo}
                className="rounded-xl border border-white/10 bg-white/5 px-8 py-3.5 text-xs font-bold tracking-widest uppercase text-slate-200 transition hover:bg-white/10 hover:border-white/20 cursor-pointer"
              >
                {hp.ctaDemoText}
              </button>
            </div>

            {/* Simulated interactive statistics counters */}
            <div id="stats-dashboard" className="mt-8 grid grid-cols-3 gap-6 md:gap-10 border-t border-white/10 pt-8 w-full max-w-lg">
              <div>
                <div className="font-sans text-2xl md:text-3xl font-black text-white">{hp.statsCounterProfiles}</div>
                <div className="text-[10px] text-slate-500 uppercase tracking-widest mt-1">PROFILES DECODED</div>
              </div>
              <div>
                <div className="font-sans text-2xl md:text-3xl font-black text-cyan-400">{hp.statsCounterAccuracy}</div>
                <div className="text-[10px] text-slate-500 uppercase tracking-widest mt-1">ALIGNMENT RATIO</div>
              </div>
              <div>
                <div className="font-sans text-2xl md:text-3xl font-black text-purple-400">{hp.statsCounterRating}</div>
                <div className="text-[10px] text-slate-500 uppercase tracking-widest mt-1">SQUAD SATISFACTION</div>
              </div>
            </div>

          </div>

          {/* Right scanner visual (WOW factor) */}
          <div className="relative flex items-center justify-center lg:col-span-5 h-[380px] w-full">
            
            <div className="relative h-80 w-80 md:h-96 md:w-96 rounded-full flex items-center justify-center bg-white/[0.02] border border-white/5 p-8 shadow-[0_0_50px_rgba(6,182,212,0.03)]">
              
              {/* Rotating radar elements */}
              <div className="absolute inset-2 rounded-full border border-dashed border-cyan-500/10 animate-[spin_40s_linear_infinite]" />
              <div className="absolute inset-8 rounded-full border border-purple-500/10 animate-[spin_20s_linear_infinite_reverse]" />
              <div className="absolute inset-16 rounded-full border border-white/5" />

              {/* Glowing active node radar scope line */}
              <div className="absolute inset-0 rounded-full bg-[conic-gradient(from_0deg,rgba(6,182,212,0.1)_0deg,transparent_90deg,transparent_360deg)] animate-[spin_6s_linear_infinite]" />

              {/* Status overlays */}
              <div className="absolute top-6 left-6 rounded-md border border-white/10 bg-[#0a0b10] px-2.5 py-1 text-[9px] font-mono tracking-widest text-cyan-400">
                <div className="flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-ping" />
                  BEHAVIOR_SCAN: ACTIVE
                </div>
              </div>

              <div className="absolute bottom-6 right-6 rounded-md border border-white/10 bg-[#0a0b10] px-2.5 py-1 text-[9px] font-mono tracking-widest text-purple-400">
                DNA_MATCH: SYNC_READY
              </div>

              {/* Inside core vector image representation */}
              <div className="relative z-10 flex h-48 w-48 items-center justify-center rounded-full bg-white/[0.03] border border-white/10 shadow-inner group">
                <div className="absolute inset-1 rounded-full bg-gradient-to-tr from-cyan-500/10 to-purple-500/10 opacity-40 group-hover:opacity-60 transition" />
                <BarChart2 className="h-14 w-14 text-cyan-400 animate-[pulse_3s_infinite]" />
                
                {/* Micro floating coordinates node */}
                <span className="absolute text-[8px] font-mono text-cyan-500/60 top-10 right-10">DEC: 99.2%</span>
                <span className="absolute text-[8px] font-mono text-purple-500/60 bottom-10 left-10">NOD: 1024</span>
              </div>

            </div>

          </div>

        </div>

        {/* SECTION 2: Engineered for the Elite */}
        <div id="feature-highlight-section" className="mt-32">
          <div className="text-center max-w-xl mx-auto mb-16">
            <h2 id="trust-title" className="font-sans text-3xl font-black tracking-tight text-white mb-3 uppercase">{hp.trustHeading}</h2>
            <p className="text-xs text-slate-400 leading-relaxed font-semibold uppercase tracking-widest">
              {hp.trustText}
            </p>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {/* Feature 1 */}
            <div id="feat-personality" className="group rounded-3xl glass-effect p-8 shadow-md transition-all duration-350 hover:-translate-y-1">
              <div className="h-12 w-12 rounded-2xl bg-cyan-500/10 flex items-center justify-center text-cyan-405 mb-6 group-hover:bg-cyan-500/20 transition-all duration-300">
                <Layers className="h-6 w-6" />
              </div>
              <h3 className="font-sans text-base font-bold text-white mb-2.5 uppercase tracking-wide">Gaming Personality</h3>
              <p className="text-xs leading-relaxed text-slate-450 font-medium">
                Go deep into your psychological playstyle. Match custom profiles like the Tactical Vanguard, Strategic Mastermind, or Altruistic Shield.
              </p>
            </div>

            {/* Feature 2 */}
            <div id="feat-recs" className="group rounded-3xl glass-effect p-8 shadow-md transition-all duration-350 hover:-translate-y-1">
              <div className="h-12 w-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-400 mb-6 group-hover:bg-blue-500/20 transition-all duration-300">
                <Trophy className="h-6 w-6" />
              </div>
              <h3 className="font-sans text-base font-bold text-white mb-2.5 uppercase tracking-wide">Smart Recommendations</h3>
              <p className="text-xs leading-relaxed text-slate-450 font-medium">
                Stop playing mismatched general titles. Find games dynamically adapted to the aggression, pace, and sandbox components you prefer.
              </p>
            </div>

            {/* Feature 3 */}
            <div id="feat-matching" className="group rounded-3xl glass-effect p-8 shadow-md transition-all duration-350 hover:-translate-y-1">
              <div className="h-12 w-12 rounded-2xl bg-purple-500/10 flex items-center justify-center text-purple-400 mb-6 group-hover:bg-purple-500/20 transition-all duration-300">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <h3 className="font-sans text-base font-bold text-white mb-2.5 uppercase tracking-wide">Elite Matchmaking</h3>
              <p className="text-xs leading-relaxed text-slate-450 font-medium">
                Discover gamers with highly matching, complementary playstyles to build highly interactive, unstoppable multiplayer squads.
              </p>
            </div>
          </div>
        </div>

        {/* SECTION 3: Science & Bullet points */}
        <div id="science-section" className="mt-32 grid items-center gap-12 lg:grid-cols-2">
          
          {/* Mock Console design overlay */}
          <div className="relative rounded-3xl glass-effect p-6 overflow-hidden shadow-inner group">
            <div className="pointer-events-none absolute -right-20 -top-20 h-40 w-40 rounded-full bg-cyan-500/10 blur-[80px]" />
            
            <img 
              referrerPolicy="no-referrer"
              src="https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=600&auto=format&fit=crop"
              alt="Retro Cyber Gaming" 
              className="w-full h-64 object-cover rounded-2xl border border-white/5 opacity-80 group-hover:opacity-100 transition duration-500"
            />
            {/* Interactive button overlays */}
            <div className="absolute inset-0 flex items-center justify-center">
              <button 
                onClick={onStartAnalysis}
                className="flex h-12 w-12 items-center justify-center rounded-full bg-cyan-500 text-slate-950 shadow-[0_0_20px_rgba(6,182,212,0.5)] transition duration-300 hover:scale-110 cursor-pointer"
              >
                <Zap className="h-5 w-5 fill-slate-950" />
              </button>
            </div>
          </div>

          {/* Bullet points explanation */}
          <div className="flex flex-col items-start gap-6">
            <div className="text-[10px] font-bold tracking-widest text-cyan-400 uppercase font-mono">
              The Science
            </div>
            <h2 id="science-title" className="font-sans text-3xl font-black tracking-tight text-white uppercase">{hp.scienceTitle}</h2>
            <p className="text-xs leading-relaxed text-slate-450 font-medium">
              {hp.scienceSubtitle}
            </p>

            <div id="science-bullets" className="flex flex-col gap-4 mt-2">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-cyan-400 shrink-0" />
                <span className="text-xs text-slate-300 font-bold uppercase tracking-wide">{hp.scienceBullet1}</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-cyan-400 shrink-0" />
                <span className="text-xs text-slate-300 font-bold uppercase tracking-wide">{hp.scienceBullet2}</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-cyan-400 shrink-0" />
                <span className="text-xs text-slate-300 font-bold uppercase tracking-wide">{hp.scienceBullet3}</span>
              </div>
            </div>
          </div>

        </div>

        {/* SECTION 4: Final CTA */}
        <div id="final-cta-panel" className="mt-32 rounded-3xl glass-effect p-8 md:p-12 text-center relative overflow-hidden">
          <div className="pointer-events-none absolute -bottom-10 -right-10 h-36 w-36 rounded-full bg-cyan-500/10 blur-[80px]" />
          <div className="pointer-events-none absolute -top-10 -left-10 h-36 w-36 rounded-full bg-purple-500/10 blur-[80px]" />

          <div className="absolute top-4 right-4 text-slate-600 uppercase font-mono text-[9px] tracking-widest font-bold hidden md:block">
            SECURITY.LEVEL.3 // SYSTEM ACTIVE
          </div>

          <Flame className="h-8 w-8 text-cyan-405 mx-auto mb-6 animate-pulse" />
          <h2 className="font-sans text-2xl md:text-3xl font-black text-white max-w-lg mx-auto uppercase">
            Ready to Decode Your <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">Competitive Edge?</span>
          </h2>
          <p className="text-xs text-slate-450 mt-4 max-w-md mx-auto leading-relaxed font-semibold uppercase tracking-wider">
            Join thousands of gamers who have decoded their gaming DNA, matched with complementary teammates, and climbed the ranked queues.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={onStartAnalysis}
              className="w-full sm:w-auto py-3.5 px-8 bg-cyan-500 text-black font-black text-xs rounded-xl hover:bg-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.4)] transition-all uppercase tracking-tighter cursor-pointer"
            >
              Start Analysis Now
            </button>
            <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold font-mono">Free for early access members</span>
          </div>
        </div>

      </div>
    </div>
  );
}
