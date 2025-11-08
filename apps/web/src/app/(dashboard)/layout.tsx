import Link from "next/link";
import { ReactNode } from "react";

import { Button, Separator } from "@fontbox/ui";

import { logoutAction } from "../../shared/auth/actions";
import { getSessionToken } from "../../shared/api/server-utils";

const navigation = [
  { href: "/fonts", label: "Fonts" },
  { href: "/projects", label: "Projects" }
];

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const session = getSessionToken();
  if (!session) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface">
        <div className="rounded-lg border border-neutral-200 bg-white p-8 text-center shadow">
          <h1 className="text-xl font-semibold">Session expired</h1>
          <p className="mt-2 text-sm text-neutral-500">Please sign in again to continue.</p>
          <Button asChild className="mt-6">
            <Link href="/login">Return to login</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface">
      <header className="sticky top-0 z-40 border-b border-neutral-200 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/fonts" className="text-lg font-semibold">
            Fontbox
          </Link>
          <nav className="flex items-center gap-4 text-sm font-medium">
            {navigation.map((item) => (
              <Link key={item.href} href={item.href} className="text-neutral-600 hover:text-neutral-900">
                {item.label}
              </Link>
            ))}
            <form action={logoutAction}>
              <Button type="submit" variant="ghost">
                Sign out
              </Button>
            </form>
          </nav>
        </div>
      </header>
      <main className="mx-auto flex max-w-6xl gap-6 px-6 py-10">
        <section className="flex-1 space-y-6">
          {children}
        </section>
      </main>
      <Separator className="mt-10" />
      <footer className="mx-auto max-w-6xl px-6 py-8 text-sm text-neutral-500">
        Fontbox · Manage fonts, metadata, and projects with collaborative workflows.
      </footer>
    </div>
  );
}
