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
import FileUpload from "../components/ui/FileUpload";
import ChatMessage from "../components/ui/ChatMessage";
import { uploadDocument, sendMessage } from "../services/docchat.service";
import type { Message } from "../types";

export default function ChatPage() {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [filename, setFilename] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [remaining, setRemaining] = useState(50);
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
      const msg =
        err instanceof Error ? err.message : "Upload failed";
      setError(msg);
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
    setRemaining(10);
  };

  if (!sessionId) {
    return (
      <Container maxWidth="sm" sx={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", py: 6 }}>
        <Typography variant="h4" align="center" sx={{ fontWeight: 700 }} gutterBottom>
          Chat with any document
        </Typography>
        <Typography variant="body1" color="text.secondary" align="center" sx={{ mb: 4 }}>
          Upload a PDF, text, or markdown file and ask questions about its content.
        </Typography>
        <FileUpload onUpload={handleUpload} loading={uploading} />
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
      </Container>
    );
  }

  return (
    <Box sx={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
      {/* Header bar */}
      <Stack
        sx={{ flexDirection: "row", alignItems: "center", gap: 1.5, px: 3, py: 1.5, borderBottom: 1, borderColor: "divider" }}
      >
        <DescriptionIcon color="primary" fontSize="small" />
        <Typography variant="body2" sx={{ fontWeight: 600, flex: 1 }} noWrap>
          {filename}
        </Typography>
        <Chip
          label={`${remaining} message${remaining !== 1 ? "s" : ""} left`}
          size="small"
          color={remaining <= 3 ? "warning" : "default"}
          variant="outlined"
        />
        <Button
          size="small"
          startIcon={<RestartAltIcon />}
          onClick={handleReset}
        >
          New Document
        </Button>
      </Stack>

      {/* Messages */}
      <Box sx={{ flex: 1, overflow: "auto", px: 3, py: 2 }}>
        <Container maxWidth="md" sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {messages.length === 0 && (
            <Typography
              variant="body1"
              color="text.secondary"
              align="center"
              sx={{ mt: 8 }}
            >
              Ask a question about your document to get started.
            </Typography>
          )}
          {messages.map((msg, i) => (
            <ChatMessage key={i} message={msg} />
          ))}
          {sending && (
            <Box sx={{ display: "flex", gap: 1.5, alignItems: "center" }}>
              <CircularProgress size={20} />
              <Typography variant="body2" color="text.secondary">
                Thinking...
              </Typography>
            </Box>
          )}
          <div ref={messagesEndRef} />
        </Container>
      </Box>

      {/* Input */}
      <Box sx={{ px: 3, py: 2, borderTop: 1, borderColor: "divider" }}>
        <Container maxWidth="md">
          <Stack sx={{ flexDirection: "row", gap: 1 }}>
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
                "& .MuiOutlinedInput-root": { borderRadius: 6, bgcolor: "background.paper" },
              }}
            />
            <IconButton
              color="primary"
              onClick={handleSend}
              disabled={!input.trim() || remaining <= 0 || sending}
              sx={{
                bgcolor: "primary.main",
                color: "white",
                "&:hover": { bgcolor: "primary.dark" },
                "&.Mui-disabled": { bgcolor: "action.disabledBackground" },
              }}
            >
              <SendIcon />
            </IconButton>
          </Stack>
        </Container>
      </Box>
    </Box>
  );
}
