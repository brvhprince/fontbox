import Link from "next/link";
import { redirect } from "next/navigation";

import { Button, Input, Label } from "@fontbox/ui";

import { loginAction } from "@/shared/auth/actions";
import { getSessionToken } from "@/shared/api/server-utils";

export default async function LoginPage() {
  const session = getSessionToken();
  if (session) {
    redirect("/fonts");
  }

  return (
    <form action={loginAction} className="space-y-6">
      <header className="space-y-2 text-center">
        <h1 className="text-2xl font-semibold">Welcome back</h1>
        <p className="text-sm text-neutral-500">
          Sign in to manage your font library and collaborate with your team.
        </p>
      </header>
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" required placeholder="you@example.com" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input id="password" name="password" type="password" required placeholder="••••••••" />
        </div>
      </div>
      <Button type="submit" className="w-full">
        Sign in
      </Button>
      <p className="text-center text-sm text-neutral-500">
        Need an account?{" "}
        <Link href="/register" className="font-medium text-brand">
          Create one
        </Link>
      </p>
    </form>
  );
}
