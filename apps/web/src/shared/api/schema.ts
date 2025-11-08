import { z } from "zod";

export const tagSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string()
});

export const categorySchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string()
});

export const fontMetadataSchema = z.object({
  style: z.string(),
  weight: z.number(),
  foundry: z.string().optional(),
  license: z.string().optional(),
  description: z.string().optional()
});

export const fontSchema = z.object({
  id: z.string(),
  name: z.string(),
  family: z.string(),
  previewUrl: z.string().url().optional(),
  tags: z.array(tagSchema),
  categories: z.array(categorySchema),
  metadata: fontMetadataSchema,
  createdAt: z.string(),
  updatedAt: z.string()
});

export const projectSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  fontIds: z.array(z.string()),
  createdAt: z.string()
});

export const paginatedResponse = <T extends z.ZodTypeAny>(item: T) =>
  z.object({
    items: z.array(item),
    page: z.number(),
    pageSize: z.number(),
    total: z.number()
  }).transform((data) => ({
    data: data.items,
    page: data.page,
    pageSize: data.pageSize,
    total: data.total,
    hasMore: data.page * data.pageSize < data.total
  }));

export const authUserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  displayName: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string()
});

export const authResponseSchema = z.object({
  user: authUserSchema,
  accessToken: z.string().optional()
});

export const uploadFontSchema = z.object({
  name: z.string(),
  family: z.string(),
  tags: z.array(z.string()).optional(),
  categories: z.array(z.string()).optional(),
  metadata: fontMetadataSchema.partial()
});

export type Font = z.infer<typeof fontSchema>;
export type Tag = z.infer<typeof tagSchema>;
export type Category = z.infer<typeof categorySchema>;
export type Project = z.infer<typeof projectSchema>;
export type Paginated<T> = {
  data: T[];
  page: number;
  pageSize: number;
  total: number;
  hasMore: boolean;
};
export type AuthUser = z.infer<typeof authUserSchema>;
