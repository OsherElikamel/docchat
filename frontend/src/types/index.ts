export interface UploadResponse {
  session_id: string;
  doc_id: string;
  filename: string;
  chunks: number;
  remaining_messages: number;
}

export interface ChatResponse {
  answer: string;
  remaining_messages: number;
}

export interface Message {
  role: "user" | "assistant";
  content: string;
}
