import { NextResponse } from "next/server";
import { hashOptions, lucia } from "@/lib";
import { getErrorMessage } from "@/lib/utils";
import type { NextRequest } from "next/server";
import { db } from "@/lib/database";
import { hash } from "@node-rs/argon2";
import { AuthSchema } from "@/lib/schemas/auth";

export const POST = async (request: NextRequest) => {
  try {
    const body = await request.json();
    const validateResult = AuthSchema.safeParse(body);

    if (!validateResult.success) {
      return NextResponse.json({ error: validateResult.error }, { status: 400 });
    }

    const { email, password } = validateResult.data

    // Store user in DB
    const user = await db.user.create({
      data: {
        email,
        password_hash: await hash(password, hashOptions)
      },
    });

    const userId = user.id.toString();

    const session = await lucia.createSession(userId, {});
    const sessionCookie = lucia.createSessionCookie(session.id);

    return new Response(null, {
      status: 302,
      headers: {
        Location: "/",
        "Set-Cookie": sessionCookie.serialize()
      }
    });

  } catch (error) {
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 400 });
  }
};
