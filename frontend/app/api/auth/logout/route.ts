import { NextResponse } from "next/server";
import { getErrorMessage } from "@/lib/utils";
import type { NextRequest } from "next/server";
import { logout } from "@/lib/auth";

export const POST = (
  async (_request: NextRequest) => {
    try {
      return await logout()
    } catch (e) {
      const error = getErrorMessage(e);
      return NextResponse.json({ error }, { status: 403 });
    }
  }
)

