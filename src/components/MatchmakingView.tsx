import { useState } from "react";
import { PlayerMatch } from "../types";
import { Users, Check, MessageSquare, Zap, ShieldAlert, Award, Activity } from "lucide-react";

interface MatchmakingViewProps {
  matches: PlayerMatch[];
}

export default function MatchmakingView({ matches }: MatchmakingViewProps) {
  const [selectedPlayer, setSelectedPlayer] = useState<PlayerMatch | null>(null);
  const [isInviteSent, setIsInviteSent] = useState<Record<string, boolean>>({});
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [activeInvitePlayer, setActiveInvitePlayer] = useState<PlayerMatch | null>(null);
  const [invitingProgress, setInvitingProgress] = useState(false);

  const topMatch = matches[0]; // first item is the highest percentage compatibility

  const handleInviteRequest = (player: PlayerMatch) => {
    setActiveInvitePlayer(player);
    setInviteModalOpen(true);
    setInvitingProgress(true);

    // Simulate sending invite packet
    setTimeout(() => {
      setInvitingProgress(false);
      setIsInviteSent(prev => ({ ...prev, [player.userId]: true }));
    }, 1500);
  };

  const handleViewProfileDetail = (player: PlayerMatch) => {
    setSelectedPlayer(player);
  };

  return (
    <div id="social-discovery-wrap" className="mt-12 select-none">
      
      {/* 1. TOP TEAM MATCH BANNER WIDGET */}
      {topMatch && (
        <div id="top-synergy-banner" className="glass-effect rounded-3xl p-6 relative overflow-hidden mb-12 shadow-2xl border border-white/10">
          
          <div className="absolute top-0 right-0 h-28 w-28 rounded-full bg-cyan-500/5 blur-2xl" />
          
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative">
            
            {/* Visual Overlapping Avatars */}
            <div className="flex items-center gap-5">
              
              <div className="relative flex items-center shrink-0 h-16 w-28 justify-center">
                
                {/* User avatar */}
                <div className="h-14 w-14 rounded-full border-2 border-cyan-400 bg-[#0a0b10] p-[1.5px] shadow-[0_0_15px_rgba(6,182,212,0.3)] shrink-0 z-20 absolute left-2">
                  <img
                    referrerPolicy="no-referrer"
                    src="https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=150&auto=format&fit=crop"
                    alt="You"
                    className="h-full w-full object-cover rounded-full"
                  />
                  <span className="absolute -top-1 -right-1 h-3.5 w-3.5 rounded-full border-2 border-[#0a0b10] bg-green-500 shadow-md" />
                </div>

                {/* Match avatar */}
                <div className="h-14 w-14 rounded-full border-2 border-purple-500 bg-[#0a0b10] p-[1.5px] shadow-[0_0_15px_rgba(168,85,247,0.3)] shrink-0 z-10 absolute right-2">
                  <img
                    referrerPolicy="no-referrer"
                    src={topMatch.avatarUrl}
                    alt={topMatch.username}
                    className="h-full w-full object-cover rounded-full"
                  />
                  <span className="absolute -top-1 font-sans -left-1 text-[8px] bg-cyan-500 text-slate-950 font-black px-1.5 py-0.5 rounded-full uppercase border-[#0a0b10] border">TOP</span>
                </div>

              </div>

              {/* Text descriptions */}
              <div className="text-center md:text-left">
                <span className="text-[10px] text-cyan-400 font-bold uppercase font-mono tracking-widest flex items-center gap-1.5 justify-center md:justify-start">
                  <Activity className="h-3 w-3 animate-pulse" /> PERFECT SQUAD MATCH DETECTED
                </span>
                <p className="text-xs leading-relaxed text-slate-300 max-w-xl mt-1.5 uppercase tracking-wider font-semibold">
                  You and <span className="text-cyan-400 font-bold">{topMatch.username}</span> show incredible playstyle synergy. Combine your analytical leadership structures with their aggressive frontline mechanics!
                </p>
                <div className="text-[10px] text-slate-500 mt-2 font-mono uppercase tracking-widest font-bold">
                  RECOMMENDED STRATEGY: &ldquo;{topMatch.synergyExplanation}&rdquo;
                </div>
              </div>

            </div>

            {/* Score & Action Button */}
            <div id="top-synergy-banner-actions" className="flex items-center gap-6 border-t md:border-t-0 md:border-l border-white/5 pt-4 md:pt-0 pl-0 md:pl-6 w-full md:w-auto shrink-0 justify-around md:justify-start">
              
              <div className="text-center">
                <div className="font-mono text-2xl md:text-3xl font-black text-cyan-400 tracking-wider">{topMatch.compatibility}%</div>
                <div className="text-[8px] text-slate-500 uppercase tracking-widest font-mono font-bold">SYNERGY RATIO</div>
              </div>

              <button
                onClick={() => handleInviteRequest(topMatch)}
                className={`rounded-xl px-5 py-3 text-[10px] font-black uppercase transition active:scale-95 shadow-md font-sans tracking-widest cursor-pointer border ${
                  isInviteSent[topMatch.userId]
                    ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                    : "bg-cyan-500 text-black hover:bg-cyan-400 border-transparent shadow-[0_0_15px_rgba(6,182,212,0.35)]"
                }`}
              >
                {isInviteSent[topMatch.userId] ? "INVITED ✓" : "INVITE TO SQUAD"}
              </button>

            </div>

          </div>

        </div>
      )}

      {/* 2. PLAYERS LIST VIEW */}
      <div>
        <div className="mb-6">
          <h2 className="font-sans text-lg font-black tracking-widest text-white flex items-center gap-2 uppercase">
            <Users className="h-4.5 w-4.5 text-cyan-400 animate-pulse" />
            GAMERS WITH COMPATIBLE DNA
          </h2>
          <p className="text-[10px] text-slate-450 uppercase tracking-widest font-bold mt-1">
            Browse compatible users ranked by playstyle metric similarity vector distances.
          </p>
        </div>

        {/* Horizontal flex / grid pool of cards */}
        <div id="matches-grid-container" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {matches.map((player) => {
            const inviteSent = isInviteSent[player.userId];

            return (
              <div
                key={player.userId}
                className="group glass-effect rounded-3xl p-5 hover:border-cyan-500/20 transition-all duration-300 flex flex-col justify-between border border-white/5 shadow-xl"
              >
                <div>
                  
                  {/* Card head: Avatar & Rating */}
                  <div className="flex items-center justify-between gap-4 mb-4">
                    <div className="relative select-none shrink-0">
                      <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-full animate-pulse" />
                      <img
                        referrerPolicy="no-referrer"
                        src={player.avatarUrl}
                        alt={player.username}
                        className="relative z-10 h-11 w-11 rounded-full object-cover border border-white/5"
                      />
                      <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-[#0a0b10] bg-green-500 shadow-sm" />
                    </div>

                    <div className="text-right">
                      <div className="font-mono text-sm font-black text-cyan-455 text-cyan-400">{player.compatibility}%</div>
                      <div className="text-[8px] text-slate-500 font-mono tracking-widest uppercase font-bold">COMPATIB.</div>
                    </div>
                  </div>

                  {/* Nickname, Role, Labels */}
                  <div>
                    <h3 className="font-sans text-xs font-black text-slate-200 uppercase tracking-wide">{player.username}</h3>
                    <span className="text-[9px] text-cyan-400 uppercase font-mono font-bold block mb-3.5 mt-1 tracking-widest">
                      {player.personalityName}
                    </span>

                    {/* Tags list row */}
                    <div className="flex flex-wrap gap-1.5 mb-5 font-mono font-bold">
                      {player.playstyleLabels.map((lbl, i) => (
                        <span
                          key={i}
                          className="text-[8px] bg-[#0a0b10] border border-white/5 text-slate-400 px-2 py-0.5 rounded uppercase tracking-wider"
                        >
                          {lbl}
                        </span>
                      ))}
                    </div>
                  </div>

                </div>

                {/* Lower Action buttons */}
                <div id="card-action-row" className="flex items-center gap-2 mt-2 pt-3 border-t border-white/5">
                  <button
                    onClick={() => handleViewProfileDetail(player)}
                    className="flex-1 rounded-lg bg-white/5 border border-white/10 hover:border-cyan-500/20 py-2 text-[9px] text-slate-400 hover:text-white font-extrabold uppercase tracking-widest cursor-pointer transition-all"
                  >
                    VIEW SETUP
                  </button>
                  <button
                    onClick={() => handleInviteRequest(player)}
                    className={`rounded-lg px-3 py-2 text-[9px] uppercase font-bold transition flex items-center justify-center gap-1 shrink-0 cursor-pointer border ${
                      inviteSent
                        ? "bg-[#0a0b10] text-emerald-400 border-emerald-500/10"
                        : "bg-cyan-500 text-black hover:bg-cyan-400 border-transparent"
                    }`}
                  >
                    {inviteSent ? "SENT ✓" : "INVITE"}
                  </button>
                </div>

              </div>
            );
          })}
        </div>
      </div>

      {/* SQUAD INVITE AUTOMATION MODAL */}
      {inviteModalOpen && activeInvitePlayer && (
        <div className="fixed inset-0 z-50 bg-[#0a0b10]/95 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-effect rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl p-6 border border-white/10">
            
            <div className="text-center relative">
              <div className="h-12 w-12 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center justify-center mx-auto mb-4 animate-[pulse_1.5s_infinite]">
                <Users className="h-5 w-5" />
              </div>

              <h4 className="font-sans text-xs font-black tracking-widest text-white uppercase font-mono mb-2">
                SEQUENCING INTERACTION PACKET
              </h4>

              {invitingProgress ? (
                <div id="inviting-progress-panel">
                  <p className="text-[11px] text-slate-400 leading-relaxed mb-6 uppercase tracking-wider font-semibold">
                    Transmitting tactical synchronization alignment packet to <span className="text-cyan-400 font-bold">{activeInvitePlayer.username}</span>...
                  </p>
                  
                  {/* simulated loader bar */}
                  <div className="w-full bg-[#0a0b10] h-2 rounded-full border border-white/5 overflow-hidden relative">
                    <div className="absolute inset-y-0 left-0 bg-cyan-400 rounded-full animate-[shimmer_1.5s_infinite] w-2/3" />
                  </div>
                </div>
              ) : (
                <div id="invite-success-panel">
                  <p className="text-[11px] text-slate-400 leading-relaxed mb-6 uppercase tracking-wider font-semibold">
                    Squad Invitation Packet successfully locked and transmitted to <span className="text-cyan-400 font-bold">{activeInvitePlayer.username}</span>! They will receive a lobby notification on discord and Steam.
                  </p>

                  <button
                    onClick={() => setInviteModalOpen(false)}
                    className="w-full rounded-xl bg-cyan-500 text-black font-black font-sans text-[10px] tracking-widest py-3.5 hover:bg-cyan-400 transition cursor-pointer"
                  >
                    RETURN TO DISCOVERY
                  </button>
                </div>
              )}
            </div>

          </div>
        </div>
      )}

      {/* GAMER DETAIL OVERLAY MODAL */}
      {selectedPlayer && (
        <div className="fixed inset-0 z-50 bg-[#0a0b10]/95 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-effect rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl p-6 relative border border-white/10">
            
            <div className="absolute top-4 right-4">
              <button
                onClick={() => setSelectedPlayer(null)}
                className="bg-white/5 hover:bg-white/15 text-slate-350 hover:text-white px-3 py-1.5 rounded-lg text-[9px] font-bold tracking-widest uppercase cursor-pointer border border-white/10"
              >
                Close
              </button>
            </div>

            <div className="flex items-center gap-4 mb-6 border-b border-white/5 pb-5">
              <img
                src={selectedPlayer.avatarUrl}
                alt={selectedPlayer.username}
                className="h-16 w-16 rounded-full object-cover border border-white/5 ring-2 ring-cyan-500/20"
              />
              <div>
                <h3 className="font-sans text-xs font-black text-white uppercase tracking-wide">{selectedPlayer.username}</h3>
                <span className="text-[10px] text-cyan-400 uppercase font-mono font-bold tracking-widest">
                  {selectedPlayer.personalityName}
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-4 font-sans text-xs">
              <div>
                <span className="block text-[8px] text-slate-500 uppercase tracking-widest font-mono font-bold mb-2">PLAYSTYLE HABITS INDEX</span>
                <div className="flex flex-wrap gap-1.5 font-mono font-bold">
                  {selectedPlayer.playstyleLabels.map((lbl, i) => (
                    <span
                      key={i}
                      className="text-slate-300 bg-[#0a0b10] border border-white/5 px-2.5 py-1 rounded text-[8px] uppercase tracking-wider"
                    >
                      {lbl}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <span className="block text-[8px] text-slate-500 uppercase tracking-widest font-mono font-bold mb-2">SQUAD SYNERGY METRICS GRAPH</span>
                <p className="text-[11px] text-slate-350 leading-relaxed bg-[#0a0b10]/60 p-3.5 rounded-xl border border-white/5 uppercase tracking-wide font-semibold">
                  {selectedPlayer.synergyExplanation}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-2 font-mono font-bold">
                <div className="bg-[#0a0b10] border border-white/5 rounded-xl p-3">
                  <span className="text-[8px] text-slate-550 block uppercase">Simulated Schedule</span>
                  <span className="text-cyan-400 text-[10px] block mt-1 uppercase tracking-wider">20h - 40h / week</span>
                </div>
                <div className="bg-[#0a0b10] border border-white/5 rounded-xl p-3">
                  <span className="text-[8px] text-slate-550 block uppercase">Core Platforms</span>
                  <span className="text-white text-[10px] block mt-1 uppercase tracking-wider">PC, Steam</span>
                </div>
              </div>
            </div>

            {/* Quick action invite inside modal */}
            <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-end">
              <button
                onClick={() => {
                  setSelectedPlayer(null);
                  handleInviteRequest(selectedPlayer);
                }}
                className="w-full rounded-xl bg-purple-600 text-white font-black text-[10px] tracking-widest py-3 hover:bg-purple-500 transition uppercase cursor-pointer"
              >
                Send Direct Squad Invite
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
