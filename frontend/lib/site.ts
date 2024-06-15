import type { Prisma } from "@prisma/client";
import { db } from "./database";
import { classifyUrl } from "./url";
import { siteAddedSourceSchema, siteSchema } from "./schemas/site";

export async function createSite(data: Prisma.SiteCreateInput) {
  const validateResult = siteSchema.safeParse(data);
  if (!validateResult.success) {
    throw new Error(validateResult.error.message);
  }

  return await db.site.create({
    data
  });
}

export async function createSiteAddedSource(data: Prisma.SiteAddedSourceCreateInput) {
  const validateResult = siteAddedSourceSchema.safeParse(data);
  if (!validateResult.success) {
    throw new Error(validateResult.error.message);
  }

  return await db.siteAddedSource.create({
    data: {
      ...data,
      type: classifyUrl(data.source)
    }
  });
}