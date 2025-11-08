"use client";

import useSWR from "swr";
import useSWRMutation from "swr/mutation";

import { api } from "./client";
import { ApiError, optimisticUpdate } from "./fetcher";
import type { Font, Paginated, Tag, Category, Project } from "./schema";
import type { PaginationParams } from "./client";

export const useFonts = (params: PaginationParams, initialData?: Paginated<Font>) => {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (!value || (Array.isArray(value) && value.length === 0)) return;
    if (Array.isArray(value)) {
      value.forEach((item) => query.append(key, String(item)));
    } else {
      query.set(key, String(value));
    }
  });
  const key = `/fonts${query.toString() ? `?${query.toString()}` : ""}`;
  const swr = useSWR<Paginated<Font>>(key, () => api.fonts.list(params), {
    keepPreviousData: true,
    fallbackData: initialData
  });
  return swr;
};

export const useTags = (initialData?: Tag[]) =>
  useSWR<Tag[]>(`/tags`, () => api.tags.list(), { fallbackData: initialData });
export const useCategories = (initialData?: Category[]) =>
  useSWR<Category[]>(`/categories`, () => api.categories.list(), { fallbackData: initialData });
export const useProjects = (initialData?: Project[]) =>
  useSWR<Project[]>(`/projects`, () => api.projects.list(), { fallbackData: initialData });

export const useCreateTag = () =>
  useSWRMutation(`/tags`, (_key, { arg }: { arg: { name: string } }) => api.tags.create(arg));
export const useCreateCategory = () =>
  useSWRMutation(`/categories`, (_key, { arg }: { arg: { name: string } }) =>
    api.categories.create(arg)
  );
export const useCreateProject = () =>
  useSWRMutation(`/projects`, (_key, { arg }: { arg: { name: string; description?: string } }) =>
    api.projects.create(arg)
  );

export const useCreateFont = () =>
  useSWRMutation(`/fonts`, async (_key, { arg }: { arg: Parameters<typeof api.fonts.create>[0] }) =>
    api.fonts.create(arg)
  );

export const useUpdateFont = (id: string) =>
  useSWRMutation(`/fonts/${id}`, async (_key, { arg }: { arg: Parameters<typeof api.fonts.update>[1] }) =>
    api.fonts.update(id, arg)
  );

export const useOptimisticProjectAssignment = (projectId: string) => {
  const { data, mutate } = useSWR<Project>(`/projects/${projectId}`, () =>
    api.projects.detail(projectId)
  );

  const assign = async (fontIds: string[]) => {
    await optimisticUpdate(
      () => api.projects.updateFonts(projectId, fontIds),
      (project) => mutate(project, { revalidate: false }),
      (error) => {
        if (error instanceof ApiError) {
          console.error("Failed to update project", error.payload);
        }
      }
    );
    await mutate();
  };

  return { project: data, assign };
};
