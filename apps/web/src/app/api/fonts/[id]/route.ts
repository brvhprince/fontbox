import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { db } from "../../_data/store";
import { fontSchema, uploadFontSchema } from "../../../../shared/api/schema";

export async function GET(_request: NextRequest, { params }: { params: { id: string } }) {
  const font = db.getFont(params.id);
  if (!font) {
    return NextResponse.json({ message: "Font not found" }, { status: 404 });
  }
  return NextResponse.json(fontSchema.parse(font));
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const font = db.getFont(params.id);
  if (!font) {
    return NextResponse.json({ message: "Font not found" }, { status: 404 });
  }
  const payload = await request.json();
  const parsed = uploadFontSchema.partial().parse(payload);
  const tags = db.getTags();
  const categories = db.getCategories();

  const updated = {
    ...font,
    name: parsed.name ?? font.name,
    family: parsed.family ?? font.family,
    tags:
      parsed.tags?.map((slug) => tags.find((tag) => tag.slug === slug)).filter(Boolean) ?? font.tags,
    categories:
      parsed.categories
        ?.map((slug) => categories.find((category) => category.slug === slug))
        .filter(Boolean) ?? font.categories,
    metadata: {
      ...font.metadata,
      ...parsed.metadata
    },
    updatedAt: new Date().toISOString()
  };
  db.setFont(updated);
  return NextResponse.json(fontSchema.parse(updated));
}

export async function DELETE(_request: NextRequest, { params }: { params: { id: string } }) {
  db.deleteFont(params.id);
  return new NextResponse(null, { status: 204 });
}
