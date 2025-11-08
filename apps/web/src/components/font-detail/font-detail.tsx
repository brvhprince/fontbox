"use client";

import { useState } from "react";
import { Download, Loader2, Save } from "lucide-react";

import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  Label,
  ScrollArea,
  Separator,
  Textarea
} from "@fontbox/ui";

import { api } from "../../shared/api/client";
import type { Category, Font, Project, Tag } from "../../shared/api/schema";
import { useUpdateFont } from "../../shared/api/hooks";
import { useToast } from "../../shared/ui/toast";

interface FontDetailProps {
  font: Font;
  tags: Tag[];
  categories: Category[];
  projects: Project[];
}

export function FontDetail({ font, tags, categories, projects }: FontDetailProps) {
  const [metadata, setMetadata] = useState({ ...font.metadata });
  const [selectedTags, setSelectedTags] = useState<string[]>(font.tags.map((tag) => tag.slug));
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    font.categories.map((category) => category.slug)
  );
  const [assignments, setAssignments] = useState<Record<string, boolean>>(() => {
    const map: Record<string, boolean> = {};
    projects.forEach((project) => {
      map[project.id] = project.fontIds.includes(font.id);
    });
    return map;
  });
  const [saving, setSaving] = useState(false);

  const toast = useToast();
  const { trigger: updateFont, isMutating } = useUpdateFont(font.id);

  const toggle = (value: string, current: string[], setter: (value: string[]) => void) => {
    setter(current.includes(value) ? current.filter((item) => item !== value) : [...current, value]);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateFont({
        metadata,
        tags: selectedTags,
        categories: selectedCategories
      });
      toast({ title: "Font updated", description: "Metadata saved successfully." });
    } catch (error) {
      toast({
        title: "Update failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const handleProjectToggle = async (project: Project) => {
    const nextState = !assignments[project.id];
    setAssignments((state) => ({ ...state, [project.id]: nextState }));
    try {
      const updatedIds = nextState
        ? Array.from(new Set([...project.fontIds, font.id]))
        : project.fontIds.filter((id) => id !== font.id);
      await api.projects.updateFonts(project.id, updatedIds);
      toast({
        title: "Project updated",
        description: `${project.name} ${nextState ? "includes" : "excludes"} ${font.name}`
      });
    } catch (error) {
      setAssignments((state) => ({ ...state, [project.id]: !nextState }));
      toast({
        title: "Assignment failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl">{font.name}</CardTitle>
            <Button asChild variant="secondary">
              <a href={font.previewUrl ?? "#"} download>
                <Download className="mr-2 h-4 w-4" /> Download preview
              </a>
            </Button>
          </div>
          <p className="text-sm text-neutral-500">
            {font.family} · {font.metadata.style} · {font.metadata.weight}
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="rounded-lg bg-surface-muted p-6 text-3xl font-medium">
            The quick brown fox jumps over the lazy dog.
          </div>
          <div className="flex flex-wrap gap-2">
            {font.tags.map((tag) => (
              <Badge key={tag.id} variant="secondary">
                {tag.name}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <Save className="h-5 w-5" /> Metadata
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="style">Style</Label>
              <Input
                id="style"
                value={metadata.style}
                onChange={(event) => setMetadata((state) => ({ ...state, style: event.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="weight">Weight</Label>
              <Input
                id="weight"
                type="number"
                value={metadata.weight}
                onChange={(event) => setMetadata((state) => ({ ...state, weight: Number(event.target.value) }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="foundry">Foundry</Label>
              <Input
                id="foundry"
                value={metadata.foundry ?? ""}
                onChange={(event) => setMetadata((state) => ({ ...state, foundry: event.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="license">License</Label>
              <Input
                id="license"
                value={metadata.license ?? ""}
                onChange={(event) => setMetadata((state) => ({ ...state, license: event.target.value }))}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={metadata.description ?? ""}
              onChange={(event) => setMetadata((state) => ({ ...state, description: event.target.value }))}
            />
          </div>
          <Separator />
          <div className="space-y-3">
            <Label>Tags</Label>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <Badge
                  key={tag.id}
                  variant={selectedTags.includes(tag.slug) ? "default" : "secondary"}
                  className="cursor-pointer"
                  onClick={() => toggle(tag.slug, selectedTags, setSelectedTags)}
                >
                  {tag.name}
                </Badge>
              ))}
            </div>
          </div>
          <div className="space-y-3">
            <Label>Categories</Label>
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <Badge
                  key={category.id}
                  variant={selectedCategories.includes(category.slug) ? "default" : "secondary"}
                  className="cursor-pointer"
                  onClick={() => toggle(category.slug, selectedCategories, setSelectedCategories)}
                >
                  {category.name}
                </Badge>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Button onClick={handleSave} disabled={isMutating || saving}>
              {isMutating || saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}Save changes
            </Button>
            <p className="text-xs text-neutral-500">Changes apply instantly across the workspace.</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Projects</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="max-h-64">
            <div className="space-y-4">
              {projects.map((project) => (
                <div
                  key={project.id}
                  className="flex items-center justify-between rounded-md border border-neutral-200 p-4"
                >
                  <div>
                    <p className="font-medium">{project.name}</p>
                    <p className="text-sm text-neutral-500">{project.description ?? ""}</p>
                  </div>
                  <Button
                    variant={assignments[project.id] ? "default" : "secondary"}
                    onClick={() => handleProjectToggle(project)}
                  >
                    {assignments[project.id] ? "Assigned" : "Assign"}
                  </Button>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
