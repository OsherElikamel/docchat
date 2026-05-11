import { createTheme } from "@mui/material/styles";

const common = {
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h5: { fontWeight: 700 },
    h6: { fontWeight: 600 },
  },
  shape: { borderRadius: 12 },
  components: {
    MuiButton: {
      styleOverrides: {
        root: { borderRadius: 50, textTransform: "none" as const, fontWeight: 600 },
      },
    },
  },
};

export const lightTheme = createTheme({
  ...common,
  palette: {
    mode: "light",
    primary: { main: "#6C5CE7" },
    background: { default: "#F8F7FC", paper: "#FFFFFF" },
    text: { primary: "#1A1A2E", secondary: "#6C6C80" },
  },
});

export const darkTheme = createTheme({
  ...common,
  palette: {
    mode: "dark",
    primary: { main: "#A29BFE" },
    background: { default: "#13111C", paper: "#1E1B2E" },
    text: { primary: "#F0EFFF", secondary: "#9B99B3" },
  },
});
