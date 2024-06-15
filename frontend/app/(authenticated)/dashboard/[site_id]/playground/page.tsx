import { getSiteId } from "@/lib/api";
import type { PageProps } from "@/types";
import { redirect } from "next/navigation";

export default function Page({ params }: PageProps) {
  const siteId = getSiteId(params);
  redirect(`/dashboard/${siteId}/playground/sources`);
}
