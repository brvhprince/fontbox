import { randomUUID } from "crypto";

import type { Category, Font, Project, Tag } from "../../../shared/api/schema";

interface AuthUser {
  id: string;
  email: string;
  name: string;
  password: string;
}

const now = new Date().toISOString();

const initialTags: Tag[] = [
  { id: "tag-serif", name: "Serif", slug: "serif" },
  { id: "tag-sans", name: "Sans", slug: "sans" },
  { id: "tag-display", name: "Display", slug: "display" },
  { id: "tag-handwritten", name: "Handwritten", slug: "handwritten" }
];

const initialCategories: Category[] = [
  { id: "cat-brand", name: "Brand", slug: "brand" },
  { id: "cat-editorial", name: "Editorial", slug: "editorial" },
  { id: "cat-ui", name: "UI", slug: "ui" }
];

const initialFonts: Font[] = [
  {
    id: "font-alegreya",
    name: "Alegreya",
    family: "Alegreya",
    previewUrl: "https://images.fontbox.app/alegreya.png",
    tags: [initialTags[0]],
    categories: [initialCategories[1]],
    metadata: {
      style: "Regular",
      weight: 400,
      foundry: "Huerta Tipográfica",
      license: "OFL",
      description: "Humanist serif with excellent readability for long-form content."
    },
    createdAt: now,
    updatedAt: now
  },
  {
    id: "font-inter",
    name: "Inter",
    family: "Inter",
    previewUrl: "https://images.fontbox.app/inter.png",
    tags: [initialTags[1]],
    categories: [initialCategories[2]],
    metadata: {
      style: "Regular",
      weight: 400,
      foundry: "Rasmus Andersson",
      license: "OFL",
      description: "Workhorse sans-serif optimised for screens and dense UI."
    },
    createdAt: now,
    updatedAt: now
  },
  {
    id: "font-libre-baskerville",
    name: "Libre Baskerville",
    family: "Libre Baskerville",
    previewUrl: "https://images.fontbox.app/libre-baskerville.png",
    tags: [initialTags[0], initialTags[2]],
    categories: [initialCategories[1]],
    metadata: {
      style: "Italic",
      weight: 400,
      foundry: "Impallari Type",
      license: "OFL",
      description: "Classic book face modernised for digital reading."
    },
    createdAt: now,
    updatedAt: now
  }
];

const initialProjects: Project[] = [
  {
    id: "project-brand-refresh",
    name: "Brand refresh",
    description: "Fonts for the new marketing website relaunch.",
    fontIds: ["font-alegreya", "font-inter"],
    createdAt: now
  },
  {
    id: "project-mobile-app",
    name: "Mobile app",
    description: "UI fonts for the mobile product team.",
    fontIds: ["font-inter"],
    createdAt: now
  }
];

const users: AuthUser[] = [
  {
    id: "user-admin",
    email: "demo@fontbox.app",
    name: "Demo User",
    password: "password"
  }
];

let fonts = [...initialFonts];
let tags = [...initialTags];
let categories = [...initialCategories];
let projects = [...initialProjects];

export const db = {
  getFonts: () => fonts,
  getFont: (id: string) => fonts.find((font) => font.id === id) ?? null,
  setFont: (font: Font) => {
    fonts = fonts.map((item) => (item.id === font.id ? font : item));
  },
  createFont: (font: Omit<Font, "createdAt" | "updatedAt">) => {
    const now = new Date().toISOString();
    const fullFont: Font = { ...font, createdAt: now, updatedAt: now };
    fonts = [fullFont, ...fonts];
    return fullFont;
  },
  deleteFont: (id: string) => {
    fonts = fonts.filter((font) => font.id !== id);
  },
  getTags: () => tags,
  addTag: (name: string) => {
    const slug = name.trim().toLowerCase().replace(/\s+/g, "-");
    const tag = { id: randomUUID(), name, slug };
    tags = [...tags, tag];
    return tag;
  },
  getCategories: () => categories,
  addCategory: (name: string) => {
    const slug = name.trim().toLowerCase().replace(/\s+/g, "-");
    const category = { id: randomUUID(), name, slug };
    categories = [...categories, category];
    return category;
  },
  getProjects: () => projects,
  setProject: (project: Project) => {
    projects = projects.map((item) => (item.id === project.id ? project : item));
    return project;
  },
  addProject: (payload: { name: string; description?: string }) => {
    const project: Project = {
      id: randomUUID(),
      name: payload.name,
      description: payload.description,
      fontIds: [],
      createdAt: new Date().toISOString()
    };
    projects = [...projects, project];
    return project;
  },
  getUserByEmail: (email: string) => users.find((user) => user.email === email) ?? null,
  getUserById: (id: string) => users.find((user) => user.id === id) ?? null,
  addUser: (payload: { email: string; password: string; name: string }) => {
    const user: AuthUser = {
      id: randomUUID(),
      email: payload.email,
      name: payload.name,
      password: payload.password
    };
    users.push(user);
    return user;
  }
};
