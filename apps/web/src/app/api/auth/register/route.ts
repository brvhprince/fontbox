import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { db } from "../../_data/store";

const AUTH_COOKIE = "fontbox.session";

export async function POST(request: Request) {
  const payload = await request.json();
  if (!payload?.email || !payload?.password) {
    return NextResponse.json({ message: "Missing credentials" }, { status: 400 });
  }
  const existing = db.getUserByEmail(payload.email);
  if (existing) {
    return NextResponse.json({ message: "Email already registered" }, { status: 409 });
  }
  const user = db.addUser({ email: payload.email, password: payload.password, name: payload.name ?? "" });
  const token = `${user.id}:${Date.now()}`;
  cookies().set(AUTH_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/"
  });
  return NextResponse.json({ user: { id: user.id, email: user.email, name: user.name }, token });
}
