import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { db } from "../../_data/store";

const AUTH_COOKIE = "fontbox.session";

export async function POST() {
  const token = cookies().get(AUTH_COOKIE)?.value;
  if (!token) {
    return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
  }
  const [userId] = token.split(":");
  const user = db.getUserById(userId);
  if (!user) {
    cookies().delete(AUTH_COOKIE);
    return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
  }
  const refreshed = `${user.id}:${Date.now()}`;
  cookies().set(AUTH_COOKIE, refreshed, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/"
  });
  return NextResponse.json({ user: { id: user.id, email: user.email, name: user.name }, token: refreshed });
}
