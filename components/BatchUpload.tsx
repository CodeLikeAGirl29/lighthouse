"use client";

import { useState } from "react";
import Link from "next/link";
import { Loader2, CheckCircle2, XCircle, Clock } from "lucide-react";
import type { ListingData } from "@/lib/schema";

interface BatchItem {
  input: string;
  status: "queued" | "processing" | "done" | "error";
  error?: string;
}

function getSavedApiKeys(): { firecrawl?: string; groq?: string } {
  try {
    const stored = JSON.parse(
      localStorage.getItem("lighthouse_settings") || "{}",
    );
    return {
      firecrawl: stored.firecrawlApiKey || undefined,
      groq: stored.groqApiKey || undefined,
    };
  } catch {
    return {};
  }
}

function saveToCanvas(input: string, data: ListingData) {
  try {
    const existing = JSON.parse(
      localStorage.getItem("lighthouse_canvas") || "[]",
    );
    const newListing = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      date: new Date().toLocaleDateString(),
      input,
      data,
    };
    localStorage.setItem(
      "lighthouse_canvas",
      JSON.stringify([newListing, ...existing]),
    );
  } catch (e) {
    console.error("Failed to save batch item to canvas:", e);
  }
}

type GenerateResult =
  | { ok: true; data: ListingData }
  | { ok: false; error: string };

/** Generates one listing, automatically waiting out and retrying a single 429. */
async function generateOne(
  input: string,
  isRetry = false,
): Promise<GenerateResult> {
  const res = await fetch("/api/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ propertyData: input, apiKeys: getSavedApiKeys() }),
  });

  if (res.status === 429 && !isRetry) {
    const retryAfter = Number(res.headers.get("Retry-After") || "10");
    await new Promise((resolve) =>
      setTimeout(resolve, (retryAfter + 1) * 1000),
    );
    return generateOne(input, true);
  }

  if (!res.ok) {
    let message = "Failed to generate.";
    try {
      const json = await res.json();
      if (json?.error) message = json.error;
    } catch {
      // Response wasn't JSON — keep the generic message.
    }
    return { ok: false, error: message };
  }

  return { ok: true, data: await res.json() };
}

export default function BatchUpload() {
  const [rawInput, setRawInput] = useState("");
  const [items, setItems] = useState<BatchItem[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const urls = rawInput
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  const startBatch = async () => {
    if (urls.length === 0 || isRunning) return;

    setIsRunning(true);
    setItems(urls.map((u) => ({ input: u, status: "queued" })));

    for (let i = 0; i < urls.length; i++) {
      setItems((prev) =>
        prev.map((it, idx) =>
          idx === i ? { ...it, status: "processing" } : it,
        ),
      );

      const result = await generateOne(urls[i]);

      if (result.ok) {
        saveToCanvas(urls[i], result.data);
        setItems((prev) =>
          prev.map((it, idx) => (idx === i ? { ...it, status: "done" } : it)),
        );
      } else {
        setItems((prev) =>
          prev.map((it, idx) =>
            idx === i ? { ...it, status: "error", error: result.error } : it,
          ),
        );
      }
    }

    setIsRunning(false);
  };

  const doneCount = items.filter((it) => it.status === "done").length;
  const errorCount = items.filter((it) => it.status === "error").length;
  const allSettled =
    items.length > 0 &&
    items.every((it) => it.status === "done" || it.status === "error");

  return (
    <div className="bg-panel p-8 shadow-2xl w-full border border-steel/15">
      <p className="text-foam font-semibold text-lg mb-2">
        Paste multiple listing URLs, one per line
      </p>
      <p className="text-steel text-xs mb-4">
        Each one is processed one at a time (to stay within the rate limit) and
        saved straight to your Property Canvas.
      </p>

      <textarea
        value={rawInput}
        onChange={(e) => setRawInput(e.target.value)}
        disabled={isRunning}
        rows={6}
        placeholder={
          "https://www.zillow.com/homedetails/...\nhttps://www.redfin.com/...\nhttps://www.realtor.com/..."
        }
        className="w-full bg-abyss text-foam px-4 py-3 text-sm font-mono border border-steel/20 focus:outline-none focus:ring-2 focus:ring-beacon/60 focus:border-beacon/60 placeholder:text-steel/50 shadow-inner disabled:opacity-50"
      />

      <div className="flex items-center justify-between mt-4">
        <span className="text-xs font-mono text-steel">
          {urls.length} {urls.length === 1 ? "listing" : "listings"} queued
        </span>
        <button
          onClick={startBatch}
          disabled={urls.length === 0 || isRunning}
          className="bg-beacon hover:brightness-110 disabled:bg-steel/30 disabled:cursor-not-allowed transition text-abyss font-bold px-6 py-2.5 text-sm shadow-md"
        >
          {isRunning
            ? "Processing..."
            : `Generate ${urls.length || ""} Listing${urls.length === 1 ? "" : "s"}`}
        </button>
      </div>

      {items.length > 0 && (
        <div className="mt-6 border-t border-steel/15 pt-6 space-y-3">
          {items.map((item, i) => (
            <div key={i} className="flex items-center gap-3 text-sm">
              {item.status === "queued" && (
                <Clock size={14} className="text-steel shrink-0" />
              )}
              {item.status === "processing" && (
                <Loader2
                  size={14}
                  className="text-beacon animate-spin shrink-0"
                />
              )}
              {item.status === "done" && (
                <CheckCircle2 size={14} className="text-signal shrink-0" />
              )}
              {item.status === "error" && (
                <XCircle size={14} className="text-red-400 shrink-0" />
              )}
              <span className="text-steel truncate flex-1 font-mono text-xs">
                {item.input}
              </span>
              {item.status === "error" && (
                <span className="text-red-400 text-[11px] shrink-0">
                  {item.error}
                </span>
              )}
            </div>
          ))}

          {allSettled && (
            <div className="pt-4 flex items-center justify-between border-t border-steel/15 mt-4">
              <span className="text-xs font-mono text-steel">
                {doneCount} done{errorCount > 0 ? `, ${errorCount} failed` : ""}
              </span>
              {doneCount > 0 && (
                <Link
                  href="/property-canvas"
                  className="text-beacon hover:brightness-110 transition text-xs font-bold font-mono"
                >
                  View in Property Canvas &rarr;
                </Link>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
