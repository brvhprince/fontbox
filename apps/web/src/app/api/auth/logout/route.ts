import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const AUTH_COOKIE = "fontbox.session";

export async function POST() {
  cookies().delete(AUTH_COOKIE);
  return NextResponse.json({ success: true });
}
