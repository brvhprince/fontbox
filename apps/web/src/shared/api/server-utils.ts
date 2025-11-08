import { cookies } from "next/headers";
import { cache } from "react";

const AUTH_COOKIE = "fontbox_session";

export const getSessionToken = cache(() => {
  try {
    return cookies().get(AUTH_COOKIE)?.value ?? null;
  } catch (error) {
    return null;
  }
});
