import { createTheme, responsiveFontSizes } from "@mui/material/styles"
import { ptBR } from "@mui/material/locale"

declare module "@mui/material/styles" {
  interface Palette {
    neutral: Palette["primary"]
  }
  interface PaletteOptions {
    neutral: PaletteOptions["primary"]
  }
}

export const getTheme = (mode: "light" | "dark") => {
  const baseTheme = createTheme(
    {
      palette: {
        mode,
        primary: {
          main: "#1976d2",
          light: "#42a5f5",
          dark: "#1565c0",
        },
        secondary: {
          main: "#9c27b0",
          light: "#ba68c8",
          dark: "#7b1fa2",
        },
        neutral: {
          main: mode === "dark" ? "#303030" : "#f5f5f5",
          light: mode === "dark" ? "#424242" : "#fafafa",
          dark: mode === "dark" ? "#212121" : "#e0e0e0",
          contrastText: mode === "dark" ? "#fff" : "#000",
        },
        background: {
          default: mode === "dark" ? "#121212" : "#fafafa",
          paper: mode === "dark" ? "#1e1e1e" : "#ffffff",
        },
      },
      typography: {
        fontFamily: ["Roboto", "Arial", "sans-serif"].join(","),
        h1: {
          fontSize: "2.5rem",
          fontWeight: 700,
        },
        h2: {
          fontSize: "2rem",
          fontWeight: 600,
        },
        h3: {
          fontSize: "1.75rem",
          fontWeight: 600,
        },
        h4: {
          fontSize: "1.5rem",
          fontWeight: 600,
        },
        h5: {
          fontSize: "1.25rem",
          fontWeight: 600,
        },
        h6: {
          fontSize: "1rem",
          fontWeight: 600,
        },
      },
      components: {
        MuiButton: {
          styleOverrides: {
            root: {
              textTransform: "none",
              borderRadius: 8,
            },
          },
        },
        MuiCard: {
          styleOverrides: {
            root: {
              boxShadow: "0 4px 12px 0 rgba(0,0,0,0.05)",
            },
          },
        },
        MuiPaper: {
          styleOverrides: {
            root: {},
          },
        },
      },
    },
    ptBR
  )

  return responsiveFontSizes(baseTheme)
}
