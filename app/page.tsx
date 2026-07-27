"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import { Sparkles, Share2, Camera, Home, MapPin } from "lucide-react";
import Navbar from "../components/Navbar";
import BeaconSweep from "../components/BeaconSweep";
import ResultsSkeleton from "../components/ResultsSkeleton";
import type { ListingData } from "../lib/schema";

export default function LighthouseDashboard() {
  const [input, setInput] = useState("");
  const [data, setData] = useState<ListingData | null>(null);
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
      let apiKeys: { firecrawl?: string; groq?: string } = {};
      try {
        const stored = JSON.parse(
          localStorage.getItem("lighthouse_settings") || "{}",
        );
        apiKeys = {
          firecrawl: stored.firecrawlApiKey || undefined,
          groq: stored.groqApiKey || undefined,
        };
      } catch {
        // No saved settings yet — fall back to the server's own keys.
      }

      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ propertyData: input, apiKeys }),
      });

      if (!res.ok) {
        let message = "Something went wrong. Please try again.";
        if (res.status === 429) {
          message = "Too many requests — please wait a moment and try again.";
        } else {
          try {
            const errJson = await res.json();
            if (errJson?.error) message = errJson.error;
          } catch {
            // Response body wasn't JSON — fall back to the generic message above.
          }
        }
        setStatus(message);
        setTimeout(() => setStatus(""), 5000);
        return;
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

      setStatus("");
    } catch (err) {
      console.error("Connection Error:", err);
      setStatus("Connection failed");
      setTimeout(() => setStatus(""), 4000);
    }
  };

  const handleTwitterShare = () => {
    if (!data) return;
    const text = encodeURIComponent(
      `${data.instagramCaption}\n\n#RealEstate #PropTech`,
    );
    window.open(`https://twitter.com/intent/tweet?text=${text}`, "_blank");
  };

  const handleInstagramRedirect = () => {
    if (!data) return;
    navigator.clipboard.writeText(data.instagramCaption);
    alert("Caption copied to clipboard! Redirecting to Instagram...");
    window.open(`https://www.instagram.com/reels/create/`, "_blank");
  };

  const isAnalyzing = status === "AGENT_ANALYZING...";

  const resetForm = () => {
    setInput("");
    setData(null);
    setStatus("");
  };

  return (
    <main className="relative min-h-screen w-full overflow-x-hidden flex flex-col justify-start bg-abyss font-sans">
      <BeaconSweep active={isAnalyzing} />

      <Navbar onNewListing={resetForm} />

      {/* Left Pinned Social Rail */}
      <div className="fixed left-6 bottom-10 z-10 hidden lg:flex flex-col items-start gap-5 text-xs font-semibold text-steel">
        <span
          className="whitespace-nowrap tracking-widest uppercase text-[11px] opacity-80 font-mono"
          style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}
        >
          Lighthouse OS // V3
        </span>
        <div className="w-[1px] h-12 bg-steel/30"></div>
        <a
          href="https://instagram.com/fiercely.lindseyy"
          className="hover:text-beacon transition font-mono text-sm"
        >
          IG
        </a>
        <a
          href="https://linkedin.com/in/lindsey-howard"
          className="hover:text-beacon transition font-mono text-sm"
        >
          in
        </a>
        <a
          href="https://lindseyk.dev"
          className="hover:text-beacon transition text-sm"
        >
          🌐
        </a>
      </div>

      {/* Central Content Section */}
      <div className="relative z-[1] max-w-6xl w-full mx-auto px-6 lg:px-12 flex flex-col justify-center mt-32 pb-24">
        {!data && (
          <div className="animate-in fade-in duration-700">
            <span className="font-mono text-[11px] uppercase tracking-[0.4em] text-beacon">
              Point it at a listing
            </span>
            <h1 className="heading text-5xl md:text-6xl text-foam tracking-tight leading-tight mt-3">
              Analyze properties instantly
            </h1>
            <p className="text-lg text-steel mt-3 font-medium">
              A URL in, a full marketing kit out.
            </p>
          </div>
        )}

        {/* Dynamic Widget Grid Container */}
        <div
          className={`w-full transition-all duration-700 ${
            data || isAnalyzing ? "mt-8" : "mt-12"
          }`}
        >
          {/* Tab Headings */}
          <div className="flex space-x-1">
            <button className="bg-panel border-b-2 border-beacon text-foam font-bold text-xs uppercase tracking-wider px-6 py-3.5 transition font-mono">
              Property Data
            </button>
            <button
              disabled
              title="Coming soon"
              className="bg-panel/40 text-steel/50 font-bold text-xs uppercase tracking-wider px-6 py-3.5 transition font-mono cursor-not-allowed"
            >
              Batch Upload · Soon
            </button>
          </div>

          {/* Search Console */}
          <div className="bg-panel p-8 shadow-2xl w-full border border-steel/15">
            <p className="text-foam font-semibold text-lg mb-4 flex justify-between items-center">
              <span>What are you looking to analyze?</span>
              <span className="text-xs font-mono text-steel opacity-80">
                ENTRY_ID: ANALYSIS_ENGINE
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
                  placeholder="Paste a Zillow/Redfin/Realtor.com URL or describe the property..."
                  className="w-full bg-abyss text-foam h-12 px-4 appearance-none text-sm font-medium border border-steel/20 focus:outline-none focus:ring-2 focus:ring-beacon/60 focus:border-beacon/60 placeholder:text-steel/60 shadow-inner"
                />
              </div>

              {/* Submit Action Button */}
              <button
                onClick={generate}
                disabled={!!status}
                className="w-full h-12 bg-beacon hover:brightness-110 disabled:bg-steel/30 disabled:cursor-not-allowed transition text-abyss font-bold flex items-center justify-center space-x-2 text-sm shadow-md"
              >
                {status ? (
                  <span className="animate-pulse tracking-wider text-xs font-mono">
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
        {isAnalyzing && <ResultsSkeleton />}
        {data && !isAnalyzing && (
          <div className="mt-8 animate-in fade-in slide-in-from-bottom-8 duration-1000">
            {/* Market Data Ticker */}
            <div className="w-full bg-panel border border-steel/15 py-3 px-6 mb-8 overflow-hidden">
              <div className="flex justify-between items-center">
                <div className="flex gap-8 items-center">
                  {[
                    "FL_PANHANDLE: +2.4%",
                    "FWB_MEDIAN: $412K",
                    "DOM: 42_DAYS",
                  ].map((stat, i) => (
                    <span
                      key={i}
                      className="text-[10px] font-mono text-steel tracking-[0.2em] uppercase"
                    >
                      {stat}
                    </span>
                  ))}
                </div>
                <span className="text-[10px] font-mono text-signal uppercase">
                  Live_Analysis_Active
                </span>
              </div>
            </div>

            {/* DUAL-TONE COMMAND CENTER */}
            <div className="grid lg:grid-cols-12 gap-0 border border-steel/15 shadow-2xl bg-panel">
              {/* LEFT: THE CREATIVE STUDIO */}
              <div className="lg:col-span-7 p-8 md:p-12 border-b lg:border-b-0 lg:border-r border-steel/15">
                <div className="flex items-center justify-between mb-10">
                  <div className="flex items-center gap-3">
                    <div className="h-[2px] w-8 bg-beacon" />
                    <span className="text-[10px] font-black uppercase tracking-[0.5em] text-beacon font-mono">
                      Creative_Studio
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={handleTwitterShare}
                      className="p-2 bg-abyss hover:bg-steel/10 text-foam rounded transition-all border border-steel/15"
                    >
                      <Share2 size={16} />
                    </button>
                    <button
                      onClick={handleInstagramRedirect}
                      className="p-2 bg-abyss hover:bg-[#e1306c]/80 text-foam rounded transition-all border border-steel/15"
                    >
                      <Camera size={16} />
                    </button>
                  </div>
                </div>

                <div className="space-y-12">
                  <div className="grid md:grid-cols-2 gap-8">
                    <div>
                      <h5 className="text-[10px] font-black text-beacon uppercase tracking-widest mb-4 font-mono">
                        IG_Distribution
                      </h5>
                      <p className="text-sm leading-relaxed text-steel">
                        {data.instagramCaption}
                      </p>
                    </div>
                    <div className="relative aspect-video border border-steel/15 overflow-hidden bg-abyss shadow-lg">
                      <img
                        src={
                          data.heroImage
                            ? `/api/image-proxy?url=${encodeURIComponent(
                                data.heroImage,
                              )}`
                            : "https://images.unsplash.com/photo-1600585154340-be6199f7d009?auto=format&fit=crop&w=1200&q=80"
                        }
                        alt="Hero shot of the analyzed property"
                        onError={(e) => {
                          const img = e.currentTarget;
                          img.onerror = null; // prevent a loop if the fallback also fails
                          img.src =
                            "https://images.unsplash.com/photo-1600585154340-be6199f7d009?auto=format&fit=crop&w=1200&q=80";
                        }}
                        className="w-full h-full object-cover opacity-90 hover:opacity-100 transition-opacity duration-700"
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
              <div className="lg:col-span-5 p-8 md:p-12 bg-abyss/60">
                <div className="flex items-center gap-3 mb-10">
                  <div className="h-[2px] w-8 bg-signal" />
                  <span className="text-[10px] font-black uppercase tracking-[0.5em] text-signal font-mono">
                    Strategy_Lab
                  </span>
                </div>

                <div className="space-y-10">
                  <div className="border-l-2 border-beacon pl-6 group">
                    <h4 className="text-[10px] font-bold text-beacon uppercase mb-3 tracking-widest font-mono">
                      Competitive_Edge
                    </h4>
                    <p className="text-sm text-steel leading-relaxed font-mono tracking-tight">
                      {data.competitiveEdge ||
                        "Extracting unique value propositions..."}
                    </p>
                  </div>

                  <div className="border-l-2 border-signal pl-6 group">
                    <h4 className="text-[10px] font-bold text-signal uppercase mb-3 tracking-widest font-mono">
                      Price_Logic
                    </h4>
                    <p className="text-sm text-steel leading-relaxed font-mono tracking-tight">
                      {data.priceAnalysis ||
                        "Calculations based on area comps and condition..."}
                    </p>
                  </div>

                  <div className="bg-panel p-6 border border-steel/15 shadow-inner">
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
                    <div className="mt-4 pt-4 border-t border-steel/15">
                      <span className="block text-[9px] font-mono text-steel uppercase tracking-widest mb-1.5">
                        Property_Vibe
                      </span>
                      <span className="text-[11px] font-bold text-beacon uppercase font-mono leading-relaxed">
                        {data.propertyVibe}
                      </span>
                    </div>
                  </div>

                  <div className="pt-6">
                    <h4 className="text-[10px] font-black text-steel uppercase tracking-widest mb-6 flex items-center gap-2 font-mono">
                      <Share2 size={12} className="text-beacon" />{" "}
                      Content_Sequencing
                    </h4>
                    <div className="space-y-4">
                      {data.tiktokScript?.map((step: string, i: number) => (
                        <div key={i} className="flex gap-4 items-start group">
                          <span className="text-abyss font-mono text-[10px] font-bold bg-beacon px-2 py-1 shadow">
                            0{i + 1}
                          </span>
                          <p className="text-[12px] text-steel leading-tight">
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

// Sub-components
function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-abyss p-4 border border-steel/15 hover:border-beacon/50 transition-all">
      <span className="block text-[9px] uppercase tracking-[0.2em] text-steel font-bold mb-1 font-mono">
        {label}
      </span>
      <span className="text-xl font-mono text-foam">{value}</span>
    </div>
  );
}

function ContentBox({
  title,
  icon,
  content,
}: {
  title: string;
  icon: ReactNode;
  content: string;
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-beacon font-bold text-[10px] uppercase tracking-widest font-mono">
        {icon} {title}
      </div>
      <div className="text-2xl md:text-3xl font-light text-foam leading-tight tracking-tight">
        {content}
      </div>
    </div>
  );
}
