import { hashOptions, lucia } from "@/lib";
import { verify } from "@node-rs/argon2";
import { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { db } from "@/lib/database";
import { AuthSchema } from "@/lib/schemas/auth";

export const POST = async (request: NextRequest) => {
  const body = await request.json();
  const validateResult = AuthSchema.safeParse(body);

  if (!validateResult.success) {
    return NextResponse.json({ error: validateResult.error }, { status: 400 });
  }

  const { email, password } = validateResult.data

  const user = await db.user.findUnique({
    where: { email },
  })

  if (!user) {
    return NextResponse.json({ error: "Invalid email or password" }, { status: 400 });
  }

  const validPassword = await verify(user.password_hash, password, hashOptions);

  if (!validPassword) {
    return NextResponse.json({ error: "Invalid email or password" }, { status: 400 });
  }

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
}
