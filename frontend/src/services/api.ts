import { supabase } from "./supabase";

const API_URL = process.env.EXPO_PUBLIC_API_URL as string;

async function authHeaders(): Promise<Record<string, string>> {
  let {
    data: { session },
  } = await supabase.auth.getSession();
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

export type ThemeMode = "dark" | "light" | "system";

export type ProfileData = {
  display_name: string | null;
  theme_preference?: ThemeMode;
  theme_id?: string;
  personality_mode?: string;
  avatar_url?: string | null;
};

export async function getProfile(): Promise<ProfileData> {
  const res = await fetch(`${API_URL}/profile`, {
    headers: await authHeaders(),
  });
  if (!res.ok) throw new Error(`Profile load failed: ${res.status}`);
  return res.json();
}

async function patchProfile(
  patch: Record<string, unknown>
): Promise<ProfileData> {
  const res = await fetch(`${API_URL}/profile`, {
    method: "PUT",
    headers: await authHeaders(),
    body: JSON.stringify(patch),
  });
  if (!res.ok) throw new Error(`Profile update failed: ${res.status}`);
  return res.json();
}

export async function updateProfile(displayName: string): Promise<ProfileData> {
  return patchProfile({ display_name: displayName });
}

export async function updateThemePreference(
  mode: ThemeMode
): Promise<ProfileData> {
  return patchProfile({ theme_preference: mode });
}

export async function updateThemeId(themeId: string): Promise<ProfileData> {
  return patchProfile({ theme_id: themeId });
}

export async function updatePersonalityMode(
  mode: string
): Promise<ProfileData> {
  return patchProfile({ personality_mode: mode });
}

export async function updateAvatarUrl(
  url: string | null
): Promise<ProfileData> {
  return patchProfile({ avatar_url: url });
}

/**
 * Upload a local image to the public "avatars" bucket under avatars/<user_id>/,
 * save its public URL to the profile, and return that URL.
 * Throws with a friendly message on failure.
 */
export async function uploadAvatar(localUri: string): Promise<string> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not signed in.");

  // Read the file into bytes (fetch on a file:// URI works in Expo).
  let bytes: ArrayBuffer;
  try {
    const resp = await fetch(localUri);
    bytes = await resp.arrayBuffer();
  } catch {
    throw new Error("Couldn't read the selected image.");
  }

  // One stable path per user so a new upload overwrites the old avatar.
  const path = `${user.id}/avatar.jpg`;

  const { error: upErr } = await supabase.storage
    .from("avatars")
    .upload(path, bytes, {
      contentType: "image/jpeg",
      upsert: true,
    });
  if (upErr) {
    throw new Error(upErr.message || "Upload failed. Check your connection.");
  }

  // Public URL + a cache-busting query so the new image shows immediately.
  const { data } = supabase.storage.from("avatars").getPublicUrl(path);
  const publicUrl = `${data.publicUrl}?v=${Date.now()}`;

  await updateAvatarUrl(publicUrl);
  return publicUrl;
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

export async function deleteAccount(): Promise<void> {
  const res = await fetch(`${API_URL}/account`, {
    method: "DELETE",
    headers: await authHeaders(),
  });
  if (!res.ok && res.status !== 204) {
    throw new Error(`Delete account failed: ${res.status}`);
  }
}