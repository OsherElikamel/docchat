import { useCallback, useState } from "react";
import { Box, Typography, CircularProgress } from "@mui/material";
import UploadFileIcon from "@mui/icons-material/UploadFile";

interface FileUploadProps {
  onUpload: (file: File) => void;
  loading: boolean;
}

export default function FileUpload({ onUpload, loading }: FileUploadProps) {
  const [dragOver, setDragOver] = useState(false);
  const [rejected, setRejected] = useState(false);

  const handleFile = useCallback(
    (file: File) => {
      const ext = file.name.toLowerCase();
      if (!ext.endsWith(".pdf") && !ext.endsWith(".txt") && !ext.endsWith(".md")) {
        setRejected(true);
        setTimeout(() => setRejected(false), 3000);
        return;
      }
      setRejected(false);
      onUpload(file);
    },
    [onUpload],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile],
  );

  const openFilePicker = useCallback(() => {
    if (loading) return;
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".pdf,.txt,.md";
    input.onchange = () => {
      const file = input.files?.[0];
      if (file) handleFile(file);
    };
    input.click();
  }, [loading, handleFile]);

  return (
    <Box
      role="button"
      tabIndex={0}
      aria-label="Upload a document"
      onDragOver={(e) => {
        e.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={handleDrop}
      onClick={openFilePicker}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          openFilePicker();
        }
      }}
      sx={{
        border: 2,
        borderStyle: "dashed",
        borderColor: dragOver ? "primary.main" : "divider",
        borderRadius: 3,
        p: 6,
        textAlign: "center",
        cursor: loading ? "default" : "pointer",
        transition: "border-color 0.2s, background-color 0.2s",
        bgcolor: dragOver ? "action.hover" : "transparent",
        "&:hover": loading ? {} : { borderColor: "primary.main", bgcolor: "action.hover" },
      }}
    >
      {loading ? (
        <CircularProgress size={48} />
      ) : (
        <>
          <UploadFileIcon sx={{ fontSize: 48, color: "primary.main", mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            Drop a file here or click to upload
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Supports PDF, TXT, and Markdown files (max 10MB)
          </Typography>
          {rejected && (
            <Typography variant="body2" color="error" sx={{ mt: 1 }}>
              Unsupported file type. Please upload a PDF, TXT, or Markdown file.
            </Typography>
          )}
        </>
      )}
    </Box>
  );
}
