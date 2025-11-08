import Link from "next/link";
import { redirect } from "next/navigation";

import { Button, Input, Label } from "@fontbox/ui";

import { registerAction } from "../../../shared/auth/actions";
import { getSessionToken } from "../../../shared/api/fetcher";

export default async function RegisterPage() {
  const session = getSessionToken();
  if (session) {
    redirect("/fonts");
  }

  return (
    <form action={registerAction} className="space-y-6">
      <header className="space-y-2 text-center">
        <h1 className="text-2xl font-semibold">Create your account</h1>
        <p className="text-sm text-neutral-500">
          Start organising fonts, tagging styles, and collaborating with your team.
        </p>
      </header>
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input id="name" name="name" required placeholder="Jane Designer" />
        </div>
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
        Create account
      </Button>
      <p className="text-center text-sm text-neutral-500">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-brand">
          Sign in
        </Link>
      </p>
    </form>
  );
}
