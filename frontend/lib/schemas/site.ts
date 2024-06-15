import { z } from "zod";

export const siteSchema = z.object({
  id: z.number().int().nonnegative().optional(),  // Optional for auto-generated id
  name: z.string().max(80),  // `@db.VarChar(80)` equivalent
  user_id: z.number().int().nonnegative(),
  created_at: z.date().optional(),  // Optional `DateTime`
  updated_at: z.date().optional(),  // Automatically updated `DateTime`
  favicon_url: z.string().url().optional(),  // Assuming it is a URL and optional
  max_urls_allowed: z.number().int().min(0).default(15),  // Default value is 15
  user: z.object({ id: z.number().int().nonnegative() }).optional(),  // Simplified user relation and optional
  site_added_sources: z.array(z.object({
    id: z.number().int().nonnegative() // Assuming a similar structure for SiteAddedSource
  })).optional()  // Assuming an array of related objects and optional
});

export const siteAddedSourceSchema = z.object({
  id: z.number().int().nonnegative().optional(),  // Optional for auto-generated id
  site_id: z.number().int().nonnegative(),  // Foreign key reference to Site
  source: z.string().max(80),  // `@db.VarChar(80)` and unique
  source_type: z.string().max(80),  // `@db.VarChar(80)`
  type: z.string().max(80).optional(),  // Optional `@db.VarChar(80)`
  created_at: z.date().optional(),  // Optional `DateTime`
  updated_at: z.date().optional(),  // Automatically updated `DateTime`
  site: z.object({ id: z.number().int().nonnegative() }).optional(),  // Simplified site relation and optional
});