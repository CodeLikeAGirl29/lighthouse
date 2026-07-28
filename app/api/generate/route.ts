import { generateObject } from 'ai';
import { createGroq } from '@ai-sdk/groq';
import { listingSchema, type ListingData } from '@/lib/schema';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';
import FirecrawlApp, { type Document } from '@mendable/firecrawl-js';

const SYSTEM_PROMPT = `You are a professional real estate copywriter. Your tone is polished,
confident, and welcoming — grounded in the property's actual specs and features rather than
generic filler. Balance lifestyle appeal with concrete details (layout, condition, standout
features) so the copy reads as credible and specific, not just aspirational.`;

// Expensive per-request (scrape + LLM call), so keep this tight.
const RATE_LIMIT = 5;
const RATE_WINDOW_MS = 60_000;

function errorResponse(status: number, error: string, extraHeaders?: Record<string, string>) {
  return new Response(JSON.stringify({ error }), { status, headers: extraHeaders });
}

function enforceRateLimit(req: Request): Response | null {
  const ip = getClientIp(req);
  const rateLimit = checkRateLimit(`generate:${ip}`, RATE_LIMIT, RATE_WINDOW_MS);
  if (rateLimit.allowed) return null;

  const retryAfterSec = Math.ceil((rateLimit.resetAt - Date.now()) / 1000);
  return errorResponse(429, 'Too many requests. Please wait a moment and try again.', {
    'Retry-After': String(retryAfterSec),
  });
}

type ParsedRequest =
  | { ok: true; propertyData: string; apiKeys: { firecrawl?: string; groq?: string } }
  | { ok: false; response: Response };

async function parseRequest(req: Request): Promise<ParsedRequest> {
  let body: { propertyData?: unknown; apiKeys?: { firecrawl?: string; groq?: string } };
  try {
    body = await req.json();
  } catch {
    return { ok: false, response: errorResponse(400, 'Invalid request body.') };
  }

  const propertyData = body.propertyData;
  if (!propertyData || typeof propertyData !== 'string' || !propertyData.trim()) {
    return {
      ok: false,
      response: errorResponse(400, 'Please provide a URL or property description.'),
    };
  }

  return { ok: true, propertyData, apiKeys: body.apiKeys || {} };
}

function resolveApiKeys(apiKeys: { firecrawl?: string; groq?: string }) {
  return {
    firecrawlKey: apiKeys.firecrawl || process.env.FIRECRAWL_API_KEY,
    groqKey: apiKeys.groq || process.env.GROQ_API_KEY,
  };
}

/**
 * Real estate listing sites reliably set og:image (and twitter:image) to the
 * main listing photo, for social-share previews. Pulling it directly from
 * scraped HTML is far more reliable than asking the LLM to spot a raw image
 * URL buried in scraped markdown text. Attribute order isn't guaranteed
 * (content can come before or after property/name), so find the whole
 * <meta> tag first, then pull content= out of it.
 */
function extractMetaImage(html: string): string {
  const metaContent = (key: string): string => {
    const tagMatch = html.match(
      new RegExp(`<meta[^>]+(?:property|name)=["']${key}["'][^>]*>`, 'i'),
    );
    if (!tagMatch) return '';
    const contentMatch = tagMatch[0].match(/content=["']([^"']+)["']/i);
    return contentMatch?.[1] || '';
  };
  return metaContent('og:image') || metaContent('twitter:image');
}

async function scrapeListing(
  url: string,
  firecrawlKey: string,
): Promise<{ context: string; scrapedImage: string }> {
  const firecrawl = new FirecrawlApp({ apiKey: firecrawlKey });
  const scrapeResult: Document = await firecrawl.scrape(url, {
    formats: ['markdown', 'html'],
    onlyMainContent: true,
    waitFor: 3000, // wait for JS-rendered listing images to load
    timeout: 15000,
  });

  const html = scrapeResult.html || '';
  const scrapedImage = extractMetaImage(html);

  console.log(
    `Lighthouse AI — scrape diagnostics: html length=${html.length}, og/twitter image found=${!!scrapedImage}`,
  );

  return { context: scrapeResult.markdown || url, scrapedImage };
}

function buildPrompt(context: string): string {
  return `
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
  `;
}

async function generateListing(context: string, groqKey: string): Promise<ListingData> {
  const groq = createGroq({ apiKey: groqKey });
  const result = await generateObject({
    model: groq('openai/gpt-oss-120b'),
    schema: listingSchema,
    system: SYSTEM_PROMPT,
    prompt: buildPrompt(context),
  });
  return result.object;
}

export async function POST(req: Request) {
  const rateLimitResponse = enforceRateLimit(req);
  if (rateLimitResponse) return rateLimitResponse;

  const parsed = await parseRequest(req);
  if (!parsed.ok) return parsed.response;
  const { propertyData, apiKeys } = parsed;

  const { firecrawlKey, groqKey } = resolveApiKeys(apiKeys);
  if (!firecrawlKey || !groqKey) {
    return errorResponse(
      500,
      'Missing API keys. Add your Firecrawl and Groq keys in Settings, or configure them on the server.',
    );
  }

  let context = propertyData;
  let scrapedImage = '';

  // Scraping is isolated so a failure here gets its own clear message
  // instead of a generic "something went wrong".
  if (propertyData.startsWith('http')) {
    try {
      ({ context, scrapedImage } = await scrapeListing(propertyData, firecrawlKey));
    } catch (scrapeError) {
      console.error('Lighthouse AI — scrape failed:', scrapeError);
      return errorResponse(
        502,
        "Couldn't fetch that listing page. Double-check the URL, or paste the property description directly instead.",
      );
    }
  }

  // AI generation is isolated for the same reason.
  try {
    const listing = await generateListing(context, groqKey);
    return Response.json({
      ...listing,
      // The scraped og:image is a real URL straight from the listing page's
      // own metadata — trust it over whatever the LLM inferred, and only
      // fall back to the LLM's guess if scraping found nothing.
      heroImage: scrapedImage || listing.heroImage,
    });
  } catch (generationError) {
    console.error('Lighthouse AI — generation failed:', generationError);
    return errorResponse(
      502,
      "The AI engine couldn't process this listing. Please try again in a moment.",
    );
  }
}