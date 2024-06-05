import { RouteParams } from "@/types";

export const ignoreCache: RequestInit = { cache: "no-store", next: { revalidate: undefined } };

export const getSiteId = (params?: RouteParams): number => {
  const siteId = params?.site_id;

  // Check if siteId is not null, undefined, and is a valid number
  if (siteId === undefined || siteId === null || isNaN(Number(siteId))) {
    throw new Error("A valid site id is required");
  }

  return Number(siteId);
};

export function isValidURL(str: string): boolean {
  try {
    new URL(str);
    return true;
  } catch (_) {
    return false;
  }
}
