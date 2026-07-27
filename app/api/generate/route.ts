import { generateObject } from "ai";
import { createGroq } from "@ai-sdk/groq";
import { listingSchema } from "@/lib/schema";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import FirecrawlApp from "@mendable/firecrawl-js";

const SYSTEM_PROMPT = `You are a professional real estate copywriter. Your tone is polished,
confident, and welcoming — grounded in the property's actual specs and features rather than
generic filler. Balance lifestyle appeal with concrete details (layout, condition, standout
features) so the copy reads as credible and specific, not just aspirational.`;

// Expensive per-request (scrape + LLM call), so keep this tight.
const RATE_LIMIT = 5;
const RATE_WINDOW_MS = 60_000;

export async function POST(req: Request) {
  const ip = getClientIp(req);
  const rateLimit = checkRateLimit(
    `generate:${ip}`,
    RATE_LIMIT,
    RATE_WINDOW_MS
  );
  if (!rateLimit.allowed) {
    const retryAfterSec = Math.ceil((rateLimit.resetAt - Date.now()) / 1000);
    return new Response(
      JSON.stringify({
        error: "Too many requests. Please wait a moment and try again.",
      }),
      {
        status: 429,
        headers: { "Retry-After": String(retryAfterSec) },
      }
    );
  }

  let propertyData: string;
  let apiKeys: { firecrawl?: string; groq?: string } = {};

  try {
    const body = await req.json();
    propertyData = body.propertyData;
    apiKeys = body.apiKeys || {};
  } catch {
    return new Response(JSON.stringify({ error: "Invalid request body." }), {
      status: 400,
    });
  }

  if (
    !propertyData ||
    typeof propertyData !== "string" ||
    !propertyData.trim()
  ) {
    return new Response(
      JSON.stringify({
        error: "Please provide a URL or property description.",
      }),
      { status: 400 }
    );
  }

  const firecrawlKey = apiKeys.firecrawl || process.env.FIRECRAWL_API_KEY;
  const groqKey = apiKeys.groq || process.env.GROQ_API_KEY;

  if (!firecrawlKey || !groqKey) {
    return new Response(
      JSON.stringify({
        error:
          "Missing API keys. Add your Firecrawl and Groq keys in Settings, or configure them on the server.",
      }),
      { status: 500 }
    );
  }

  let context = propertyData;

  // 1. Scraping — isolated so a scrape failure gets its own clear message
  // instead of a generic "something went wrong".
  if (propertyData.startsWith("http")) {
    try {
      const firecrawl = new FirecrawlApp({ apiKey: firecrawlKey });
      const scrapeResult = await firecrawl.scrape(propertyData, {
        formats: ["markdown", "html"],
        onlyMainContent: true,
        waitFor: 3000, // wait for JS-rendered listing images to load
        timeout: 15000,
      });
      if (scrapeResult && (scrapeResult as any).data?.markdown) {
        context = (scrapeResult as any).data.markdown;
      }
    } catch (scrapeError) {
      console.error("Lighthouse AI — scrape failed:", scrapeError);
      return new Response(
        JSON.stringify({
          error:
            "Couldn't fetch that listing page. Double-check the URL, or paste the property description directly instead.",
        }),
        { status: 502 }
      );
    }
  }

  // 2. AI Generation with GPT-OSS 120B — isolated for the same reason.
  try {
    const groq = createGroq({ apiKey: groqKey });
    const result = await generateObject({
      model: groq("openai/gpt-oss-120b"),
      schema: listingSchema,
      system: SYSTEM_PROMPT,
      prompt: `
    ANALYZE_START:
    Extract all property details from the data below. 
    
    CRITICAL_INSTRUCTIONS:
    - If a value like 'sqft' or 'investmentScore' is missing, provide a professional estimate or 'N/A'.
    - DO NOT leave any fields null or undefined.
    - Ensure 'tiktokScript' is an array of strings.
    - Ensure 'heroImage' is a direct image URL if found, otherwise an empty string.

    PROPERTY_DATA:
    ${context.slice(0, 10000)}
    ANALYZE_END
  `,
    });

    return Response.json(result.object);
  } catch (generationError) {
    console.error("Lighthouse AI — generation failed:", generationError);
    return new Response(
      JSON.stringify({
        error:
          "The AI engine couldn't process this listing. Please try again in a moment.",
      }),
      { status: 502 }
    );
  }
}
