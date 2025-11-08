"use client";

import { ReactNode, useMemo } from "react";
import { SWRConfig } from "swr";
import { ThemeProvider } from "next-themes";

import { ToastProvider } from "./shared/ui/toast";
import { swrFetcher } from "./shared/api/fetcher";

export function AppProviders({ children }: { children: ReactNode }) {
  const swrValue = useMemo(
    () => ({
      fetcher: swrFetcher,
      revalidateOnFocus: false,
      shouldRetryOnError: false
    }),
    []
  );

  return (
    <ThemeProvider attribute="class" enableSystem disableTransitionOnChange>
      <ToastProvider>
        <SWRConfig value={swrValue}>{children}</SWRConfig>
      </ToastProvider>
    </ThemeProvider>
  );
}
