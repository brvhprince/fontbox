"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { api } from "../api/client";

const AUTH_COOKIE = "fontbox.session";

export const loginAction = async (_prevState: unknown, formData: FormData) => {
  const payload = {
    email: String(formData.get("email") ?? ""),
    password: String(formData.get("password") ?? "")
  };

  const response = await api.auth.login(payload);
  if (response.token) {
    cookies().set(AUTH_COOKIE, response.token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/"
    });
  }
  redirect("/fonts");
};

export const registerAction = async (_prevState: unknown, formData: FormData) => {
  const payload = {
    name: String(formData.get("name") ?? ""),
    email: String(formData.get("email") ?? ""),
    password: String(formData.get("password") ?? "")
  };

  const response = await api.auth.register(payload);
  if (response.token) {
    cookies().set(AUTH_COOKIE, response.token, {
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
