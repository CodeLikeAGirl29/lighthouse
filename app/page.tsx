"use client";

import { useState } from "react";
import { Sparkles, Share2, Camera, Home, MapPin } from "lucide-react";
import Navbar from "../components/Navbar";

export default function LighthouseDashboard() {
  const [input, setInput] = useState("");
  const [voice, setVoice] = useState<"Professional" | "Executive">(
    "Professional",
  );
  const [data, setData] = useState<any>(null);
  const [status, setStatus] = useState("");

  const generate = async () => {
    // Prevent empty submissions from breaking your API
    if (!input.trim()) {
      setStatus("Please enter a URL or description");
      setTimeout(() => setStatus(""), 3000);
      return;
    }

    setStatus("AGENT_ANALYZING...");
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ propertyData: input, voice }),
      });

      if (!res.ok) {
        // ... (keep your existing error handling here)
      }

      const json = await res.json();
      console.log("DEBUG_AI_PAYLOAD:", json);
      setData(json);

      // --- ADD THIS NEW BLOCK TO SAVE TO CANVAS ---
      try {
        const existing = JSON.parse(
          localStorage.getItem("lighthouse_canvas") || "[]",
        );
        const newListing = {
          id: Date.now().toString(),
          date: new Date().toLocaleDateString(),
          input: input, // Save the URL or description they typed
          data: json, // Save the actual AI output
        };
        localStorage.setItem(
          "lighthouse_canvas",
          JSON.stringify([newListing, ...existing]),
        );
      } catch (saveErr) {
        console.error("Failed to save to canvas:", saveErr);
      }
      // --------------------------------------------
    } catch (err) {
      console.error("Connection Error:", err);
      setStatus("Connection failed");
      setTimeout(() => setStatus(""), 4000);
    } finally {
      if (status === "AGENT_ANALYZING...") {
        setStatus("");
      }
    }
  };

  const handleTwitterShare = () => {
    const text = encodeURIComponent(
      `${data.instagramCaption}\n\n#RealEstate #PropTech`,
    );
    window.open(`https://twitter.com/intent/tweet?text=${text}`, "_blank");
  };

  const handleInstagramRedirect = () => {
    navigator.clipboard.writeText(data.instagramCaption);
    alert("Caption copied to clipboard! Redirecting to Instagram...");
    window.open(`https://www.instagram.com/reels/create/`, "_blank");
  };

  return (
    <main
      className="relative min-h-screen w-full overflow-x-hidden flex flex-col justify-start bg-cover bg-center bg-fixed font-sans"
      style={{
        backgroundImage:
          "linear-gradient(rgba(15, 23, 42, 0.6), rgba(15, 23, 42, 0.8)), url('https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1920&q=80')",
      }}
    >
      <Navbar voice={voice} setVoice={setVoice} />

      {/* Left Pinned Social Media Sidebar */}
      <div className="fixed left-4 bottom-12 z-40 hidden lg:flex flex-col items-center space-y-8 text-xs font-semibold text-gray-300">
        <span className="transform -rotate-90 origin-left translate-x-[6px] -translate-y-12 whitespace-nowrap tracking-widest uppercase text-[11px] opacity-80">
          Lighthouse OS // V3
        </span>
        <div className="w-[1px] h-12 bg-white/40 !mt-8"></div>
        <a
          href="https://instagram.com/fiercely.lindseyy"
          className="hover:text-purple-400 transition font-mono text-sm"
        >
          in
        </a>
        <a
          href="https://linkedin.com/in/lindsey-howard"
          className="hover:text-purple-400 transition font-mono text-sm"
        >
          IG
        </a>
        <a
          href="https://lindseyk.dev"
          className="hover:text-purple-400 transition text-sm"
        >
          🌐
        </a>
      </div>

      {/* Central Hero Content Section */}
      <div className="max-w-6xl w-full mx-auto px-6 lg:px-12 flex flex-col justify-center mt-32 pb-24">
        {!data && (
          <div className="animate-in fade-in duration-700">
            <h1 className="text-5xl md:text-6xl font-bold text-white tracking-tight leading-tight">
              Analyze properties instantly
            </h1>
            <p className="text-xl text-gray-200 mt-3 font-medium opacity-90">
              The ultimate AI guide for your real estate market
            </p>
          </div>
        )}

        {/* Dynamic Widget Grid Container */}
        <div
          className={`w-full max-w-5xl transition-all duration-700 ${
            data ? "mt-8" : "mt-12"
          }`}
        >
          {/* Tab Headings */}
          <div className="flex space-x-1">
            <button className="bg-[#581c87]/80 border-b-2 border-purple-400 text-white font-bold text-xs uppercase tracking-wider px-6 py-3.5 transition">
              Property Data
            </button>
            <button className="bg-[#581c87]/40 hover:bg-[#581c87]/60 text-gray-300 font-bold text-xs uppercase tracking-wider px-6 py-3.5 transition backdrop-blur-sm">
              Batch Upload
            </button>
          </div>

          {/* Search Dashboard Box (Replaces old Draft Table) */}
          <div className="bg-[#581c87]/60 backdrop-blur-md p-8 shadow-2xl w-full border border-purple-500/20">
            <p className="text-white font-semibold text-lg mb-4 flex justify-between items-center">
              <span>What are you looking to analyze?</span>
              <span className="text-xs font-mono text-purple-300 opacity-70">
                ENTRY_ID: {voice.toUpperCase()}_ENGINE
              </span>
            </p>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Main Input Area spanning 3 columns */}
              <div className="md:col-span-3">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    // Trigger generate on Enter key, but only if it's not already loading
                    if (e.key === "Enter" && !status) {
                      generate();
                    }
                  }}
                  placeholder={
                    voice === "Professional"
                      ? "Paste Zillow/Redfin URL or describe the dream lifestyle..."
                      : "Input raw MLS data or property URL..."
                  }
                  className="w-full bg-white/90 text-gray-900 h-12 px-4 appearance-none text-sm font-medium focus:outline-none focus:ring-2 focus:ring-purple-400 placeholder:text-gray-500 shadow-inner"
                />
              </div>

              {/* Submit Action Button */}
              <button
                onClick={generate}
                disabled={!!status}
                className="w-full h-12 bg-[#7c3aed] hover:bg-[#6d28d9] disabled:bg-purple-900 transition text-white font-semibold flex items-center justify-center space-x-2 text-sm shadow-md"
              >
                {status ? (
                  <span className="animate-pulse tracking-wider text-xs">
                    {status}
                  </span>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Generate</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* RESULTS RENDER BLOCK */}
        {data && (
          <div className="mt-8 animate-in fade-in slide-in-from-bottom-8 duration-1000">
            {/* Market Data Ticker */}
            <div className="w-full bg-[#581c87]/40 backdrop-blur-md border border-purple-500/30 py-3 px-6 mb-8 overflow-hidden">
              <div className="flex justify-between items-center">
                <div className="flex gap-8 items-center text-white">
                  {[
                    "FL_PANHANDLE: +2.4%",
                    "FWB_MEDIAN: $412K",
                    "DOM: 42_DAYS",
                  ].map((stat, i) => (
                    <span
                      key={i}
                      className="text-[10px] font-mono text-purple-200 tracking-[0.2em] uppercase"
                    >
                      {stat}
                    </span>
                  ))}
                </div>
                <span className="text-[10px] font-mono text-white/50 uppercase">
                  Live_Analysis_Active
                </span>
              </div>
            </div>

            {/* DUAL-TONE COMMAND CENTER (Re-styled for Adventure Atlas Theme) */}
            <div className="grid lg:grid-cols-12 gap-0 border border-purple-500/30 shadow-2xl bg-[#0f172a]/80 backdrop-blur-xl">
              {/* LEFT: THE CREATIVE STUDIO */}
              <div className="lg:col-span-7 p-8 md:p-12 border-b lg:border-b-0 lg:border-r border-purple-500/30">
                <div className="flex items-center justify-between mb-10">
                  <div className="flex items-center gap-3">
                    <div className="h-[2px] w-8 bg-purple-400" />
                    <span className="text-[10px] font-black uppercase tracking-[0.5em] text-purple-400">
                      Creative_Studio
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={handleTwitterShare}
                      className="p-2 bg-white/5 hover:bg-white/10 text-white rounded transition-all"
                    >
                      <Share2 size={16} />
                    </button>
                    <button
                      onClick={handleInstagramRedirect}
                      className="p-2 bg-white/5 hover:bg-[#e1306c]/80 text-white rounded transition-all"
                    >
                      <Camera size={16} />
                    </button>
                  </div>
                </div>

                <div className="space-y-12">
                  <div className="grid md:grid-cols-2 gap-8">
                    <div>
                      <h5 className="text-[10px] font-black text-purple-300 uppercase tracking-widest mb-4">
                        IG_Distribution
                      </h5>
                      <p className="text-sm leading-relaxed text-gray-300">
                        {data.instagramCaption}
                      </p>
                    </div>
                    <div className="relative aspect-video border border-purple-500/30 overflow-hidden bg-black/50 shadow-lg">
                      <img
                        src={
                          data.heroImage
                            ? `/api/image-proxy?url=${encodeURIComponent(
                                data.heroImage,
                              )}`
                            : "https://images.unsplash.com/photo-1600585154340-be6199f7d009"
                        }
                        alt="Property Hero"
                        className="w-full h-full object-cover opacity-80 hover:opacity-100 transition-opacity duration-700"
                      />
                    </div>
                  </div>

                  <ContentBox
                    title="Primary_Narrative"
                    icon={<Home size={14} />}
                    content={data.mlsDescription}
                  />
                </div>
              </div>

              {/* RIGHT: THE STRATEGY LAB */}
              <div className="lg:col-span-5 p-8 md:p-12 bg-black/40">
                <div className="flex items-center gap-3 mb-10">
                  <div className="h-[2px] w-8 bg-gray-400" />
                  <span className="text-[10px] font-black uppercase tracking-[0.5em] text-gray-300">
                    Strategy_Lab
                  </span>
                </div>

                <div className="space-y-10">
                  <div className="border-l-2 border-purple-400 pl-6 group">
                    <h4 className="text-[10px] font-bold text-purple-300 uppercase mb-3 tracking-widest">
                      Competitive_Edge
                    </h4>
                    <p className="text-sm text-gray-300 leading-relaxed font-mono tracking-tight">
                      {data.competitiveEdge ||
                        "Extracting unique value propositions..."}
                    </p>
                  </div>

                  <div className="border-l-2 border-blue-400 pl-6 group">
                    <h4 className="text-[10px] font-bold text-blue-300 uppercase mb-3 tracking-widest">
                      Price_Logic
                    </h4>
                    <p className="text-sm text-gray-300 leading-relaxed font-mono tracking-tight">
                      {data.priceAnalysis ||
                        "Calculations based on area comps and condition..."}
                    </p>
                  </div>

                  <div className="bg-white/5 p-6 border border-white/10 shadow-inner rounded-sm">
                    <div className="grid grid-cols-2 gap-6">
                      <StatCard
                        label="UNITS_BED"
                        value={data.specs?.beds || "0"}
                      />
                      <StatCard
                        label="UNITS_BATH"
                        value={data.specs?.baths || "0"}
                      />
                    </div>
                    <div className="mt-4 pt-4 border-t border-white/10 flex justify-between items-center">
                      <span className="text-[9px] font-mono text-gray-400 uppercase tracking-widest">
                        Property_Vibe
                      </span>
                      <span className="text-[11px] font-bold text-purple-300 uppercase">
                        {data.propertyVibe}
                      </span>
                    </div>
                  </div>

                  <div className="pt-6">
                    <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                      <Share2 size={12} className="text-purple-400" />{" "}
                      Content_Sequencing
                    </h4>
                    <div className="space-y-4">
                      {data.tiktokScript?.map((step: string, i: number) => (
                        <div key={i} className="flex gap-4 items-start group">
                          <span className="text-white font-mono text-[10px] bg-purple-600/80 px-2 py-1 shadow">
                            0{i + 1}
                          </span>
                          <p className="text-[12px] text-gray-300 leading-tight">
                            {step}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

// Sub-components updated with the new theme
function StatCard({ label, value }: { label: string; value: any }) {
  return (
    <div className="bg-black/30 p-4 border border-white/5 hover:border-purple-500/50 transition-all">
      <span className="block text-[9px] uppercase tracking-[0.2em] text-gray-400 font-bold mb-1">
        {label}
      </span>
      <span className="text-xl font-mono text-white">{value}</span>
    </div>
  );
}

function ContentBox({
  title,
  icon,
  content,
}: {
  title: string;
  icon: any;
  content: string;
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-purple-300 font-bold text-[10px] uppercase tracking-widest">
        {icon} {title}
      </div>
      <div className="text-2xl md:text-3xl font-light text-white leading-tight tracking-tight">
        {content}
      </div>
    </div>
  );
}
