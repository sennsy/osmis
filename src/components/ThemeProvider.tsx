"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { type ThemeProviderProps } from "next-themes";

if (typeof window !== "undefined") {
  const win = window as unknown as { __osmisPatchedConsoleError?: boolean };
  if (!win.__osmisPatchedConsoleError) {
    win.__osmisPatchedConsoleError = true;
    const orig = console.error;
    console.error = (...args: unknown[]) => {
      if (
        args.some(
          (arg) =>
            typeof arg === "string" &&
            arg.includes("Encountered a script tag")
        )
      ) {
        return;
      }
      orig.apply(console, args);
    };
  }
}

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
