import { Suspense } from "react";

import { api } from "../../../shared/api/client";
import type { PaginationParams } from "../../../shared/api/client";
import { FontLibrary } from "../../../components/font-library";

const initialFilters: PaginationParams = {
  page: 1,
  pageSize: 24,
  search: "",
  tags: [],
  categories: [],
  weights: [],
  styles: []
};

async function FontLibrarySection() {
  const [fonts, tags, categories] = await Promise.all([
    api.fonts.list(initialFilters),
    api.tags.list(),
    api.categories.list()
  ]);

  return (
    <FontLibrary
      initialFonts={fonts}
      initialFilters={initialFilters}
      tags={tags}
      categories={categories}
    />
  );
}

export default function FontsPage() {
  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold">Fonts</h1>
        <p className="text-sm text-neutral-500">
          Explore your type catalog with rich previews, advanced filters, and lightning-fast search.
        </p>
      </header>
      <Suspense fallback={<div className="rounded-lg border border-dashed p-8 text-center text-neutral-500">Loading library…</div>}>
        {/* @ts-expect-error Async Server Component */}
        <FontLibrarySection />
      </Suspense>
    </div>
  );
}
