"use client";

import React, { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import BeaconSweep from "@/components/BeaconSweep";
import {
  Settings as SettingsIcon,
  Key,
  User,
  ShieldAlert,
  Check,
} from "lucide-react";
import { useIsClient } from "@/lib/useIsClient";

const STORAGE_KEY = "lighthouse_settings";

interface LighthouseSettings {
  firecrawlApiKey: string;
  groqApiKey: string;
  agentName: string;
  marketRegion: string;
}

const defaultSettings: LighthouseSettings = {
  firecrawlApiKey: "",
  groqApiKey: "",
  agentName: "",
  marketRegion: "",
};

export default function Settings() {
  const [settings, setSettings] = useState<LighthouseSettings>(defaultSettings);
  const isClient = useIsClient();
  const [saveStatus, setSaveStatus] = useState<"idle" | "saved">("idle");

  // Load whatever was saved previously, once we're on the client.
  useEffect(() => {
    if (!isClient) return;
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        // eslint-disable-next-line react-hooks/set-state-in-effect -- localStorage is only readable client-side; syncing it into state after mount is exactly what this effect is for.
        setSettings({ ...defaultSettings, ...JSON.parse(stored) });
      }
    } catch (e) {
      console.error("Error loading settings", e);
    }
  }, [isClient]);

  const updateField = (field: keyof LighthouseSettings, value: string) => {
    setSettings((prev) => ({ ...prev, [field]: value }));
    if (saveStatus === "saved") setSaveStatus("idle");
  };

  const saveSettings = () => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
      setSaveStatus("saved");
      setTimeout(() => setSaveStatus("idle"), 2500);
    } catch (e) {
      console.error("Error saving settings", e);
    }
  };

  // Prevent hydration mismatches between server render and localStorage-backed state.
  if (!isClient) return null;

  return (
    <main className="relative min-h-screen w-full bg-abyss font-sans overflow-x-hidden pb-24">
      <BeaconSweep />

      <Navbar />

      <div className="max-w-4xl mx-auto px-6 lg:px-12 pt-40 relative z-[1]">
        {/* Header */}
        <div className="mb-12 border-b border-steel/15 pb-8">
          <div className="flex items-center gap-3 mb-4">
            <SettingsIcon className="text-beacon size-6" />
            <span className="text-xs font-black uppercase tracking-[0.4em] text-beacon font-mono">
              System
            </span>
          </div>
          <h1 className="heading text-4xl md:text-5xl text-foam tracking-tight">
            Configuration
          </h1>
        </div>

        <div className="space-y-8">
          {/* API Keys Section */}
          <div className="bg-panel border border-steel/15 p-8 shadow-2xl">
            <h2 className="text-lg font-bold text-foam flex items-center gap-2 mb-6">
              <Key className="text-steel size-5" /> API Connectivity
            </h2>

            <div className="space-y-6">
              <div>
                <label className="block text-[10px] font-bold text-steel uppercase tracking-widest mb-2 font-mono">
                  Firecrawl API Key
                </label>
                <input
                  type="password"
                  value={settings.firecrawlApiKey}
                  onChange={(e) =>
                    updateField("firecrawlApiKey", e.target.value)
                  }
                  placeholder="fc-..."
                  className="w-full bg-abyss border border-steel/20 text-foam h-12 px-4 focus:outline-none focus:border-beacon focus:ring-2 focus:ring-beacon/30 transition-all font-mono text-sm shadow-inner"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-steel uppercase tracking-widest mb-2 font-mono">
                  Groq API Key (LLM Engine)
                </label>
                <input
                  type="password"
                  value={settings.groqApiKey}
                  onChange={(e) => updateField("groqApiKey", e.target.value)}
                  placeholder="gsk_..."
                  className="w-full bg-abyss border border-steel/20 text-foam h-12 px-4 focus:outline-none focus:border-beacon focus:ring-2 focus:ring-beacon/30 transition-all font-mono text-sm shadow-inner"
                />
              </div>

              <p className="text-[11px] text-steel leading-relaxed">
                Leave blank to use the server&apos;s default keys. If you add
                your own here, your requests will use these instead — handy for
                testing a different account or a higher-limit key.
              </p>
            </div>

            <div className="mt-6 flex items-center gap-2 text-xs font-mono text-beacon/90 bg-beacon/10 p-3 border border-beacon/20">
              <ShieldAlert size={14} /> Keys are stored in this browser&apos;s
              local storage only — they&apos;re sent to this app&apos;s own API
              when you generate a listing, never to any third-party tracking
              service.
            </div>
          </div>

          {/* Profile Section */}
          <div className="bg-panel border border-steel/15 p-8 shadow-2xl">
            <h2 className="text-lg font-bold text-foam flex items-center gap-2 mb-6">
              <User className="text-steel size-5" /> Agent Profile
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-[10px] font-bold text-steel uppercase tracking-widest mb-2 font-mono">
                  Agent Name
                </label>
                <input
                  type="text"
                  value={settings.agentName}
                  onChange={(e) => updateField("agentName", e.target.value)}
                  placeholder="Your name"
                  className="w-full bg-abyss border border-steel/20 text-foam h-12 px-4 focus:outline-none focus:border-beacon focus:ring-2 focus:ring-beacon/30 transition-all text-sm shadow-inner"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-steel uppercase tracking-widest mb-2 font-mono">
                  Market Region
                </label>
                <input
                  type="text"
                  value={settings.marketRegion}
                  onChange={(e) => updateField("marketRegion", e.target.value)}
                  placeholder="e.g. Florida Panhandle"
                  className="w-full bg-abyss border border-steel/20 text-foam h-12 px-4 focus:outline-none focus:border-beacon focus:ring-2 focus:ring-beacon/30 transition-all text-sm shadow-inner"
                />
              </div>
            </div>

            <button
              onClick={saveSettings}
              className="mt-8 bg-beacon hover:brightness-110 transition text-abyss px-8 py-3 shadow-lg text-sm font-bold tracking-wide w-full md:w-auto flex items-center justify-center gap-2"
            >
              {saveStatus === "saved" ? (
                <>
                  <Check size={16} /> Saved
                </>
              ) : (
                "Save Configuration"
              )}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
