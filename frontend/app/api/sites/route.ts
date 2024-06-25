import { NextResponse } from "next/server";
import { getErrorMessage } from "@/lib/utils";
import type { NextRequest } from "next/server";
import { createSite } from "@/lib";

export const POST = (
  async (request: NextRequest) => {
    try {
      const body = await request.json();
      const response = await createSite(body)
      return NextResponse.json({ data: response }, { status: 200 });
    } catch (e) {
      const error = getErrorMessage(e);
      return NextResponse.json({ error }, { status: 403 });
    }
  }
)

