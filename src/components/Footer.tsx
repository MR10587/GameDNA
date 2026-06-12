import { Activity, Twitter, Github, Bot } from "lucide-react";

interface FooterProps {
  setActiveTab: (tab: string) => void;
  hasProfile: boolean;
}

export default function Footer({ setActiveTab, hasProfile }: FooterProps) {
  return (
    <footer className="border-t border-white/5 bg-[#0a0b10] py-12 text-slate-400 relative">
      <div id="footer-container" className="mx-auto max-w-7xl px-4 md:px-8">
        <div id="footer-grid" className="grid gap-10 md:grid-cols-4">
          
          {/* Logo Column */}
          <div className="md:col-span-1">
            <div id="footer-logo" className="flex items-center gap-2 mb-4">
              <div className="w-6 h-6 bg-gradient-to-tr from-cyan-500 to-purple-600 rounded-md flex items-center justify-center p-[1px]">
                <div className="w-full h-full bg-[#0a0b10] rotate-45 flex items-center justify-center">
                  <span className="w-1 h-1 bg-cyan-400 rounded-full" />
                </div>
              </div>
              <span className="font-sans text-lg font-bold tracking-tighter text-white">
                GAMEDNA<span className="text-cyan-400">.AI</span>
              </span>
            </div>
            <p className="text-xs leading-relaxed text-slate-400">
              The world&apos;s leading gaming intelligence platform. Define your DNA, discover matched titles, and align with your perfect team.
            </p>
          </div>

          {/* Platform Column */}
          <div>
            <h4 id="footer-title-platform" className="mb-4 font-sans text-xs font-bold tracking-widest text-white uppercase">Platform</h4>
            <div className="flex flex-col gap-2.5 text-xs">
              <button onClick={() => setActiveTab("analyze")} className="text-left hover:text-cyan-450 transition uppercase">Sequence DNA</button>
              {hasProfile && (
                <button onClick={() => setActiveTab("results")} className="text-left hover:text-cyan-450 transition uppercase">Dashboard</button>
              )}
            </div>
          </div>

          {/* Community Column */}
          <div>
            <h4 id="footer-title-comm" className="mb-4 font-sans text-xs font-bold tracking-widest text-white uppercase">Community</h4>
            <div className="flex flex-col gap-2.5 text-xs">
              <a href="#discord" className="hover:text-cyan-450 transition uppercase font-semibold">Discord Server</a>
              <a href="#twitter" className="hover:text-cyan-450 transition uppercase font-semibold">Twitter / X</a>
              <a href="#board" className="hover:text-cyan-450 transition uppercase font-semibold">Tournament Board</a>
              <a href="#blog" className="hover:text-cyan-450 transition uppercase font-semibold">Developer Blog</a>
            </div>
          </div>

          {/* Socials Column */}
          <div>
            <h4 id="footer-title-sync" className="mb-4 font-sans text-xs font-bold tracking-widest text-white uppercase">Stay Synced</h4>
            <p className="text-xs text-slate-500 mb-4 leading-normal">
              Read real-time protocol notifications, API patch updates, and tournament details.
            </p>
            <div id="footer-social-icons" className="flex items-center gap-4">
              <a href="#twitter" className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 border border-white/15 text-slate-405 transition hover:bg-cyan-500/10 hover:border-cyan-500/30 hover:text-cyan-400 shadow">
                <Twitter className="h-4 w-4" />
              </a>
              <a href="#github" className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 border border-white/15 text-slate-450 transition hover:bg-cyan-500/10 hover:border-cyan-500/30 hover:text-cyan-400 shadow">
                <Github className="h-4 w-4" />
              </a>
              <a href="#arena" className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 border border-white/15 text-slate-405 transition hover:bg-cyan-500/10 hover:border-cyan-500/30 hover:text-cyan-400 shadow">
                <Bot className="h-4 w-4" />
              </a>
            </div>
          </div>

        </div>

        {/* Separator */}
        <hr className="my-8 border-white/5" />

        {/* Legal Row */}
        <div id="legal-row" className="flex flex-col gap-4 text-[11px] text-slate-500 md:flex-row md:items-center md:justify-between mb-2">
          <span>© 2026 GAMEDNA INTELLIGENCE. ALL ANALYSIS PROTOCOLS ACTIVE.</span>
          <div className="flex gap-6 uppercase">
            <a href="#privacy" className="hover:text-slate-300">Privacy Policy</a>
            <a href="#terms" className="hover:text-slate-300">Terms of Service</a>
          </div>
        </div>
      </div>

      {/* Decorative immersive low height bottom bar strip */}
      <div className="bg-[#07080c] border-t border-white/5 py-4 px-8 mt-6">
        <div className="mx-auto max-w-7xl flex flex-col md:flex-row items-center justify-between gap-3 text-[10px] font-bold tracking-widest text-slate-500">
          <div className="flex flex-wrap items-center justify-center gap-6">
            <div className="flex items-center">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full mr-2 animate-pulse" /> 
              ENGINE CONNECTED
            </div>
            <div className="flex items-center">
              <span className="text-cyan-400 mr-1.5">LATENCY:</span> 24MS
            </div>
            <div className="flex items-center">
              <span className="text-cyan-400 mr-1.5">UPTIME:</span> 99.98%
            </div>
          </div>
          <div className="text-right uppercase">
            GAMEDNA PROTOCOL V2.4.0-STABLE
          </div>
        </div>
      </div>
    </footer>
  );
}
