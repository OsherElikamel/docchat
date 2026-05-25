import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import { ThemeProvider as MuiThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { lightTheme, darkTheme } from "../theme/theme";

interface ThemeCtx {
  mode: "light" | "dark";
  toggle: () => void;
}

const Ctx = createContext<ThemeCtx>({ mode: "light", toggle: () => {} });

// eslint-disable-next-line react-refresh/only-export-components
export const useThemeMode = () => useContext(Ctx);

export default function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<"light" | "dark">(() =>
    (localStorage.getItem("docchat-theme") as "dark" | null) === "dark" ? "dark" : "light",
  );

  const toggle = () =>
    setMode((prev) => {
      const next = prev === "light" ? "dark" : "light";
      localStorage.setItem("docchat-theme", next);
      return next;
    });

  const theme = useMemo(() => (mode === "dark" ? darkTheme : lightTheme), [mode]);

  return (
    <Ctx.Provider value={{ mode, toggle }}>
      <MuiThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </MuiThemeProvider>
    </Ctx.Provider>
  );
}
