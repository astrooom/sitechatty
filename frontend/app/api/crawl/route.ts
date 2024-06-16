import { crawlUrls } from "@/lib/crawler";
import { NextRequest, NextResponse } from "next/server"

export const POST = async (request: NextRequest) => {
  const body = await request.json();

  console.log("body", body);

  const { urls } = body;

  const results = await crawlUrls(urls);

  return NextResponse.json({ data: results }, { status: 200 });
}