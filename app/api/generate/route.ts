import { generateObject } from "ai";
import { groq } from "@ai-sdk/groq"; // Ensure this is imported
import { listingSchema } from "@/lib/schema";
import FirecrawlApp from "@mendable/firecrawl-js";

const firecrawl = new FirecrawlApp({ apiKey: process.env.FIRECRAWL_API_KEY });

const SYSTEM_PROMPT = `You are a professional real estate copywriter. Your tone is polished,
confident, and welcoming — grounded in the property's actual specs and features rather than
generic filler. Balance lifestyle appeal with concrete details (layout, condition, standout
features) so the copy reads as credible and specific, not just aspirational.`;

export async function POST(req: Request) {
  try {
    const { propertyData } = await req.json();
    let context = propertyData;

    // 1. Scraping Logic (Existing)
    if (propertyData.startsWith("http")) {
      const scrapeResult = await firecrawl.scrape(propertyData, {
        formats: ["markdown", "html"], // Adding HTML can sometimes help pull hidden metadata
        onlyMainContent: true,
        waitFor: 3000, // CRITICAL: Wait 3 seconds for Zillow's images to load
        timeout: 15000,
      });
      if (scrapeResult && (scrapeResult as any).data?.markdown) {
        context = (scrapeResult as any).data.markdown;
      }
    }

    // 2. AI Generation with GPT-OSS 120B
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
  } catch (globalError: any) {
    console.error("Lighthouse AI Error:", globalError.message);
    return new Response(JSON.stringify({ error: globalError.message }), {
      status: 500,
    });
  }
}
