import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { db } from "../../_data/store";

const AUTH_COOKIE = "fontbox.session";

export async function POST(request: Request) {
  const payload = await request.json();
  const user = db.getUserByEmail(payload?.email ?? "");
  if (!user || user.password !== payload?.password) {
    return NextResponse.json({ message: "Invalid credentials" }, { status: 401 });
  }
  const token = `${user.id}:${Date.now()}`;
  cookies().set(AUTH_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/"
  });
  return NextResponse.json({
    user: { id: user.id, email: user.email, name: user.name },
    token
  });
}
