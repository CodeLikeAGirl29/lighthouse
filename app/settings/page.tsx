'use client';

import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import { Settings as SettingsIcon, Key, User, ShieldAlert } from 'lucide-react';

export default function Settings() {
  const [voice, setVoice] = useState<'Professional' | 'Executive'>('Professional');

  return (
    <main className="relative min-h-screen w-full bg-[#0f172a] font-sans overflow-x-hidden pb-24">
      {/* Background Elements */}
      <div className="absolute top-20 right-0 w-[800px] h-[800px] bg-purple-900/10 rounded-full blur-[150px] pointer-events-none"></div>

      <Navbar voice={voice} setVoice={setVoice} />

      <div className="max-w-4xl mx-auto px-6 lg:px-12 pt-40 relative z-10">
        
        {/* Header */}
        <div className="mb-12 border-b border-white/10 pb-8">
          <div className="flex items-center gap-3 mb-4">
            <SettingsIcon className="text-purple-400 size-6" />
            <span className="text-xs font-black uppercase tracking-[0.4em] text-purple-400">System</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight">
            Configuration
          </h1>
        </div>

        <div className="space-y-8">
          
          {/* API Keys Section */}
          <div className="bg-black/40 backdrop-blur-md border border-white/5 p-8 shadow-2xl">
            <h2 className="text-lg font-bold text-white flex items-center gap-2 mb-6">
              <Key className="text-gray-400 size-5" /> API Connectivity
            </h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">
                  Firecrawl API Key
                </label>
                <input 
                  type="password" 
                  defaultValue="fc-************************"
                  className="w-full bg-white/5 border border-white/10 text-gray-300 h-12 px-4 focus:outline-none focus:border-purple-500 focus:bg-white/10 transition-all font-mono text-sm shadow-inner"
                />
              </div>
              
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">
                  Groq API Key (LLM Engine)
                </label>
                <input 
                  type="password" 
                  defaultValue="gsk_***********************"
                  className="w-full bg-white/5 border border-white/10 text-gray-300 h-12 px-4 focus:outline-none focus:border-purple-500 focus:bg-white/10 transition-all font-mono text-sm shadow-inner"
                />
              </div>
            </div>
            
            <div className="mt-6 flex items-center gap-2 text-xs font-mono text-amber-500/80 bg-amber-500/10 p-3 border border-amber-500/20">
              <ShieldAlert size={14} /> Keys are stored locally and never sent to external tracking servers.
            </div>
          </div>

          {/* Profile Section */}
          <div className="bg-black/40 backdrop-blur-md border border-white/5 p-8 shadow-2xl">
            <h2 className="text-lg font-bold text-white flex items-center gap-2 mb-6">
              <User className="text-gray-400 size-5" /> Agent Profile
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Agent Name</label>
                <input 
                  type="text" 
                  defaultValue="Lindsey Howard"
                  className="w-full bg-white/5 border border-white/10 text-gray-300 h-12 px-4 focus:outline-none focus:border-purple-500 focus:bg-white/10 transition-all text-sm shadow-inner"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Market Region</label>
                <input 
                  type="text" 
                  defaultValue="Florida Panhandle"
                  className="w-full bg-white/5 border border-white/10 text-gray-300 h-12 px-4 focus:outline-none focus:border-purple-500 focus:bg-white/10 transition-all text-sm shadow-inner"
                />
              </div>
            </div>

            <button className="mt-8 bg-[#7c3aed] hover:bg-[#6d28d9] transition text-white px-8 py-3 shadow-lg text-sm font-semibold tracking-wide w-full md:w-auto">
              Save Configuration
            </button>
          </div>

        </div>
      </div>
    </main>
  );
}