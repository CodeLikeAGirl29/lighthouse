'use client';

import { useState } from 'react';
import { Sparkles, Globe, Share2, Home, BarChart3, ChevronRight, Camera } from 'lucide-react';
import Navbar from '../components/Navbar';

export default function LighthouseDashboard() {
  const [input, setInput] = useState('');
  const [voice, setVoice] = useState<'Professional' | 'Executive'>('Professional');
  const [data, setData] = useState<any>(null);
  const [status, setStatus] = useState('');

  const generate = async () => {
    setStatus('AGENT_ANALYZING...');
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        body: JSON.stringify({ propertyData: input, voice }),
      });

      if (!res.ok) {
        const errorText = await res.text();
        console.log("Server Error:", errorText);
        setStatus('Error: Check server console');
        return;
      }

      const json = await res.json();
      console.log("DEBUG_AI_PAYLOAD:", json); // check your browser console (F12)
      setData(json);
    } catch (err) {
      console.log("Connection Error:", err);
      setStatus('Connection failed');
    } finally {
      setStatus('');
    }
  };

  const handleTwitterShare = () => {
    const text = encodeURIComponent(`${data.instagramCaption}\n\n#RealEstate #PropTech`);
    window.open(`https://twitter.com/intent/tweet?text=${text}`, '_blank');
  };

  const handleInstagramRedirect = () => {
    // Copy to clipboard first so they can just "Paste" when they get to IG
    navigator.clipboard.writeText(data.instagramCaption);
    alert("Caption copied to clipboard! Redirecting to Instagram...");
    window.open(`https://www.instagram.com/reels/create/`, '_blank');
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-300 font-sans selection:bg-indigo-500/30 pb-20">
      <Navbar voice={voice} setVoice={setVoice} />

      <main className="max-w-6xl mx-auto p-6 md:p-12">
        <div className="w-full bg-indigo-950/20 border-b border-indigo-500/10 py-2 overflow-hidden whitespace-nowrap">
          <div className="flex animate-marquee gap-12 items-center">
            {['FL_PANHANDLE_INDEX: +2.4%', 'FWB_MEDIAN: $412K', 'DESTIN_DOM: 42_DAYS', 'INTEREST_RATE: 6.8%'].map((stat, i) => (
              <span key={i} className="text-[9px] font-mono text-indigo-400/60 tracking-[0.3em]">
                {stat} <span className="text-slate-800 ml-4">|</span>
              </span>
            ))}
          </div>
        </div>
        {/* Input Area: The Drafting Table */}
        <div className="border-l-2 border-indigo-500/50 pl-6 mb-16">
          <h2 className="text-white font-black text-4xl tracking-tighter uppercase mb-2">
            Terminal <span className="text-indigo-500">_</span>
          </h2>
          <p className="text-slate-500 text-sm font-mono mb-8">ENTRY_ID: {voice.toUpperCase()}_ENGINE_V3</p>

          <div className="relative group">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={voice === 'Professional' ? "Describe the dream lifestyle..." : "Input property data or URLs..."}
              className="w-full h-40 p-6 bg-slate-900/50 border border-slate-800 focus:border-indigo-500 outline-none transition-all font-mono text-sm tracking-tight placeholder:text-slate-700"
            />
            <button onClick={generate} className="mt-4 w-full md:w-auto px-12 py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-black uppercase tracking-widest text-xs transition-all flex items-center justify-center gap-3 group-hover:shadow-[0_0_20px_rgba(79,70,229,0.4)]">
              {status ? <span className="animate-pulse">{status}</span> : <><Sparkles size={16} /> Execute Generation</>}
            </button>
          </div>
        </div>

        {data && (
          <div className="mt-12 animate-in fade-in slide-in-from-bottom-8 duration-1000">

            {/* 1. MARKET DATA TICKER */}
            <div className="w-full bg-indigo-950/10 border border-slate-800 py-3 px-6 mb-12 overflow-hidden">
              <div className="flex justify-between items-center">
                <div className="flex gap-8 items-center">
                  {['FL_PANHANDLE: +2.4%', 'FWB_MEDIAN: $412K', 'DOM: 42_DAYS'].map((stat, i) => (
                    <span key={i} className="text-[9px] font-mono text-indigo-400/60 tracking-[0.3em] uppercase">
                      {stat}
                    </span>
                  ))}
                </div>
                <span className="text-[9px] font-mono text-slate-700 uppercase">Live_Analysis_Active</span>
              </div>
            </div>

            {/* 2. DUAL-TONE COMMAND CENTER */}
            <div className="grid lg:grid-cols-12 gap-0 border border-slate-800 divide-y lg:divide-y-0 lg:divide-x divide-slate-800 bg-[#020617] shadow-2xl">

              {/* LEFT: THE CREATIVE STUDIO (IVY ARIA MODE) */}
              <div className="lg:col-span-7 p-8 md:p-12 bg-slate-900/10">
                <div className="flex items-center justify-between mb-10">
                  <div className="flex items-center gap-3">
                    <div className="h-[2px] w-8 bg-indigo-500" />
                    <span className="text-[10px] font-black uppercase tracking-[0.5em] text-indigo-500">Creative_Studio</span>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={handleTwitterShare} className="p-2 border border-slate-800 hover:border-indigo-500 text-slate-500 hover:text-indigo-400 transition-all">
                      <Share2 size={14} />
                    </button>
                    <button onClick={handleInstagramRedirect} className="p-2 border border-slate-800 hover:border-pink-500 text-slate-500 hover:text-pink-400 transition-all">
                      <Camera size={14} />
                    </button>
                  </div>
                </div>

                <div className="space-y-12">
                  <div className="grid md:grid-cols-2 gap-8">
                    <div>
                      <h5 className="text-[10px] font-black text-indigo-500/50 uppercase tracking-widest mb-4">IG_Distribution</h5>
                      <p className="text-sm leading-relaxed text-slate-400 font-sans">{data.instagramCaption}</p>
                    </div>
                    <div className="relative aspect-video border border-slate-800 overflow-hidden bg-slate-950">
                      <img
                        src={data.heroImage || "https://images.unsplash.com/photo-1600585154340-be6199f7d009"}
                        className="w-full h-full object-cover opacity-40 hover:opacity-100 transition-opacity duration-700"
                      />
                    </div>
                  </div>

                  <div className="space-y-12">
                    {/* ADD THE CONTENTBOX HERE! */}
                    <ContentBox
                      title="Primary_Narrative"
                      icon={<Home size={14} />}
                      content={data.mlsDescription}
                    />
                  </div>
                </div>
              </div>

              {/* RIGHT: THE STRATEGY LAB (RYAN ALEXANDER MODE) */}
              <div className="lg:col-span-5 p-8 md:p-12 bg-black/20">
                <div className="flex items-center gap-3 mb-10">
                  <div className="h-[2px] w-8 bg-slate-700" />
                  <span className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-500">Strategy_Lab</span>
                </div>

                <div className="space-y-10">
                  {/* Market Comparison Section */}
                  <div className="border-l-2 border-indigo-500/30 pl-6 group">
                    <h4 className="text-[10px] font-bold text-indigo-400 uppercase mb-3 tracking-widest group-hover:text-indigo-300 transition-colors">Competitive_Edge</h4>
                    <p className="text-sm text-slate-400 leading-relaxed font-mono tracking-tight">
                      {data.competitiveEdge || "Extracting unique value propositions..."}
                    </p>
                  </div>

                  <div className="border-l-2 border-emerald-500/30 pl-6 group">
                    <h4 className="text-[10px] font-bold text-emerald-400 uppercase mb-3 tracking-widest group-hover:text-emerald-300 transition-colors">Price_Logic</h4>
                    <p className="text-sm text-slate-400 leading-relaxed font-mono tracking-tight">
                      {data.priceAnalysis || "Calculations based on area comps and condition..."}
                    </p>
                  </div>

                  {/* Technical Specs Checklist */}
                  <div className="bg-slate-900/50 p-6 border border-slate-800 shadow-inner">
                    <div className="grid grid-cols-2 gap-6">
                      <StatCard label="UNITS_BED" value={data.specs?.beds || '0'} />
                      <StatCard label="UNITS_BATH" value={data.specs?.baths || '0'} />
                    </div>
                    <div className="mt-4 pt-4 border-t border-slate-800 flex justify-between items-center">
                      <span className="text-[9px] font-mono text-slate-600 uppercase tracking-widest">Property_Vibe</span>
                      <span className="text-[10px] font-mono text-emerald-500 uppercase">{data.propertyVibe}</span>
                    </div>
                  </div>

                  {/* TikTok Storyboard */}
                  <div className="pt-6">
                    <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-6 flex items-center gap-2">
                      <Share2 size={12} className="text-indigo-500" /> Content_Sequencing
                    </h4>
                    <div className="space-y-4">
                      {data.tiktokScript?.map((step: string, i: number) => (
                        <div key={i} className="flex gap-4 items-start group">
                          <span className="text-indigo-500 font-mono text-[10px] bg-indigo-500/5 px-2 py-1 border border-indigo-500/10">0{i + 1}</span>
                          <p className="text-[11px] text-slate-500 leading-tight group-hover:text-slate-300 transition-colors">{step}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

            </div>

            {/* 3. SYSTEM FOOTER */}
            <div className="mt-8 flex justify-between items-center border-t border-slate-900 pt-6">
              <div className="text-[8px] font-mono text-slate-700 uppercase tracking-widest">
                Lighthouse_AI // build_version: 3.0.4 // engine: groq_120b
              </div>
              <div className="flex gap-4">
                <div className="flex items-center gap-2">
                  <div className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[8px] font-mono text-slate-600 uppercase">Secure_Link_Established</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

// Architectural Sub-components
function StatCard({ label, value }: { label: string, value: any }) {
  return (
    <div className="bg-slate-900/50 p-6 border border-slate-800 hover:border-indigo-500/50 transition-all group">
      <span className="block text-[9px] uppercase tracking-[0.3em] text-slate-600 font-black mb-2 group-hover:text-indigo-400">{label}</span>
      <span className="text-xl font-mono text-white">{value}</span>
    </div>
  );
}

function ContentBox({ title, icon, content }: { title: string, icon: any, content: string }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-slate-500 font-black text-[10px] uppercase tracking-widest">
        {icon} {title}
      </div>
      <div className="text-3xl md:text-4xl font-light text-white leading-tight tracking-tighter">
        {content}
      </div>
    </div>
  );
}