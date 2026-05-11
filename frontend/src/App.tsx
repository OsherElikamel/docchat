import ThemeProvider from "./contexts/ThemeContext";
import AppShell from "./components/layout/AppShell";
import ChatPage from "./pages/ChatPage";

export default function App() {
  return (
    <ThemeProvider>
      <AppShell>
        <ChatPage />
      </AppShell>
    </ThemeProvider>
  );
}
