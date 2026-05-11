import api from "./api";
import type { ChatResponse, UploadResponse } from "../types";

export const uploadDocument = (file: File) => {
  const form = new FormData();
  form.append("file", file);
  return api.post<UploadResponse>("/api/upload", form);
};

export const sendMessage = (sessionId: string, question: string) =>
  api.post<ChatResponse>("/api/chat", { session_id: sessionId, question });
