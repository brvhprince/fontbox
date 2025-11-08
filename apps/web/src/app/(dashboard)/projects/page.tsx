import { Suspense } from "react";

import { ProjectsWorkspace } from "../../../components/projects";
import { api } from "../../../shared/api/client";

async function ProjectsWorkspaceSection() {
  const [projects, fonts] = await Promise.all([api.projects.list(), api.fonts.list({ page: 1, pageSize: 100 })]);
  return <ProjectsWorkspace projects={projects} fonts={fonts.data} />;
}

export default function ProjectsPage() {
  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold">Projects</h1>
        <p className="text-sm text-neutral-500">Group fonts by initiative, export assets, and coordinate delivery across teams.</p>
      </header>
      <Suspense fallback={<div className="rounded-lg border border-dashed p-8 text-center text-neutral-500">Loading projects…</div>}>
        {/* @ts-expect-error Async Server Component */}
        <ProjectsWorkspaceSection />
      </Suspense>
    </div>
  );
}
