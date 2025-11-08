import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { db } from "../../_data/store";

const AUTH_COOKIE = "fontbox.session";

export async function GET() {
  const token = cookies().get(AUTH_COOKIE)?.value;
  if (!token) {
    return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
  }
  const [userId] = token.split(":");
  const user = db.getUserById(userId);
  if (!user) {
    return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
  }
  return NextResponse.json({ id: user.id, email: user.email, name: user.name });
}
