import React, { useState, useEffect } from "react";
import Navbar from "./components/Navbar.tsx";
import Footer from "./components/Footer.tsx";
import ProfileSetupForm from "./components/ProfileSetupForm.tsx";
import AnalysisScanning from "./components/AnalysisScanning.tsx";
import IdentityResultCard from "./components/IdentityResultCard.tsx";
import RecommendationsView from "./components/RecommendationsView.tsx";
import MatchmakingView from "./components/MatchmakingView.tsx";

import { UserProfile, GameRecommendation, PlayerMatch, CmsContent, Game } from "./types.ts";
import { Sparkles } from "lucide-react";

export default function App() {
  // Navigation Routing States
  const [activeTab, setActiveTab] = useState<string>("analyze");
  
  // Profile & AI Response States
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [recommendations, setRecommendations] = useState<GameRecommendation[]>([]);
  const [matches, setMatches] = useState<PlayerMatch[]>([]);
  
  // Pending profile setup data to feed scanning screen
  const [pendingFormData, setPendingFormData] = useState<any>(null);

  // Database lists fetched from server API
  const [cms, setCms] = useState<CmsContent | null>(null);
  const [allGames, setAllGames] = useState<Game[]>([]);
  const [allProfiles, setAllProfiles] = useState<UserProfile[]>([]);
  


  // Initialize and Fetch Initial Server-Side Datasets
  const fetchServerData = async () => {
    try {
      // 1. Fetch CMS Content
      const cmsRes = await fetch("/api/cms");
      if (cmsRes.ok) {
        const cmsData = await cmsRes.json();
        setCms(cmsData);
      }

      // 2. Fetch Games Library
      const gamesRes = await fetch("/api/games");
      if (gamesRes.ok) {
        const gamesData = await gamesRes.json();
        setAllGames(gamesData);
      }

      // 3. Fetch User Profiles list
      const profilesRes = await fetch("/api/profiles");
      if (profilesRes.ok) {
        const profilesData = await profilesRes.json();
        setAllProfiles(profilesData);
      }
    } catch (err) {
      console.error("GameDNA client: Error fetching dynamic server datasets:", err);
    }
  };

  useEffect(() => {
    fetchServerData();
  }, []);

  // Set HTML headers based on CMS Seos
  useEffect(() => {
    if (cms && cms.seoSettings) {
      document.title = cms.seoSettings.metaTitle;
      const metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc) {
        metaDesc.setAttribute("content", cms.seoSettings.metaDescription);
      }
    }
  }, [cms]);

  // Core flow: Handle Profile setup submission
  const handleProfileSetupSubmit = (formData: any) => {
    setPendingFormData(formData);
    // Move to scanning overlay first
    setActiveTab("analysis_scanning");
  };

  // Trigger actual server analysis after Wow screen concludes
  const triggerDnaAnalysisExecution = async () => {
    if (!pendingFormData) return;
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(pendingFormData)
      });
      if (res.ok) {
        const output = await res.json();
        setProfile(output.profile);
        setRecommendations(output.recommendations);
        setMatches(output.matches);
        
        // Refresh registers
        fetchServerData();
        
        // Final transition to results dashboard
        setActiveTab("results");
      } else {
        const err = await res.json();
        alert(`Analysis Server Failed: ${err.error || "Execution error in AI calculation"}`);
        setActiveTab("analyze");
      }
    } catch (err) {
      console.error("GameDNA: Setup API error:", err);
      alert("A network connection error prevented AI DNA sequencing. Dropping back to sequencing.");
      setActiveTab("analyze");
    } finally {
      setPendingFormData(null);
    }
  };

  // Direct skip to demo preset
  const handleSkipToDemo = async (demoType: string) => {
    // Look up one of the pre-loaded users
    const matchedPreset = allProfiles.find(p => p.username === (
      demoType === "fps" ? "ApexPredator" : demoType === "casual" ? "CozyLlama" : "VanguardSovereign"
    ));

    if (matchedPreset) {
      setProfile(matchedPreset);
      // Simulate recommendation calculations on fly
      const simpleRecs: GameRecommendation[] = allGames.slice(0, 3).map((g, i) => ({
        id: g.id,
        name: g.name,
        genre: g.genre,
        matchPercentage: 98 - (i * 6),
        whyRecommended: `Matches your high ${matchedPreset.playstyleSelfTag} index and preferred titles record.`,
        imageUrl: g.imageUrl
      }));
      setRecommendations(simpleRecs);
      
      // Map standard matches
      const simulatedMatches: PlayerMatch[] = allProfiles
        .filter(p => p.username !== matchedPreset.username)
        .map((p, i) => ({
          userId: p.id,
          username: p.username,
          avatarUrl: p.avatarUrl,
          personalityName: p.dnaProfile?.personalityName || "SQUADMATE",
          compatibility: 94 - (i * 5),
          playstyleLabels: p.dnaProfile?.badges || [],
          synergyExplanation: "Perfect duo sync on high-mobility and tactics deployment."
        }));
      setMatches(simulatedMatches);
      setActiveTab("results");
    } else {
      // Manual trigger form presets to simplify
      setActiveTab("analyze");
    }
  };

  // Clear session profile
  const handleResetProfileAnalysis = () => {
    setProfile(null);
    setRecommendations([]);
    setMatches([]);
    setActiveTab("analyze");
  };

  // Tracking Click Logs
  const handleTrackRecClick = async (gameName: string) => {
    try {
      await fetch("/api/analytics/click", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gameName })
      });
    } catch (err) {
      console.error("Error logging rec click:", err);
    }
  };

  // Admin Callbacks: Edit/Save CMS settings
  const handleSaveCmsConfig = async (updatedCms: CmsContent) => {
    try {
      const res = await fetch("/api/cms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedCms)
      });
      if (res.ok) {
        const loaded = await res.json();
        setCms(loaded);
      }
    } catch (err) {
      console.error("Error saving CMS configuration:", err);
    }
  };

  // Admin Callbacks: Game Catalog manipulation
  const handleAddGame = async (gameObj: Omit<Game, "id">) => {
    try {
      const res = await fetch("/api/games", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(gameObj)
      });
      if (res.ok) {
        fetchServerData();
      }
    } catch (err) {
      console.error("Error adding game register:", err);
    }
  };

  const handleUpdateGame = async (id: string, gameObj: Partial<Game>) => {
    try {
      const res = await fetch(`/api/games/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(gameObj)
      });
      if (res.ok) {
        fetchServerData();
      }
    } catch (err) {
      console.error("Error updating game register:", err);
    }
  };

  const handleDeleteGame = async (id: string) => {
    try {
      const res = await fetch(`/api/games/${id}`, { method: "DELETE" });
      if (res.ok) {
        fetchServerData();
      }
    } catch (err) {
      console.error("Error deleting game register:", err);
    }
  };

  // Admin Callbacks: Delete profiles
  const handleDeleteProfile = async (id: string) => {
    try {
      const res = await fetch(`/api/profiles/${id}`, { method: "DELETE" });
      if (res.ok) {
        fetchServerData();
        if (profile && profile.id === id) {
          setProfile(null);
        }
      }
    } catch (err) {
      console.error("Error deleting user profile:", err);
    }
  };



  if (!cms) {
    return (
      <div className="min-h-screen bg-[#0a0b10] text-[#06b6d4] flex flex-col justify-center items-center font-mono tracking-widest text-xs font-bold">
        <Sparkles className="h-6 w-6 animate-spin mb-4 text-cyan-400" />
        <span>BOOTING GAMEDNA AI CORE PROTOCOLS...</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#0a0b10] text-[#e2e8f0] relative overflow-hidden font-sans select-none">
      
      {/* Immersive UI Neon Ambient Glow Spots */}
      <div className="glow-spot-left" />
      <div className="glow-spot-right" />
      
      {/* Dynamic Header */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        hasProfile={profile !== null}
      />

      {/* Main Pages Layout Router */}
      <main className="flex-grow z-10">

        {/* VIEW B: PROFILE SETUP FORM */}
        {activeTab === "analyze" && (
          <ProfileSetupForm
            onAnalyze={handleProfileSetupSubmit}
            gameLibrary={allGames}
          />
        )}

        {/* VIEW C: AI WOW SCANNING SCREEN */}
        {activeTab === "analysis_scanning" && pendingFormData && (
          <AnalysisScanning
            username={pendingFormData.username}
            onFinish={triggerDnaAnalysisExecution}
          />
        )}

        {/* VIEW D: RESULTS REPORT DASHBOARD */}
        {activeTab === "results" && profile && (
          <div className="mx-auto max-w-7xl px-4 py-12 md:px-8">
            <IdentityResultCard
              profile={profile}
              onReset={handleResetProfileAnalysis}
            />
            
            <RecommendationsView
              recommendations={recommendations}
              allGames={allGames}
              onTrackClick={handleTrackRecClick}
            />

            <MatchmakingView
              matches={matches}
            />
          </div>
        )}



      </main>

      {/* Dynamic Footer */}
      <Footer
        setActiveTab={setActiveTab}
        hasProfile={profile !== null}
      />

    </div>
  );
}
