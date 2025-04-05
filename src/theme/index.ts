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
  const isDark = mode === "dark"

  const baseTheme = createTheme(
    {
      palette: {
        mode,
        primary: {
          main: "#8B4513",
          light: "#A0522D",
          dark: "#5D2E0D",
          contrastText: "#FFF",
        },
        secondary: {
          main: "#DAA520",
          light: "#F0E68C",
          dark: "#B8860B",
          contrastText: "#000",
        },
        neutral: {
          main: isDark ? "#303030" : "#f5f5f5",
          light: isDark ? "#424242" : "#fafafa",
          dark: isDark ? "#212121" : "#e0e0e0",
          contrastText: isDark ? "#fff" : "#000",
        },
        background: {
          default: isDark ? "#121212" : "#FDF5E6",
          paper: isDark ? "#1e1e1e" : "#ffffff",
        },
        text: {
          primary: isDark ? "#ffffff" : "#212121",
          secondary: isDark ? "#aaaaaa" : "#666666",
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
              borderRadius: "8px",
              transition: "transform 0.3s ease, box-shadow 0.3s ease",
              "&:hover": {
                boxShadow: "0 8px 16px 0 rgba(0,0,0,0.1)",
              },
              backgroundColor: isDark ? "#1e1e1e" : "#ffffff",
            },
          },
        },
        MuiPaper: {
          styleOverrides: {
            root: {
              backgroundColor: isDark ? "#1e1e1e" : "#ffffff",
            },
          },
        },
        MuiCardContent: {
          styleOverrides: {
            root: {
              backgroundColor: isDark ? "#1e1e1e" : "#ffffff",
              color: isDark ? "#ffffff" : "#212121",
            },
          },
        },
      },
    },
    ptBR
  )

  return responsiveFontSizes(baseTheme)
}
