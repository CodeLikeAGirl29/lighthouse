import { z } from 'zod';

export const listingSchema = z.object({
  address: z.string(),
  // Change this from z.string().url() to just z.string()
  heroImage: z.string().optional(),
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
  investmentScore: z.string().optional(),
});