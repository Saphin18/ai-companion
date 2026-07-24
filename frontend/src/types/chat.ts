// Shared types for chat messages across the app.

export type MessageRole = 'user' | 'companion';

// Phase 6: a voice note, image or document attached to a message.
export type AttachmentKind = 'voice' | 'image' | 'document';

export interface Attachment {
  id: string;
  kind: AttachmentKind;
  mime_type: string | null;
  original_name: string | null;
  size_bytes: number | null;
  duration_ms: number | null;
  extracted_text: string | null;
  created_at: string;
  url: string | null; // short-lived signed URL
}

export interface ChatMessage {
  id: string;
  role: MessageRole;
  text: string;
  createdAt: number; // Unix timestamp (ms)
  attachments?: Attachment[];
}
