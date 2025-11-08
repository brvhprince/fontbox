import { NextResponse } from "next/server";

import { db } from "../_data/store";

export async function GET() {
  return NextResponse.json(db.getTags());
}

export async function POST(request: Request) {
  const payload = await request.json();
  if (!payload?.name) {
    return NextResponse.json({ message: "Name is required" }, { status: 400 });
  }
  const tag = db.addTag(payload.name);
  return NextResponse.json(tag);
}
