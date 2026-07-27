import { z } from "zod";

export const listingSchema = z.object({
  address: z.string(),
  // Remove .optional() - GPT-OSS needs these in the 'required' array
  heroImage: z.string(),
  specs: z.object({
    beds: z.string(),
    baths: z.string(),
    sqft: z.string(),
  }),
  highlights: z.array(z.string()).max(6),
  mlsDescription: z.string(),
  instagramCaption: z.string(),
  tiktokScript: z.array(z.string()),
  propertyVibe: z.string(),
  // Change to a regular string so it's technically "required" in the schema
  investmentScore: z.string(),
  // Add these to your listingSchema object
  competitiveEdge: z.string(), // "What makes this property win?"
  priceAnalysis: z.string(), // "Is it over/under priced based on the specs?"
});

// The shape of the AI's generated output, inferred straight from the schema
// above so the two can never drift out of sync.
export type ListingData = z.infer<typeof listingSchema>;
