import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { db } from "../_data/store";
import { fontSchema, paginatedResponse, uploadFontSchema } from "../../../shared/api/schema";

const listSchema = paginatedResponse(fontSchema);

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const page = Number(searchParams.get("page") ?? 1);
  const pageSize = Number(searchParams.get("pageSize") ?? 24);
  const search = searchParams.get("search")?.toLowerCase();
  const tagFilters = searchParams.getAll("tags");
  const categoryFilters = searchParams.getAll("categories");
  const weightFilters = searchParams.getAll("weights").map(Number);
  const styleFilters = searchParams.getAll("styles").map((style) => style.toLowerCase());

  let fonts = db.getFonts();
  if (search) {
    fonts = fonts.filter((font) =>
      font.name.toLowerCase().includes(search) ||
      font.family.toLowerCase().includes(search) ||
      font.tags.some((tag) => tag.name.toLowerCase().includes(search))
    );
  }

  if (tagFilters.length > 0) {
    fonts = fonts.filter((font) =>
      tagFilters.every((filter) => font.tags.some((tag) => tag.slug === filter))
    );
  }

  if (categoryFilters.length > 0) {
    fonts = fonts.filter((font) =>
      categoryFilters.every((filter) => font.categories.some((category) => category.slug === filter))
    );
  }

  if (weightFilters.length > 0) {
    fonts = fonts.filter((font) => weightFilters.includes(font.metadata.weight));
  }

  if (styleFilters.length > 0) {
    fonts = fonts.filter((font) => styleFilters.includes(font.metadata.style.toLowerCase()));
  }

  const start = (page - 1) * pageSize;
  const data = fonts.slice(start, start + pageSize);
  const response = listSchema.parse({
    data,
    page,
    pageSize,
    total: fonts.length,
    hasMore: start + pageSize < fonts.length
  });
  return NextResponse.json(response);
}

export async function POST(request: NextRequest) {
  const payload = await request.json();
  const parsed = uploadFontSchema.parse(payload);
  const tags = db.getTags();
  const categories = db.getCategories();

  const font = db.createFont({
    id: `font-${randomUUID()}`,
    name: parsed.name,
    family: parsed.family,
    previewUrl: `https://images.fontbox.app/${parsed.name.toLowerCase().replace(/\s+/g, "-")}.png`,
    tags: (parsed.tags ?? [])
      .map((slug) => tags.find((tag) => tag.slug === slug))
      .filter(Boolean) as typeof tags,
    categories: (parsed.categories ?? [])
      .map((slug) => categories.find((category) => category.slug === slug))
      .filter(Boolean) as typeof categories,
    metadata: {
      style: parsed.metadata.style ?? "Regular",
      weight: parsed.metadata.weight ?? 400,
      foundry: parsed.metadata.foundry,
      license: parsed.metadata.license,
      description: parsed.metadata.description
    }
  });
  return NextResponse.json(font);
}
