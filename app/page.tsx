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

  return (
    <div className="min-h-screen bg-[#020617] text-slate-300 font-sans selection:bg-indigo-500/30 pb-20">
      <Navbar voice={voice} setVoice={setVoice} />

      <main className="max-w-6xl mx-auto p-6 md:p-12">
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
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 animate-in fade-in duration-1000">

            {/* Sidebar: Technical Specifications */}
            <aside className="lg:col-span-4 space-y-8">
              <div className="border border-slate-800 p-6 bg-slate-900/20 shadow-xl">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-indigo-400 font-black text-xs uppercase tracking-widest">Specifications</h3>
                  <BarChart3 size={14} className="text-slate-600" />
                </div>

                <div className="space-y-4 font-mono text-xs mb-8">
                  <div className="flex justify-between border-b border-slate-800/50 pb-2">
                    <span className="text-slate-500 uppercase">Status</span>
                    <span className="text-emerald-400 font-bold">AVAILABLE</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-800/50 pb-2">
                    <span className="text-slate-500 uppercase">Vibe</span>
                    <span className="text-white uppercase">{data.propertyVibe}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-800/50 pb-2">
                    <span className="text-slate-500 uppercase">Beds/Baths</span>
                    <span className="text-white">{data.specs?.beds}/{data.specs?.baths}</span>
                  </div>
                </div>

                {/* Feature Chips in Sidebar */}
                <div className="flex flex-wrap gap-2 mb-8">
                  {data.highlights?.map((item: string, i: number) => (
                    <span key={i} className="bg-indigo-500/10 text-indigo-400 px-3 py-1 rounded-sm text-[9px] font-bold uppercase tracking-widest border border-indigo-500/20">
                      {item}
                    </span>
                  ))}
                </div>

                {/* Sidebar Image with Floating Tag */}
                <div className="relative aspect-[4/5] overflow-hidden border border-slate-800 group shadow-2xl bg-slate-950">
                  <img
                    src={data.heroImage?.startsWith('http') ? data.heroImage : "https://images.unsplash.com/photo-1600585154340-be6199f7d009?auto=format&fit=crop&q=80&w=1200"}
                    alt={data.address || "Property Preview"}
                    className="h-full w-full object-cover transition-all duration-1000 grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100 group-hover:scale-105"
                    onError={(e) => { (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1600585154340-be6199f7d009?auto=format&fit=crop&q=80&w=1200"; }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-80" />

                  <div className="absolute top-4 left-4 bg-indigo-600 px-3 py-1 rounded-sm flex items-center gap-2 shadow-lg border border-indigo-400/50">
                    <Camera size={10} className="text-white" />
                    <span className="text-[8px] font-black uppercase text-white tracking-widest">
                      {data.address ? 'VERIFIED_UNIT' : 'PREVIEW_GEN'}
                    </span>
                  </div>

                  <div className="absolute bottom-4 left-4 right-4">
                    <h3 className="text-white font-black text-sm uppercase tracking-tighter truncate">
                      {data.address || "ANALYSIS_PENDING"}
                    </h3>
                  </div>
                </div>
              </div>

              {/* Technical Metrics Panel */}
              <div className="p-6 bg-slate-900 border border-slate-800 rounded-sm">
                <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4">TikTok Script_</h4>
                <div className="space-y-4">
                  {data.tiktokScript?.map((step: string, i: number) => (
                    <div key={i} className="flex gap-3 items-start">
                      <span className="text-indigo-500 font-mono text-[10px] mt-1">0{i + 1}</span>
                      <p className="text-[11px] text-slate-400 leading-tight">{step}</p>
                    </div>
                  ))}
                </div>
              </div>
            </aside>

            {/* Main Content Area */}
            <div className="lg:col-span-8 space-y-12">
              <ContentBox
                title="Official Narrative Suite"
                icon={<Home size={16} />}
                content={data.mlsDescription}
              />

              <div className="border-t border-slate-800 pt-10">
                <div className="flex items-center gap-2 text-indigo-500 font-black text-[10px] uppercase tracking-widest mb-6">
                  <Globe size={16} /> Distribution Channel: Instagram
                </div>
                <div className="grid md:grid-cols-4 gap-8 items-start">
                  <div className="w-full aspect-square bg-gradient-to-br from-indigo-600 to-slate-900 border border-slate-800 rounded-sm flex items-center justify-center p-4">
                    <BarChart3 className="text-indigo-400 opacity-20 size-12" />
                  </div>
                  <div className="md:col-span-3">
                    <p className="text-slate-400 text-lg leading-relaxed font-serif italic">
                      "{data.instagramCaption}"
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-6">
                <StatCard label="Unit_Beds" value={data.specs?.beds || '—'} />
                <StatCard label="Unit_Baths" value={data.specs?.baths || '—'} />
                <StatCard label="Unit_Sqft" value={data.specs?.sqft || '—'} />
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