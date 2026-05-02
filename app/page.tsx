'use client';

import { useState } from 'react';
import { Sparkles, Globe, Share2, Home, Camera, BarChart3 } from 'lucide-react';
import Navbar from '../components/Navbar';

export default function LighthouseDashboard() {
  const [input, setInput] = useState('');
  const [voice, setVoice] = useState<'Professional' | 'Executive'>('Professional');
  const [data, setData] = useState<any>(null);
  const [status, setStatus] = useState('');

  const generate = async () => {
    setStatus('Agent engaged...');
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
      setData(json);
    } catch (err) {
      console.log("Connection Error:", err);
      setStatus('Connection failed');
    } finally {
      setStatus('');
    }
  };

  return (
    <div className="min-h-screen lighthouse-bg font-sans transition-colors duration-500 pb-20">
      <Navbar voice={voice} setVoice={setVoice} />

      <div className="max-w-5xl mx-auto p-4 md:p-12">
        {/* Input Card */}
        <div className="bg-white/80 backdrop-blur-md rounded-[2.5rem] p-8 border border-white/40 shadow-2xl">
          <div className="relative mb-10">
            <h2 className="text-slate-900 font-black text-2xl tracking-tighter mb-4 uppercase">
              {voice === 'Professional' ? 'Ivy Aria Suite' : 'Ryan Alexander Analysis'}
            </h2>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={voice === 'Professional' ? "Describe the dream lifestyle..." : "Input property data and URLs..."}
              className="w-full h-32 p-5 text-slate-700 bg-slate-50/50 rounded-2xl border-none focus:ring-2 focus:ring-blue-500 transition-all resize-none mb-4 shadow-inner"
            />
            <button onClick={generate} className="w-full bg-slate-900 hover:bg-blue-600 text-white font-black py-5 rounded-2xl transition-all flex items-center justify-center gap-2 shadow-xl hover:-translate-y-0.5 active:translate-y-0">
              {status ? <span className="animate-pulse">{status}</span> : <><Sparkles size={18} /> Generate Marketing Suite</>}
            </button>
          </div>

          {data && (
            <div className="space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-1000">

              {/* Feature Chips */}
              <div className="flex flex-wrap gap-2 justify-center">
                {data.highlights?.map((item: string, i: number) => (
                  <span key={i} className="bg-blue-50/50 text-blue-700 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-blue-100/50">
                    {item}
                  </span>
                ))}
              </div>

              {/* Hero Image with Tag */}
              <div className="relative h-80 w-full overflow-hidden rounded-[2rem] bg-slate-100 shadow-lg border border-white/20">
                <img
                  src={data.heroImage?.startsWith('http') ? data.heroImage : "https://images.unsplash.com/photo-1600585154340-be6199f7d009?auto=format&fit=crop&q=80&w=1200"}
                  alt={data.address || "Property Preview"}
                  className="h-full w-full object-cover transition-all duration-1000 hover:scale-105"
                  onError={(e) => { (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1600585154340-be6199f7d009?auto=format&fit=crop&q=80&w=1200"; }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent" />

                {/* Floating Tag */}
                <div className="absolute top-6 left-6 bg-white/90 backdrop-blur-md px-4 py-2 rounded-full flex items-center gap-2 border border-white shadow-xl">
                  <Camera size={14} className="text-blue-600 animate-pulse" />
                  <span className="text-[10px] font-black uppercase text-slate-800 tracking-wider">
                    {data.address ? 'Verified Listing' : 'Analysis Preview'}
                  </span>
                </div>

                <div className="absolute bottom-8 left-8">
                  <h3 className="text-white font-black text-3xl uppercase tracking-tighter">{data.address || "Property Analysis"}</h3>
                </div>
              </div>

              {/* Specs Grid */}
              <div className="grid grid-cols-3 gap-4">
                <StatCard label="Beds" value={data.specs?.beds || '—'} />
                <StatCard label="Baths" value={data.specs?.baths || '—'} />
                <StatCard label="Property Vibe" value={data.propertyVibe} />
              </div>

              {/* Content Sections */}
              <div className="grid md:grid-cols-5 gap-8">
                <div className="md:col-span-3 space-y-8">
                  <ContentBox title="MLS Official Description" icon={<Home size={16} />} content={data.mlsDescription} />

                  {/* Social Mockup Container */}
                  <div className="p-8 bg-slate-50 rounded-3xl border border-slate-100">
                    <div className="flex items-center gap-2 text-slate-400 font-bold text-[10px] uppercase tracking-widest mb-4">
                      <Globe size={16} /> Instagram Marketing
                    </div>
                    <div className="flex flex-col md:flex-row gap-6 items-start">
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-pink-500 to-yellow-500 flex-shrink-0 shadow-lg" />
                      <p className="text-slate-600 text-sm italic leading-relaxed">
                        {data.instagramCaption}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="md:col-span-2 space-y-6">
                  {/* Technical/Ryan Panel */}
                  <div className="p-8 bg-slate-900 rounded-[2rem] text-white shadow-2xl h-full border border-white/5">
                    <div className="flex items-center gap-2 mb-6 border-b border-slate-800 pb-4">
                      <BarChart3 size={18} className="text-blue-400" />
                      <h3 className="font-black text-xs uppercase tracking-widest">Executive Insights</h3>
                    </div>
                    <div className="space-y-6">
                      <div>
                        <span className="text-[10px] text-slate-500 font-bold uppercase block mb-1">TikTok Logic</span>
                        <div className="space-y-3">
                          {data.tiktokScript?.map((step: string, i: number) => (
                            <p key={i} className="text-[11px] text-slate-400 flex gap-3">
                              <span className="text-blue-500 font-mono">0{i + 1}</span> {step}
                            </p>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Sub-components
function StatCard({ label, value }: { label: string, value: any }) {
  return (
    <div className="bg-slate-50 p-6 rounded-[1.5rem] border border-slate-100 text-center hover:bg-white transition-colors group">
      <span className="block text-[10px] uppercase tracking-[0.2em] text-slate-400 font-black mb-1 group-hover:text-blue-500 transition-colors">{label}</span>
      <span className="text-xl font-black text-slate-900">{value}</span>
    </div>
  );
}

function ContentBox({ title, icon, content }: { title: string, icon: any, content: string }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-slate-400 font-black text-[10px] uppercase tracking-widest px-2">
        {icon} {title}
      </div>
      <div className="p-8 bg-white rounded-[2rem] text-slate-600 text-lg leading-relaxed border border-slate-100 shadow-sm font-serif italic">
        "{content}"
      </div>
    </div>
  );
}