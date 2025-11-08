import { NextResponse } from "next/server";

import { db } from "../_data/store";

export async function GET() {
  return NextResponse.json(db.getProjects());
}

export async function POST(request: Request) {
  const payload = await request.json();
  if (!payload?.name) {
    return NextResponse.json({ message: "Name is required" }, { status: 400 });
  }
  const project = db.addProject({ name: payload.name, description: payload.description });
  return NextResponse.json(project);
}
