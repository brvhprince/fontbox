import { z } from "zod";

import { apiFetch } from "./fetcher";
import {
  authResponseSchema,
  authUserSchema,
  fontSchema,
  paginatedResponse,
  projectSchema,
  tagSchema,
  categorySchema,
  uploadFontSchema,
  type Font,
  type Paginated,
  type Project,
  type Tag,
  type Category
} from "./schema";

export interface PaginationParams {
  page?: number;
  pageSize?: number;
  search?: string;
  tags?: string[];
  categories?: string[];
  weights?: number[];
  styles?: string[];
}

const buildQuery = (params: Record<string, unknown>) => {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null) return;
    if (Array.isArray(value)) {
      value.forEach((item) => search.append(key, String(item)));
    } else {
      search.set(key, String(value));
    }
  });
  const qs = search.toString();
  return qs ? `?${qs}` : "";
};

export const api = {
  fonts: {
    list: async (params: PaginationParams = {}): Promise<Paginated<Font>> => {
      const schema = paginatedResponse(fontSchema);
      return apiFetch(`/fonts${buildQuery(params)}`, { schema });
    },
    detail: async (id: string) => apiFetch(`/fonts/${id}`, { schema: fontSchema }),
    create: async (payload: z.infer<typeof uploadFontSchema>) =>
      apiFetch(`/fonts`, { method: "POST", body: payload, schema: fontSchema }),
    update: async (id: string, payload: Partial<z.infer<typeof uploadFontSchema>>) =>
      apiFetch(`/fonts/${id}`, { method: "PATCH", body: payload, schema: fontSchema }),
    remove: async (id: string) => apiFetch(`/fonts/${id}`, { method: "DELETE" })
  },
  tags: {
    list: async () => apiFetch(`/tags`, { schema: z.array(tagSchema) }),
    create: async (payload: { name: string }) =>
      apiFetch(`/tags`, { method: "POST", body: payload, schema: tagSchema })
  },
  categories: {
    list: async () => apiFetch(`/categories`, { schema: z.array(categorySchema) }),
    create: async (payload: { name: string }) =>
      apiFetch(`/categories`, {
        method: "POST",
        body: payload,
        schema: categorySchema
      })
  },
  projects: {
    list: async () => apiFetch(`/projects`, { schema: z.array(projectSchema) }),
    detail: async (id: string): Promise<Project> =>
      apiFetch(`/projects/${id}`, { schema: projectSchema }),
    create: async (payload: { name: string; description?: string }) =>
      apiFetch(`/projects`, {
        method: "POST",
        body: payload,
        schema: projectSchema
      }),
    updateFonts: async (id: string, fontIds: string[]) =>
      apiFetch(`/projects/${id}/fonts`, {
        method: "PATCH",
        body: { fontIds },
        schema: projectSchema
      })
  },
  auth: {
    me: async () => apiFetch(`/auth/me`, { schema: authUserSchema }),
    login: async (payload: { email: string; password: string }) =>
      apiFetch(`/auth/login`, { method: "POST", body: payload, schema: authResponseSchema }),
    register: async (payload: { name: string; email: string; password: string }) =>
      apiFetch(`/auth/register`, {
        method: "POST",
        body: payload,
        schema: authResponseSchema
      }),
    logout: async () => apiFetch(`/auth/logout`, { method: "POST" }),
    refresh: async () => apiFetch(`/auth/refresh`, { method: "POST", schema: authResponseSchema })
  }
};
