import { NextResponse } from "next/server";
import { getErrorMessage } from "@/lib/utils";
import type { NextRequest } from "next/server";
import { register, type RegisterAndLoginProps } from "@/lib/auth";

export const POST = (
  async (request: NextRequest) => {
    try {
      const body: RegisterAndLoginProps = await request.json();
      return await register(body)
    } catch (e) {
      const error = getErrorMessage(e);
      return NextResponse.json({ error }, { status: 403 });
    }
  }
)

