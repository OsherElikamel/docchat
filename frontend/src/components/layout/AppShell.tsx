import { AppBar, Box, IconButton, Toolbar, Typography } from "@mui/material";
import DescriptionIcon from "@mui/icons-material/Description";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import LightModeIcon from "@mui/icons-material/LightMode";
import { useThemeMode } from "../../contexts/ThemeContext";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const { mode, toggle } = useThemeMode();

  return (
    <Box sx={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <AppBar
        position="sticky"
        elevation={0}
        sx={{ borderBottom: 1, borderColor: "divider" }}
      >
        <Toolbar variant="dense">
          <DescriptionIcon sx={{ mr: 1.5 }} />
          <Typography variant="subtitle1" sx={{ fontWeight: 600, flexGrow: 1 }}>
            DocChat
          </Typography>
          <IconButton color="inherit" onClick={toggle}>
            {mode === "dark" ? <LightModeIcon /> : <DarkModeIcon />}
          </IconButton>
        </Toolbar>
      </AppBar>
      <Box sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
        {children}
      </Box>
    </Box>
  );
}
