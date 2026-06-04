'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import { LayoutGrid, MapPin, Trash2, Clock, BedDouble, Bath } from 'lucide-react';

export default function PropertyCanvas() {
  const [voice, setVoice] = useState<'Professional' | 'Executive'>('Professional');
  const [savedProperties, setSavedProperties] = useState<any[]>([]);
  const [isMounted, setIsMounted] = useState(false);

  // Load saved properties on mount
  useEffect(() => {
    setIsMounted(true);
    try {
      const stored = localStorage.getItem('lighthouse_canvas');
      if (stored) {
        setSavedProperties(JSON.parse(stored));
      }
    } catch (e) {
      console.error("Error loading canvas data", e);
    }
  }, []);

  const deleteProperty = (id: string) => {
    const updated = savedProperties.filter((p) => p.id !== id);
    setSavedProperties(updated);
    localStorage.setItem('lighthouse_canvas', JSON.stringify(updated));
  };

  // Prevent hydration errors by not rendering until client-side loads
  if (!isMounted) return null;

  return (
    <main className="relative min-h-screen w-full bg-[#0f172a] font-sans overflow-x-hidden pb-24">
      {/* Background Glow Effects */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[150px] pointer-events-none"></div>

      <Navbar voice={voice} setVoice={setVoice} />

      <div className="max-w-7xl mx-auto px-6 lg:px-12 pt-32 md:pt-40 relative z-10">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <LayoutGrid className="text-purple-400 size-6" />
              <span className="text-xs font-black uppercase tracking-[0.4em] text-purple-400">Archive</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight">
              Property Canvas
            </h1>
            <p className="text-gray-400 mt-3 font-medium">Your saved Lighthouse analyses and market strategies.</p>
          </div>
          
          <div className="flex items-center gap-2 text-xs font-mono text-purple-300 bg-purple-500/10 px-4 py-2 border border-purple-500/20">
            TOTAL_SAVED: {savedProperties.length}
          </div>
        </div>

        {/* Grid Layout */}
        {savedProperties.length === 0 ? (
          <div className="w-full bg-[#581c87]/10 border border-purple-500/20 backdrop-blur-md p-12 text-center shadow-2xl">
            <p className="text-gray-400 text-lg mb-4">No properties analyzed yet.</p>
            <a href="/" className="inline-block bg-[#7c3aed] hover:bg-[#6d28d9] transition text-white px-6 py-3 text-sm font-semibold shadow-lg">
              Return to Dashboard &rarr;
            </a>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {savedProperties.map((prop) => {
              // Ensure we use the proxy for saved images too
              const imageUrl = prop.data.heroImage 
                ? `/api/image-proxy?url=${encodeURIComponent(prop.data.heroImage)}` 
                : "https://images.unsplash.com/photo-1600585154340-be6199f7d009";

              // Safely format the input string so it fits nicely as a title
              const displayTitle = prop.input.length > 40 
                ? prop.input.substring(0, 40) + "..." 
                : prop.input;

              return (
                <div key={prop.id} className="group bg-[#581c87]/20 backdrop-blur-md border border-purple-500/20 hover:border-purple-500/50 transition-all duration-500 overflow-hidden shadow-2xl flex flex-col">
                  
                  {/* Image Block */}
                  <div className="relative h-56 overflow-hidden bg-black">
                    <img 
                      src={imageUrl} 
                      alt="Property" 
                      className="w-full h-full object-cover opacity-70 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700"
                    />
                    <div className="absolute top-4 right-4 bg-black/80 backdrop-blur-md px-3 py-1 border border-white/10 text-[10px] font-mono text-white tracking-widest uppercase">
                      {prop.data.propertyVibe || "Uncategorized"}
                    </div>
                  </div>

                  {/* Content Block */}
                  <div className="p-6 flex-1 flex flex-col">
                    <div className="flex justify-between items-start mb-4 gap-4">
                      <h3 className="text-sm font-bold text-white leading-tight flex items-start gap-2 break-all">
                        <MapPin className="text-purple-400 size-4 shrink-0 mt-0.5" />
                        {displayTitle || "Manual Entry Analysis"}
                      </h3>
                      <button 
                        onClick={() => deleteProperty(prop.id)}
                        className="text-gray-500 hover:text-red-400 transition-colors p-1"
                        title="Delete Property"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                    
                    <p className="text-xs text-gray-400 line-clamp-3 mb-6">
                      {prop.data.mlsDescription || "No primary narrative generated."}
                    </p>
                    
                    {/* Footer Stats */}
                    <div className="grid grid-cols-3 gap-2 mt-auto border-t border-purple-500/20 pt-4">
                      <div>
                        <span className="block text-[9px] uppercase tracking-widest text-gray-500 font-bold mb-1 flex items-center gap-1"><BedDouble size={10}/> BEDS</span>
                        <span className="text-sm font-mono text-gray-200">{prop.data.specs?.beds || '-'}</span>
                      </div>
                      <div>
                        <span className="block text-[9px] uppercase tracking-widest text-gray-500 font-bold mb-1 flex items-center gap-1"><Bath size={10}/> BATHS</span>
                        <span className="text-sm font-mono text-gray-200">{prop.data.specs?.baths || '-'}</span>
                      </div>
                      <div>
                        <span className="block text-[9px] uppercase tracking-widest text-gray-500 font-bold mb-1 flex items-center gap-1"><Clock size={10}/> SAVED</span>
                        <span className="text-xs font-mono text-gray-200 mt-0.5 block">{prop.date}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}