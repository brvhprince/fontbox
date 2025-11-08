import { NextResponse } from "next/server";

import { db } from "../../../_data/store";

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const project = db.getProjects().find((item) => item.id === params.id);
  if (!project) {
    return NextResponse.json({ message: "Project not found" }, { status: 404 });
  }
  const payload = await request.json();
  const fontIds: string[] = Array.isArray(payload?.fontIds) ? payload.fontIds : project.fontIds;
  const updated = { ...project, fontIds };
  const result = db.setProject(updated);
  return NextResponse.json(result);
}
