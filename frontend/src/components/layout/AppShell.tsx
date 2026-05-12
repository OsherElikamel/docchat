import { AppBar, Box, IconButton, Toolbar, Typography } from "@mui/material";
import AutoStoriesIcon from "@mui/icons-material/AutoStories";
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
          <Box
            sx={{
              width: 28,
              height: 28,
              borderRadius: 1.5,
              bgcolor: "rgba(255,255,255,0.15)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              mr: 1.5,
            }}
          >
            <AutoStoriesIcon sx={{ fontSize: 16 }} />
          </Box>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, flexGrow: 1 }}>
            DocChat
          </Typography>
          <IconButton color="inherit" onClick={toggle} aria-label="toggle theme">
            {mode === "dark" ? <LightModeIcon fontSize="small" /> : <DarkModeIcon fontSize="small" />}
          </IconButton>
        </Toolbar>
      </AppBar>
      <Box sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
        {children}
      </Box>
    </Box>
  );
}
