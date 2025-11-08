import { z } from "zod";

type ApiMethod = "GET" | "POST" | "PATCH" | "DELETE";

const publicApiBase = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api";
const internalApiBase = process.env.API_INTERNAL_URL ?? publicApiBase;

interface FetchOptions<TSchema extends z.ZodTypeAny | undefined> {
  method?: ApiMethod;
  schema?: TSchema;
  body?: unknown;
  signal?: AbortSignal;
  headers?: HeadersInit;
  cache?: RequestCache;
}

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly payload?: unknown
  ) {
    super(message);
  }
}

export const apiFetch = async <TSchema extends z.ZodTypeAny | undefined = undefined>(
  path: string,
  { method = "GET", schema, body, signal, headers, cache: cacheMode }: FetchOptions<TSchema> = {}
): Promise<TSchema extends z.ZodTypeAny ? z.infer<TSchema> : unknown> => {
  const requestHeaders = new Headers(headers);
  requestHeaders.set("Content-Type", "application/json");

  const baseUrl = typeof window === "undefined" ? internalApiBase : publicApiBase;
  const resolvedPath = path.startsWith("http") ? path : `${baseUrl}${path}`;

  const response = await fetch(resolvedPath, {
    method,
    headers: requestHeaders,
    body: body ? JSON.stringify(body) : undefined,
    credentials: "include",
    signal,
    cache: cacheMode
  });

  if (!response.ok) {
    const payload = await safeJson(response);
    throw new ApiError(payload?.message ?? response.statusText, response.status, payload);
  }

  if (response.status === 204) {
    return undefined as never;
  }

  const data = await response.json();
  if (schema) {
    return schema.parse(data) as never;
  }
  return data as never;
};

const safeJson = async (response: Response) => {
  try {
    return await response.json();
  } catch (error) {
    return undefined;
  }
};

export const swrFetcher = (url: string) => apiFetch(url);

export const optimisticUpdate = async <T>(
  updater: () => Promise<T>,
  onSuccess: (value: T) => void,
  onError: (error: unknown) => void
) => {
  try {
    const result = await updater();
    onSuccess(result);
  } catch (error) {
    onError(error);
    throw error;
  }
};
