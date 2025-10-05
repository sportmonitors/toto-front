"use client";

import {
  createTheme,
  ThemeProvider as MuiThemeProvider,
} from "@mui/material/styles";
import { useMemo, PropsWithChildren } from "react";
import StyledJsxRegistry from "./registry";

// Extend the theme to include custom background gradient
declare module "@mui/material/styles" {
  interface TypeBackground {
    gradient?: string;
  }
}

function ThemeProvider(props: PropsWithChildren) {
  const theme = useMemo(
    () =>
      createTheme({
        typography: {
          fontFamily: [
            "var(--font-inter)",
            "var(--font-roboto)",
            "-apple-system",
            "BlinkMacSystemFont",
            '"Segoe UI"',
            "Roboto",
            "sans-serif",
          ].join(","),
        },
        cssVariables: {
          colorSchemeSelector: "class",
        },
        colorSchemes: {
          light: {
            palette: {
              primary: {
                main: "#093453",
              },
              background: {
                gradient: "linear-gradient(180deg, #eff6ff, #dbeafe)",
              },
              text: {
                primary: "#000000",
                secondary: "#374151",
              },
            },
          },
          dark: {
            palette: {
              primary: {
                main: "#093453",
              },
              background: {
                gradient: "linear-gradient(180deg, #1e3a8a, #1e40af)",
              },
              text: {
                primary: "#ffffff",
                secondary: "#d1d5db",
              },
            },
          },
        },
      }),
    []
  );

  return (
    <StyledJsxRegistry>
      <MuiThemeProvider theme={theme}>{props.children}</MuiThemeProvider>
    </StyledJsxRegistry>
  );
}

export default ThemeProvider;
