import { NextResponse } from "next/server";

import { db } from "../_data/store";

export async function GET() {
  return NextResponse.json(db.getCategories());
}

export async function POST(request: Request) {
  const payload = await request.json();
  if (!payload?.name) {
    return NextResponse.json({ message: "Name is required" }, { status: 400 });
  }
  const category = db.addCategory(payload.name);
  return NextResponse.json(category);
}
