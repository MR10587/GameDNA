import { useState, useEffect } from "react";
import { Activity, ShieldCheck, Zap, Server, Shield } from "lucide-react";

interface AnalysisScanningProps {
  onFinish: () => void;
  username: string;
}

export default function AnalysisScanning({ onFinish, username }: AnalysisScanningProps) {
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState("Accessing playstyle sequence API...");
  const [packets, setPackets] = useState(0);
  const [neuralNodes, setNeuralNodes] = useState(0);

  useEffect(() => {
    // Progress ticker
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 1;
      });
    }, 45); // Takes approx ~4.5 seconds

    return () => clearInterval(progressInterval);
  }, []);

  // Update status messages step-by-step
  useEffect(() => {
    if (progress < 25) {
      setStatusText(`Sequencing gaming history for user: ${username}...`);
    } else if (progress < 50) {
      setStatusText("Mapping behavioral traits and tactics ratios...");
    } else if (progress < 75) {
      setStatusText("Comparing metrics with global player database...");
    } else if (progress < 95) {
      setStatusText("Generating neural playstyle DNA signatures...");
    } else {
      setStatusText("Syncing parameters with competitive lobbies...");
    }

    // Tick counts upwards
    setPackets(Math.round(progress * 21.25));
    setNeuralNodes(Math.round(progress * 10.24));

    if (progress === 100) {
      const wait = setTimeout(() => {
        onFinish();
      }, 700);
      return () => clearTimeout(wait);
    }
  }, [progress, username, onFinish]);

  return (
    <div id="scanning-screen-wrap" className="min-h-screen bg-[#0a0b10] text-[#e2e8f0] flex flex-col justify-center items-center px-4 relative select-none">
      
      {/* Laser scans */}
      <div className="absolute top-1/4 w-full h-[1px] bg-cyan-500/20 shadow-[0_0_12px_#06b6d4] animate-[bounce_4s_infinite]" />
      
      <div id="logo-scanning-top" className="flex items-center gap-3 mb-8 animate-pulse">
        <Activity className="h-5 w-5 text-cyan-400" />
        <span className="font-sans text-xl font-black tracking-widest text-white uppercase">
          GAME<span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-400 bg-clip-text text-transparent">DNA</span>
        </span>
      </div>

      {/* Main scanning cockpit card */}
      <div id="loading-card" className="max-w-xl w-full glass-effect rounded-3xl p-8 relative shadow-2xl">
        
        {/* Glow corners */}
        <div className="absolute top-0 left-0 h-4 w-4 border-t-2 border-l-2 border-cyan-400 rounded-tl-xl" />
        <div className="absolute top-0 right-0 h-4 w-4 border-t-2 border-r-2 border-cyan-400 rounded-tr-xl" />
        <div className="absolute bottom-0 left-0 h-4 w-4 border-b-2 border-l-2 border-purple-400 rounded-bl-xl" />
        <div className="absolute bottom-0 right-0 h-4 w-4 border-b-2 border-r-2 border-purple-400 rounded-br-xl" />

        {/* Waves & Pulse Center header row */}
        <div className="flex items-center justify-between px-6 mb-8 mt-2">
          
          {/* Wave 1 */}
          <div id="wave-left" className="flex items-end gap-1 h-12 w-20">
            {[0.4, 0.9, 0.5, 0.7, 0.3, 0.8, 0.2].map((h, i) => (
              <span
                key={i}
                style={{ height: `${h * 100}%` }}
                className="w-1.5 bg-gradient-to-t from-cyan-600 to-cyan-400 rounded-sm animate-[pulse_1.2s_infinite]"
              />
            ))}
          </div>

          {/* Core active pulse flash */}
          <div className="h-16 w-16 bg-[#0a0b10] border border-white/10 rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(6,182,212,0.15)] relative">
            <span className="absolute inset-0 rounded-full bg-cyan-400/10 animate-ping" />
            <Zap className="h-6 w-6 text-cyan-400 fill-cyan-400/10 animate-pulse" />
          </div>

          {/* Wave 2 */}
          <div id="wave-right" className="flex items-end gap-1 h-12 w-20 justify-end">
            {[0.2, 0.7, 0.4, 0.6, 0.9, 0.3, 0.8].map((h, i) => (
              <span
                key={i}
                style={{ height: `${h * 100}%` }}
                className="w-1.5 bg-gradient-to-t from-purple-600 to-purple-400 rounded-sm animate-[pulse_1.5s_infinite]"
              />
            ))}
          </div>

        </div>

        {/* Text descriptions */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-1.5 text-[9px] tracking-widest text-cyan-400 uppercase font-mono mb-2 font-bold">
            <Server className="h-3 w-3 animate-pulse" />
            PROTOCOL ACTIVE // DEEP COMPILING SCAN
          </div>
          <h2 id="scanned-status-text" className="font-sans text-xs font-bold uppercase tracking-widest text-[#e2e8f0] h-12 flex items-center justify-center px-4 text-center leading-relaxed font-sans">
            {statusText}
          </h2>
        </div>

        {/* NEURAL PROCESSING BAR */}
        <div className="mt-8 mb-6">
          <div className="flex items-center justify-between text-[10px] uppercase font-mono font-bold tracking-widest mb-2.5">
            <span className="text-slate-400 uppercase">Neural Processing</span>
            <span className="text-cyan-400">{progress}%</span>
          </div>
          
          {/* Bar track */}
          <div className="w-full bg-[#0a0b10] h-3 rounded-full border border-white/5 p-[1.5px] overflow-hidden">
            <div
              style={{ width: `${progress}%` }}
              className="bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 h-full rounded-full transition-all duration-300 shadow-[0_0_10px_rgba(6,182,212,0.8)]"
            />
          </div>
        </div>

        {/* Lower Statistics Box metrics */}
        <div className="grid grid-cols-2 gap-4 mt-8">
          
          <div className="bg-[#0a0b10]/40 border border-white/10 rounded-2xl p-4 text-center">
            <div className="text-[9px] text-slate-500 uppercase tracking-widest font-mono font-bold">Packets Analysed</div>
            <div className="font-mono text-base font-bold mt-1 text-slate-100 uppercase tracking-wider">
              {packets.toLocaleString()} MB
            </div>
          </div>

          <div className="bg-[#0a0b10]/40 border border-white/10 rounded-2xl p-4 text-center">
            <div className="text-[9px] text-slate-500 uppercase tracking-widest font-mono font-bold">Neural Nodes</div>
            <div className="font-mono text-base font-bold mt-1 text-cyan-400 flex items-center justify-center gap-1.5 uppercase tracking-wider">
              <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-cyan-400" />
              {neuralNodes} Verified
            </div>
          </div>

        </div>

      </div>

      {/* Cyberpunk sub footer layout info details */}
      <div className="mt-12 flex items-center justify-between text-[8px] text-slate-550 font-mono w-full max-w-xl px-4 uppercase font-bold tracking-wider">
        <span>SECURE.PROTOCOL.V.4.0.2</span>
        <span>NODE_ID: 882-QX</span>
        <span>LATENCY: 12MS</span>
        <span>© 2026 GAMEDNA CORE</span>
      </div>

    </div>
  );
}
