import type { Metadata } from "next";
import "./globals.css";

import { ReactNode } from "react";

import { AppProviders } from "../providers";

export const metadata: Metadata = {
  title: "Fontbox",
  description: "Manage your font library with ease"
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
