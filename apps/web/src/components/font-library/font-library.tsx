"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { LayoutGrid, List, RefreshCcw } from "lucide-react";

import {
  Badge,
  Button,
  Checkbox,
  Input,
  ScrollArea,
  Separator,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from "@fontbox/ui";

import type { Category, Font, Paginated, Tag } from "../../shared/api/schema";
import { useCategories, useFonts, useTags } from "../../shared/api/hooks";
import type { PaginationParams } from "../../shared/api/client";
import { UploadDialog } from "./upload-dialog";
import { FontCard } from "./font-card";

export interface FontLibraryProps {
  initialFonts: Paginated<Font>;
  initialFilters: PaginationParams;
  tags: Tag[];
  categories: Category[];
}

const defaultFilters: PaginationParams = {
  page: 1,
  pageSize: 24,
  search: "",
  tags: [],
  categories: [],
  weights: [],
  styles: []
};

export function FontLibrary({ initialFonts, initialFilters, tags, categories }: FontLibraryProps) {
  const [filters, setFilters] = useState<PaginationParams>({ ...defaultFilters, ...initialFilters });
  const [view, setView] = useState<"grid" | "list">("grid");
  const searchRef = useRef<HTMLInputElement | null>(null);

  const { data: fontResponse, isValidating } = useFonts(filters, initialFonts);
  const fonts = fontResponse ?? initialFonts;

  const { data: tagData, mutate: mutateTags } = useTags(tags);
  const { data: categoryData, mutate: mutateCategories } = useCategories(categories);

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (event.key === "/" && document.activeElement !== searchRef.current) {
        event.preventDefault();
        searchRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const activeFilters = useMemo(() => {
    return [
      ...(filters.tags ?? []).map((tag) => ({ type: "tag", value: tag })),
      ...(filters.categories ?? []).map((category) => ({ type: "category", value: category })),
      ...(filters.weights ?? []).map((weight) => ({ type: "weight", value: String(weight) })),
      ...(filters.styles ?? []).map((style) => ({ type: "style", value: style }))
    ];
  }, [filters]);

  const toggleFilter = (
    type: keyof Pick<PaginationParams, "tags" | "categories" | "weights" | "styles">,
    value: string | number
  ) => {
    setFilters((current) => {
      const values = new Set((current[type] ?? []) as (string | number)[]);
      if (values.has(value)) {
        values.delete(value);
      } else {
        values.add(value);
      }
      return { ...current, page: 1, [type]: Array.from(values) as never };
    });
  };

  const clearFilters = () => setFilters(defaultFilters);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-lg border border-neutral-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex-1">
            <Input
              ref={searchRef}
              placeholder="Search fonts… (/ to focus)"
              defaultValue={filters.search}
              onChange={(event) =>
                setFilters((current) => ({ ...current, page: 1, search: event.target.value }))
              }
            />
          </div>
          <Tabs value={view} onValueChange={(value) => setView(value as "grid" | "list")}>
            <TabsList>
              <TabsTrigger value="grid">
                <LayoutGrid className="mr-2 h-4 w-4" /> Grid
              </TabsTrigger>
              <TabsTrigger value="list">
                <List className="mr-2 h-4 w-4" /> List
              </TabsTrigger>
            </TabsList>
          </Tabs>
          <UploadDialog
            existingFonts={fonts.data}
            tags={tagData ?? []}
            categories={categoryData ?? []}
            onTagCreated={() => mutateTags()}
            onCategoryCreated={() => mutateCategories()}
          />
        </div>
        <ScrollArea className="max-h-60 rounded border border-neutral-100">
          <div className="grid gap-6 p-4 md:grid-cols-2 lg:grid-cols-4">
            {tagData?.map((tag) => {
              const isActive = filters.tags?.includes(tag.slug);
              return (
                <label
                  key={tag.id}
                  className={`flex cursor-pointer items-center justify-between rounded-md border px-3 py-2 text-sm ${
                    isActive ? "border-brand bg-brand-subtle text-brand-emphasis" : "border-neutral-200"
                  }`}
                >
                  <span>{tag.name}</span>
                  <Checkbox
                    checked={isActive}
                    onCheckedChange={() => toggleFilter("tags", tag.slug)}
                    aria-label={`Toggle tag ${tag.name}`}
                  />
                </label>
              );
            })}
          </div>
        </ScrollArea>
        <ScrollArea className="max-h-40 rounded border border-neutral-100">
          <div className="grid gap-4 p-4 md:grid-cols-2 lg:grid-cols-3">
            {categoryData?.map((category) => {
              const isActive = filters.categories?.includes(category.slug);
              return (
                <label
                  key={category.id}
                  className={`flex cursor-pointer items-center justify-between rounded-md border px-3 py-2 text-sm ${
                    isActive ? "border-brand bg-brand-subtle text-brand-emphasis" : "border-neutral-200"
                  }`}
                >
                  <span>{category.name}</span>
                  <Checkbox
                    checked={isActive}
                    onCheckedChange={() => toggleFilter("categories", category.slug)}
                    aria-label={`Toggle category ${category.name}`}
                  />
                </label>
              );
            })}
          </div>
        </ScrollArea>
        {activeFilters.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            {activeFilters.map((filter) => (
              <Badge key={`${filter.type}-${filter.value}`} variant="secondary">
                {filter.type}: {filter.value}
              </Badge>
            ))}
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              <RefreshCcw className="mr-2 h-3.5 w-3.5" /> Reset
            </Button>
          </div>
        )}
      </div>

      <Separator />

      <div className="space-y-4">
        <div className="flex items-center justify-between text-sm text-neutral-500">
          <span>
            Showing {fonts.data.length} of {fonts.total} fonts
          </span>
          {isValidating && <span>Refreshing library…</span>}
        </div>
        <Tabs value={view} onValueChange={(value) => setView(value as "grid" | "list")}>
          <TabsContent value="grid" className="grid grid-cols-library gap-4">
            {fonts.data.map((font) => (
              <FontCard key={font.id} font={font} view="grid" />
            ))}
          </TabsContent>
          <TabsContent value="list" className="space-y-4">
            {fonts.data.map((font) => (
              <FontCard key={font.id} font={font} view="list" />
            ))}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
