import { Activity, ShieldAlert, Cpu, Laptop, Users } from "lucide-react";

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  hasProfile: boolean;
}

export default function Navbar({ activeTab, setActiveTab, hasProfile }: NavbarProps) {
  return (
    <nav className="sticky top-0 z-50 border-b border-white/10 bg-[#0a0b10]/85 backdrop-blur-md">
      <div id="nav-container" className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 md:px-8">
        {/* Brand Logo & Name */}
        <div
          id="brand-logo"
          onClick={() => setActiveTab("analyze")}
          className="flex cursor-pointer items-center gap-3 transition hover:opacity-90"
        >
          <div className="w-8 h-8 bg-gradient-to-tr from-cyan-500 to-purple-600 rounded-lg flex items-center justify-center p-0.5 shadow-[0_0_15px_rgba(6,182,212,0.25)]">
            <div className="w-full h-full bg-[#0a0b10] rotate-45 flex items-center justify-center">
              <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-pulse"></div>
            </div>
          </div>
          <span className="text-xl font-bold tracking-tighter text-white">
            GAMEDNA<span className="text-cyan-400">.AI</span>
          </span>
        </div>

        {/* Desktop Links - Immersive UI exact uppercase styling */}
        <div id="nav-links-container" className="hidden items-center gap-8 md:flex text-xs font-semibold tracking-widest">
          <button
            id="nav-btn-analyze"
            onClick={() => setActiveTab("analyze")}
            className={`transition-colors duration-200 uppercase hover:text-cyan-300 ${
              activeTab === "analyze" || activeTab === "analysis_scanning"
                ? "text-cyan-400 font-bold"
                : "text-slate-450"
            }`}
          >
            SEQUENCE DNA
          </button>

          {hasProfile && (
            <button
              id="nav-btn-results"
              onClick={() => setActiveTab("results")}
              className={`transition-colors duration-200 uppercase hover:text-cyan-300 ${
                activeTab === "results" ? "text-cyan-400 font-bold" : "text-slate-450"
              }`}
            >
              DASHBOARD
            </button>
          )}


        </div>

        {/* Navigation CTAs */}
        <div id="nav-actions" className="flex items-center gap-4">
          <button
            id="nav-action-btn"
            onClick={() => setActiveTab(hasProfile ? "results" : "analyze")}
            className="py-2.5 px-4 bg-cyan-500 text-black font-black text-xs rounded-xl hover:bg-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.35)] transition-all uppercase tracking-tighter"
          >
            {hasProfile ? "DASHBOARD" : "GET DNA"}
          </button>
        </div>
      </div>
    </nav>
  );
}
