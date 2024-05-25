import { NextResponse } from "next/server";
import { getErrorMessage } from "@/lib/utils";
import type { NextRequest } from "next/server";
import { login, type LoginProps } from "@/lib/auth";

export const POST = (
  async (request: NextRequest) => {
    try {
      const body: LoginProps = await request.json();
      return await login(body)
    } catch (e) {
      const error = getErrorMessage(e);
      return NextResponse.json({ error }, { status: 403 });
    }
  }
)

