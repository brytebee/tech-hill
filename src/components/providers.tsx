"use client";

import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "next-themes";
import { LoaderProvider } from "@/hooks/use-loader";
import { ModalProvider } from "@/hooks/use-modal";
import { GlobalLoader } from "@/components/ui/global-loader";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <LoaderProvider>
          <ModalProvider>
            {children}
            <GlobalLoader />
          </ModalProvider>
        </LoaderProvider>
      </ThemeProvider>
    </SessionProvider>
  );
}
