import Link from "next/link";
import Image from "next/image";
import { Badge, Card, CardContent, CardHeader, CardTitle } from "@fontbox/ui";

import type { Font } from "../../shared/api/schema";

interface FontCardProps {
  font: Font;
  view: "grid" | "list";
}

export function FontCard({ font, view }: FontCardProps) {
  return (
    <Card className={view === "list" ? "flex items-center" : ""}>
      <CardHeader className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold">{font.name}</CardTitle>
          <span className="text-xs text-neutral-500">{font.metadata.style}</span>
        </div>
        {font.previewUrl ? (
          <div className="relative h-32 w-full overflow-hidden rounded-md bg-surface-muted">
            <Image
              src={font.previewUrl}
              alt={`${font.name} preview`}
              fill
              className="object-cover"
            />
          </div>
        ) : (
          <div className="flex h-32 w-full items-center justify-center rounded-md bg-surface-muted font-medium text-neutral-500">
            {font.family}
          </div>
        )}
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex flex-wrap gap-2 text-xs text-neutral-500">
          <span>Weight {font.metadata.weight}</span>
          {font.metadata.foundry && <span>Foundry {font.metadata.foundry}</span>}
          {font.metadata.license && <span>License {font.metadata.license}</span>}
        </div>
        <div className="flex flex-wrap gap-2">
          {font.tags.map((tag) => (
            <Badge key={tag.id} variant="secondary">
              {tag.name}
            </Badge>
          ))}
        </div>
        <Link href={`/fonts/${font.id}`} className="text-sm font-medium text-brand">
          View details
        </Link>
      </CardContent>
    </Card>
  );
}
