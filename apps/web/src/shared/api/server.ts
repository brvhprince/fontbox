"use server";

import { revalidatePath } from "next/cache";

import { api } from "./client";

export const createFontAction = async (formData: FormData) => {
  const payload = Object.fromEntries(formData.entries());
  const parsed = {
    name: String(payload.name ?? ""),
    family: String(payload.family ?? ""),
    tags: payload.tags ? String(payload.tags).split(",").filter(Boolean) : [],
    categories: payload.categories
      ? String(payload.categories).split(",").filter(Boolean)
      : [],
    metadata: {
      style: String(payload.style ?? "Regular"),
      weight: Number(payload.weight ?? 400),
      foundry: payload.foundry ? String(payload.foundry) : undefined,
      license: payload.license ? String(payload.license) : undefined,
      description: payload.description ? String(payload.description) : undefined
    }
  };

  await api.fonts.create(parsed as never);
  revalidatePath("/fonts");
};

export const updateFontMetadataAction = async (id: string, formData: FormData) => {
  const payload = Object.fromEntries(formData.entries());
  await api.fonts.update(id, {
    metadata: {
      style: payload.style ? String(payload.style) : undefined,
      weight: payload.weight ? Number(payload.weight) : undefined,
      foundry: payload.foundry ? String(payload.foundry) : undefined,
      license: payload.license ? String(payload.license) : undefined,
      description: payload.description ? String(payload.description) : undefined
    }
  });
  revalidatePath(`/fonts/${id}`);
};

export const assignFontsToProjectAction = async (projectId: string, fontIds: string[]) => {
  await api.projects.updateFonts(projectId, fontIds);
  revalidatePath(`/projects`);
  revalidatePath(`/fonts`);
};

export const logoutAction = async () => {
  await api.auth.logout();
  revalidatePath("/");
};
