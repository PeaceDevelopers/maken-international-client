"use client";

import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "@/lib/theme";
import { Toaster } from "react-hot-toast";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ThemeProvider defaultTheme="dark">
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              borderRadius: "0",
              background: "var(--bg-secondary)",
              color: "var(--text-primary)",
              border: "1px solid var(--border)",
              fontSize: "14px",
            },
          }}
        />
      </ThemeProvider>
    </SessionProvider>
  );
}
