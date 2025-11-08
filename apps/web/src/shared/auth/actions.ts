"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { api } from "../api/client";

const AUTH_COOKIE = "fontbox_session";

export const loginAction = async (formData: FormData) => {
  const payload = {
    email: String(formData.get("email") ?? ""),
    password: String(formData.get("password") ?? "")
  };

  const response = await api.auth.login(payload);
  if (response.accessToken) {
    cookies().set(AUTH_COOKIE, response.accessToken, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/"
    });
  }
  redirect("/fonts");
};

export const registerAction = async (formData: FormData) => {
  const payload = {
    displayName: String(formData.get("name") ?? ""),
    email: String(formData.get("email") ?? ""),
    password: String(formData.get("password") ?? "")
  };

  const response = await api.auth.register(payload);
  if (response.accessToken) {
    cookies().set(AUTH_COOKIE, response.accessToken, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/"
    });
  }
  redirect("/fonts");
};

export const logoutAction = async () => {
  await api.auth.logout();
  cookies().delete(AUTH_COOKIE);
  redirect("/login");
};
