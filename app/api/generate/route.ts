import { generateObject } from 'ai';
import { groq } from '@ai-sdk/groq'; // Ensure this is imported
import { listingSchema } from '@/lib/schema';
import { personas } from '@/lib/personas';
import FirecrawlApp from '@mendable/firecrawl-js';

const firecrawl = new FirecrawlApp({ apiKey: process.env.FIRECRAWL_API_KEY });

export async function POST(req: Request) {
  try {
    const { propertyData, voice } = await req.json();
    let context = propertyData;

    const selectedPersona = voice === 'Executive' ? personas.ryanAlexander : personas.ivyAria;

    // 1. Scraping Logic (Existing)
    if (propertyData.startsWith('http')) {
      const scrapeResult = await firecrawl.scrape(propertyData, {
        formats: ['markdown', 'html'], // Adding HTML can sometimes help pull hidden metadata
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
      model: groq('openai/gpt-oss-120b'),
      schema: listingSchema,
      system: selectedPersona.systemPrompt,
      prompt: `
    You are an expert at extracting real estate data. 
    1. Find the URL for the main high-resolution property photo. It usually ends in .jpg or .webp and is often in the 'media' or 'images' section of the data.
    2. Extract the price, beds, baths, and square footage.
    3. Generate the marketing suite based on this data:
    
    PROPERTY DATA:
    ${context.slice(0, 12000)}
  `,
    });

    return Response.json(result.object);

  } catch (globalError: any) {
    console.error("Lighthouse AI Error:", globalError.message);
    return new Response(JSON.stringify({ error: globalError.message }), { status: 500 });
  }
}