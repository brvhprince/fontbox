import { notFound } from "next/navigation";

import { api } from "../../../../shared/api/client";
import { FontDetail } from "../../../../components/font-detail";

interface FontDetailPageProps {
  params: { id: string };
}

export default async function FontDetailPage({ params }: FontDetailPageProps) {
  const [font, tags, categories, projects] = await Promise.all([
    api.fonts.detail(params.id).catch(() => null),
    api.tags.list(),
    api.categories.list(),
    api.projects.list()
  ]);

  if (!font) {
    notFound();
  }

  return (
    <div className="space-y-8">
      <FontDetail font={font} tags={tags} categories={categories} projects={projects} />
    </div>
  );
}
