import { supabase } from "./supabase";

const API_URL = process.env.EXPO_PUBLIC_API_URL as string;

async function authHeaders(): Promise<Record<string, string>> {
  let {
    data: { session },
  } = await supabase.auth.getSession();
  // If the token is missing or about to expire, refresh before calling.
  if (!session?.access_token) {
    const refreshed = await supabase.auth.refreshSession();
    session = refreshed.data.session;
  }
  const token = session?.access_token;
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export type ChatReply = { reply: string; session_id: string };

export async function sendChatMessage(
  message: string,
  sessionId: string | null
): Promise<ChatReply> {
  const res = await fetch(`${API_URL}/chat`, {
    method: "POST",
    headers: await authHeaders(),
    body: JSON.stringify({ message, session_id: sessionId }),
  });
  if (!res.ok) throw new Error(`Chat failed: ${res.status}`);
  return res.json();
}

export type ProfileData = { display_name: string | null };

export async function getProfile(): Promise<ProfileData> {
  const res = await fetch(`${API_URL}/profile`, {
    headers: await authHeaders(),
  });
  if (!res.ok) throw new Error(`Profile load failed: ${res.status}`);
  return res.json();
}

export async function updateProfile(displayName: string): Promise<ProfileData> {
  const res = await fetch(`${API_URL}/profile`, {
    method: "PUT",
    headers: await authHeaders(),
    body: JSON.stringify({ display_name: displayName }),
  });
  if (!res.ok) throw new Error(`Profile update failed: ${res.status}`);
  return res.json();
}

export type SessionSummary = {
  id: string;
  title: string | null;
  pinned: boolean;
  created_at: string;
  updated_at: string;
};

export async function listSessions(): Promise<SessionSummary[]> {
  const res = await fetch(`${API_URL}/sessions`, {
    headers: await authHeaders(),
  });
  if (!res.ok) throw new Error(`Sessions load failed: ${res.status}`);
  return res.json();
}

export type ServerMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  created_at: string;
};

export async function loadSessionMessages(
  sessionId: string
): Promise<ServerMessage[]> {
  const res = await fetch(`${API_URL}/sessions/${sessionId}/messages`, {
    headers: await authHeaders(),
  });
  if (!res.ok) throw new Error(`Messages load failed: ${res.status}`);
  return res.json();
}

export async function renameSession(
  sessionId: string,
  title: string
): Promise<SessionSummary> {
  const res = await fetch(`${API_URL}/sessions/${sessionId}`, {
    method: "PATCH",
    headers: await authHeaders(),
    body: JSON.stringify({ title }),
  });
  if (!res.ok) throw new Error(`Rename failed: ${res.status}`);
  return res.json();
}

export async function setSessionPinned(
  sessionId: string,
  pinned: boolean
): Promise<SessionSummary> {
  const res = await fetch(`${API_URL}/sessions/${sessionId}`, {
    method: "PATCH",
    headers: await authHeaders(),
    body: JSON.stringify({ pinned }),
  });
  if (!res.ok) throw new Error(`Pin failed: ${res.status}`);
  return res.json();
}

export async function removeSession(sessionId: string): Promise<void> {
  const res = await fetch(`${API_URL}/sessions/${sessionId}`, {
    method: "DELETE",
    headers: await authHeaders(),
  });
  if (!res.ok && res.status !== 204) {
    throw new Error(`Remove failed: ${res.status}`);
  }
}
