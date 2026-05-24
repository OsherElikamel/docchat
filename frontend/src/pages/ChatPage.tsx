import { useCallback, useRef, useState, useEffect } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Container,
  IconButton,
  Snackbar,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import DescriptionIcon from "@mui/icons-material/Description";
import AutoStoriesIcon from "@mui/icons-material/AutoStories";
import SmartToyIcon from "@mui/icons-material/SmartToy";
import FileUpload from "../components/ui/FileUpload";
import ChatMessage from "../components/ui/ChatMessage";
import { uploadDocument, sendMessage } from "../services/docchat.service";
import type { Message } from "../types";

export default function ChatPage() {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [filename, setFilename] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [remaining, setRemaining] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleUpload = useCallback(async (file: File) => {
    setUploading(true);
    setError("");
    try {
      const { data } = await uploadDocument(file);
      setSessionId(data.session_id);
      setFilename(data.filename);
      setRemaining(data.remaining_messages);
      setMessages([]);
    } catch (err: unknown) {
      const detail =
        (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ||
        (err instanceof Error ? err.message : "Upload failed");
      setError(detail);
    } finally {
      setUploading(false);
    }
  }, []);

  const handleSend = useCallback(async () => {
    if (!input.trim() || !sessionId || sending) return;

    const question = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: question }]);
    setSending(true);

    try {
      const { data } = await sendMessage(sessionId, question);
      setMessages((prev) => [...prev, { role: "assistant", content: data.answer }]);
      setRemaining(data.remaining_messages);
    } catch (err: unknown) {
      const detail =
        (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ||
        "Something went wrong";
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: `Error: ${detail}` },
      ]);
    } finally {
      setSending(false);
    }
  }, [input, sessionId, sending]);

  const handleReset = () => {
    setSessionId(null);
    setFilename("");
    setMessages([]);
    setInput("");
    setRemaining(0);
  };

  if (!sessionId) {
    return (
      <Box sx={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", position: "relative", overflow: "hidden" }}>
        <Box
          sx={{
            position: "absolute",
            top: "15%",
            left: "25%",
            width: 280,
            height: 280,
            borderRadius: "50%",
            bgcolor: "primary.main",
            opacity: 0.06,
            filter: "blur(80px)",
          }}
        />
        <Box
          sx={{
            position: "absolute",
            bottom: "20%",
            right: "20%",
            width: 220,
            height: 220,
            borderRadius: "50%",
            bgcolor: "primary.main",
            opacity: 0.04,
            filter: "blur(60px)",
          }}
        />
        <Container maxWidth="sm" sx={{ position: "relative", zIndex: 1, py: 6 }}>
          <Stack sx={{ alignItems: "center", mb: 3 }}>
            <Box
              sx={{
                width: 56,
                height: 56,
                borderRadius: 3,
                bgcolor: "primary.main",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                mb: 2,
              }}
            >
              <AutoStoriesIcon sx={{ color: "primary.contrastText", fontSize: 28 }} />
            </Box>
            <Typography variant="h4" align="center" sx={{ fontWeight: 700 }} gutterBottom>
              Chat with any document
            </Typography>
            <Typography variant="body1" color="text.secondary" align="center">
              Upload a PDF, text, or markdown file and ask questions about its content.
            </Typography>
          </Stack>
          <FileUpload onUpload={handleUpload} loading={uploading} />
        </Container>
        <Snackbar
          open={!!error}
          autoHideDuration={4000}
          onClose={() => setError("")}
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        >
          <Alert severity="error" onClose={() => setError("")} variant="filled">
            {error}
          </Alert>
        </Snackbar>
      </Box>
    );
  }

  return (
    <Box sx={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
      {/* Header bar */}
      <Stack
        sx={{ flexDirection: "row", alignItems: "center", gap: 1, px: { xs: 2, sm: 3 }, py: 1.5, borderBottom: 1, borderColor: "divider" }}
      >
        <DescriptionIcon color="primary" fontSize="small" />
        <Typography variant="body2" sx={{ fontWeight: 600, flex: 1, minWidth: 0 }} noWrap>
          {filename}
        </Typography>
        <Chip
          label={`${remaining} left`}
          size="small"
          color={remaining <= 3 ? "warning" : "default"}
          variant="outlined"
          sx={{ flexShrink: 0 }}
        />
        <Button
          size="small"
          startIcon={<RestartAltIcon />}
          onClick={handleReset}
          sx={{ flexShrink: 0, display: { xs: "none", sm: "inline-flex" } }}
        >
          New Document
        </Button>
        <IconButton
          size="small"
          onClick={handleReset}
          sx={{ display: { xs: "inline-flex", sm: "none" }, flexShrink: 0 }}
          aria-label="New document"
        >
          <RestartAltIcon fontSize="small" />
        </IconButton>
      </Stack>

      {/* Messages */}
      <Box sx={{ flex: 1, overflow: "auto", px: { xs: 2, sm: 3 }, py: 2 }}>
        <Container maxWidth="md" sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {messages.length === 0 && (
            <Stack sx={{ alignItems: "center", mt: 8, gap: 1.5 }}>
              <SmartToyIcon sx={{ fontSize: 40, color: "text.secondary", opacity: 0.5 }} />
              <Typography variant="body1" color="text.secondary" align="center">
                Ask a question about your document to get started.
              </Typography>
            </Stack>
          )}
          {messages.map((msg, i) => (
            <ChatMessage key={i} message={msg} />
          ))}
          {sending && (
            <Box sx={{ display: "flex", gap: 1.5, alignItems: "flex-start" }}>
              <Box
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  bgcolor: "action.selected",
                  color: "primary.main",
                  flexShrink: 0,
                }}
              >
                <SmartToyIcon fontSize="small" />
              </Box>
              <Box
                sx={{
                  p: 2,
                  borderRadius: 3,
                  bgcolor: "background.paper",
                  border: 1,
                  borderColor: "divider",
                  display: "flex",
                  alignItems: "center",
                  gap: 1.5,
                }}
              >
                <CircularProgress size={16} />
                <Typography variant="body2" color="text.secondary">
                  Thinking...
                </Typography>
              </Box>
            </Box>
          )}
          <div ref={messagesEndRef} />
        </Container>
      </Box>

      {/* Input */}
      <Box sx={{ px: { xs: 2, sm: 3 }, py: 2, borderTop: 1, borderColor: "divider" }}>
        <Container maxWidth="md">
          <Stack sx={{ flexDirection: "row", gap: 1, alignItems: "flex-end" }}>
            <TextField
              fullWidth
              multiline
              maxRows={4}
              size="small"
              placeholder={remaining > 0 ? "Ask a question about your document..." : "Message limit reached"}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              disabled={remaining <= 0 || sending}
              sx={{
                "& .MuiOutlinedInput-root": { borderRadius: 3, bgcolor: "background.paper" },
              }}
            />
            <IconButton
              aria-label="Send message"
              color="primary"
              onClick={handleSend}
              disabled={!input.trim() || remaining <= 0 || sending}
              sx={{
                width: 40,
                height: 40,
                flexShrink: 0,
                bgcolor: "primary.main",
                color: "primary.contrastText",
                borderRadius: 2,
                "&:hover": { bgcolor: "primary.dark" },
                "&.Mui-disabled": { bgcolor: "action.disabledBackground" },
              }}
            >
              <SendIcon fontSize="small" />
            </IconButton>
          </Stack>
        </Container>
      </Box>
    </Box>
  );
}
