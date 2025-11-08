import type { ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-surface">
      <div className="w-full max-w-md space-y-8 rounded-xl border border-neutral-200 bg-white p-10 shadow-xl">
        {children}
      </div>
    </div>
  );
}
