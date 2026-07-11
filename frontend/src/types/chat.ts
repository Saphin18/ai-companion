// Shared types for chat messages across the app.

export type MessageRole = 'user' | 'companion';

export interface ChatMessage {
  id: string;
  role: MessageRole;
  text: string;
  createdAt: number; // Unix timestamp (ms)
}
