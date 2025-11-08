import { NextResponse } from "next/server";

import { db } from "../../_data/store";

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  const project = db.getProjects().find((item) => item.id === params.id);
  if (!project) {
    return NextResponse.json({ message: "Project not found" }, { status: 404 });
  }
  return NextResponse.json(project);
}
