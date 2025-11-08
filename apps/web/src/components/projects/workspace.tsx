"use client";

import { useMemo, useState } from "react";
import { Download, Plus } from "lucide-react";

import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  ScrollArea
} from "@fontbox/ui";

import { api } from "../../shared/api/client";
import type { Font, Project } from "../../shared/api/schema";
import { useCreateProject } from "../../shared/api/hooks";
import { useToast } from "../../shared/ui/toast";

interface ProjectsWorkspaceProps {
  projects: Project[];
  fonts: Font[];
}

type DraggedFont = { id: string; name: string } | null;

export function ProjectsWorkspace({ projects, fonts }: ProjectsWorkspaceProps) {
  const [projectList, setProjectList] = useState<Project[]>(projects);
  const [search, setSearch] = useState("");
  const [projectName, setProjectName] = useState("");
  const [draggedFont, setDraggedFont] = useState<DraggedFont>(null);

  const { trigger: createProject, isMutating } = useCreateProject();
  const toast = useToast();

  const filteredFonts = useMemo(() => {
    return fonts.filter((font) =>
      font.name.toLowerCase().includes(search.toLowerCase()) ||
      font.tags.some((tag) => tag.name.toLowerCase().includes(search.toLowerCase()))
    );
  }, [fonts, search]);

  const handleCreateProject = async () => {
    if (!projectName.trim()) return;
    try {
      const project = await createProject({ name: projectName.trim() });
      setProjectList((list) => [...list, project]);
      setProjectName("");
      toast({ title: "Project created", description: `${project.name} added to workspace.` });
    } catch (error) {
      toast({
        title: "Creation failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive"
      });
    }
  };

  const handleDrop = async (project: Project) => {
    if (!draggedFont) return;
    const updated = project.fontIds.includes(draggedFont.id)
      ? project.fontIds
      : [...project.fontIds, draggedFont.id];
    try {
      const updatedProject = await api.projects.updateFonts(project.id, updated);
      setProjectList((list) => list.map((item) => (item.id === project.id ? updatedProject : item)));
      toast({ title: "Font assigned", description: `${draggedFont.name} added to ${project.name}.` });
    } catch (error) {
      toast({
        title: "Assignment failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive"
      });
    } finally {
      setDraggedFont(null);
    }
  };

  const handleRemove = async (project: Project, fontId: string) => {
    try {
      const updated = project.fontIds.filter((id) => id !== fontId);
      const updatedProject = await api.projects.updateFonts(project.id, updated);
      setProjectList((list) => list.map((item) => (item.id === project.id ? updatedProject : item)));
      const font = fonts.find((item) => item.id === fontId);
      toast({
        title: "Font removed",
        description: font ? `${font.name} removed from ${project.name}.` : "",
        variant: "destructive"
      });
    } catch (error) {
      toast({
        title: "Removal failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive"
      });
    }
  };

  const exportProject = (project: Project) => {
    const projectFonts = project.fontIds
      .map((id) => fonts.find((font) => font.id === id))
      .filter(Boolean) as Font[];
    const blob = new Blob([JSON.stringify(projectFonts, null, 2)], {
      type: "application/json"
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${project.name}-fonts.json`;
    anchor.click();
    URL.revokeObjectURL(url);
    toast({ title: "Export ready", description: `${projectFonts.length} fonts exported.` });
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
      <aside className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Create project</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Input
              placeholder="Brand refresh"
              value={projectName}
              onChange={(event) => setProjectName(event.target.value)}
            />
            <Button onClick={handleCreateProject} disabled={isMutating}>
              <Plus className="mr-2 h-4 w-4" /> New project
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Font library</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Input
              placeholder="Search fonts"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
            <ScrollArea className="h-[320px]">
              <div className="space-y-2 pr-2">
                {filteredFonts.map((font) => (
                  <button
                    key={font.id}
                    className="w-full rounded-md border border-neutral-200 bg-white px-3 py-2 text-left text-sm hover:border-brand"
                    draggable
                    onDragStart={() => setDraggedFont({ id: font.id, name: font.name })}
                    onDragEnd={() => setDraggedFont(null)}
                  >
                    <p className="font-medium">{font.name}</p>
                    <p className="text-xs text-neutral-500">{font.tags.map((tag) => tag.name).join(", ")}</p>
                  </button>
                ))}
                {filteredFonts.length === 0 && (
                  <p className="text-xs text-neutral-500">No fonts found for “{search}”.</p>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </aside>

      <div className="space-y-6">
        {projectList.map((project) => (
          <Card
            key={project.id}
            onDragOver={(event) => event.preventDefault()}
            onDrop={() => handleDrop(project)}
            className="border-dashed border-neutral-200"
          >
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg">{project.name}</CardTitle>
                {project.description && <p className="text-sm text-neutral-500">{project.description}</p>}
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary">{project.fontIds.length} fonts</Badge>
                <Button variant="ghost" size="sm" onClick={() => exportProject(project)}>
                  <Download className="mr-2 h-4 w-4" /> Export
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-3">
                {project.fontIds.map((fontId) => {
                  const font = fonts.find((item) => item.id === fontId);
                  if (!font) return null;
                  return (
                    <Badge
                      key={fontId}
                      variant="default"
                      className="cursor-pointer"
                      onClick={() => handleRemove(project, fontId)}
                    >
                      {font.name}
                    </Badge>
                  );
                })}
                {project.fontIds.length === 0 && (
                  <p className="text-sm text-neutral-500">Drag fonts here to build this project.</p>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
