import { useCallback, useState } from "react";
import { Box, Typography, CircularProgress } from "@mui/material";
import UploadFileIcon from "@mui/icons-material/UploadFile";

interface FileUploadProps {
  onUpload: (file: File) => void;
  loading: boolean;
}

export default function FileUpload({ onUpload, loading }: FileUploadProps) {
  const [dragOver, setDragOver] = useState(false);

  const handleFile = useCallback(
    (file: File) => {
      const ext = file.name.toLowerCase();
      if (!ext.endsWith(".pdf") && !ext.endsWith(".txt") && !ext.endsWith(".md")) return;
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

  return (
    <Box
      onDragOver={(e) => {
        e.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={handleDrop}
      onClick={() => {
        if (loading) return;
        const input = document.createElement("input");
        input.type = "file";
        input.accept = ".pdf,.txt,.md";
        input.onchange = () => {
          const file = input.files?.[0];
          if (file) handleFile(file);
        };
        input.click();
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
        </>
      )}
    </Box>
  );
}
