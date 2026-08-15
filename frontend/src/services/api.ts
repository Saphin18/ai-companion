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
  checkin_enabled?: boolean;
  checkin_hour?: number;
  checkin_minute?: number;
  checkin_tz_offset_minutes?: number;
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

export type JournalEntry = {
  id: string;
  content: string;
  reflection: string | null;
  created_at: string;
};

export async function createJournalEntry(
  content: string
): Promise<JournalEntry> {
  const res = await fetch(`${API_URL}/journal`, {
    method: "POST",
    headers: await authHeaders(),
    body: JSON.stringify({ content }),
  });
  if (!res.ok) throw new Error(`Journal save failed: ${res.status}`);
  return res.json();
}

export async function deleteJournalEntry(entryId: string): Promise<void> {
  const res = await fetch(
`${API_URL}/journal/${entryId}`
, {
    method: "DELETE",
    headers: await authHeaders(),
  });
  if (!res.ok) throw new Error(
`Journal delete failed: ${res.status}`
);
}

export async function listJournalEntries(): Promise<JournalEntry[]> {
  const res = await fetch(`${API_URL}/journal`, {
    headers: await authHeaders(),
  });
  if (!res.ok) throw new Error(`Journal load failed: ${res.status}`);
  return res.json();
}
// ---------------------------------------------------------------------------
// Phase 4 - Proactivity (push check-in, reminders, goals)
// ---------------------------------------------------------------------------

// 4B: register this device's Expo push token with the backend.
export async function registerPushToken(
  token: string,
  platform: string | null
): Promise<void> {
  const res = await fetch(`${API_URL}/push/register`, {
    method: "POST",
    headers: await authHeaders(),
    body: JSON.stringify({ token, platform }),
  });
  if (!res.ok) throw new Error(`Push register failed: ${res.status}`);
}

// 4B: daily check-in settings live on the profile. Extend the update helpers.
export type CheckinSettings = {
  checkin_enabled: boolean;
  checkin_hour: number;
  checkin_minute: number;
  checkin_tz_offset_minutes: number;
};

export async function updateCheckinSettings(
  settings: Partial<CheckinSettings>
): Promise<ProfileData> {
  return patchProfile(settings);
}

// 4C: reminders (saved on the server; scheduled locally on the device).
export type Reminder = {
  id: string;
  title: string;
  remind_at: string | null;
  repeats_daily: boolean;
  local_notif_id: string | null;
  is_active: boolean;
  created_at: string;
};

export async function createReminder(input: {
  title: string;
  remind_at: string | null;
  repeats_daily: boolean;
  local_notif_id: string | null;
}): Promise<Reminder> {
  const res = await fetch(`${API_URL}/reminders`, {
    method: "POST",
    headers: await authHeaders(),
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error(`Reminder save failed: ${res.status}`);
  return res.json();
}

export async function listReminders(): Promise<Reminder[]> {
  const res = await fetch(`${API_URL}/reminders`, {
    headers: await authHeaders(),
  });
  if (!res.ok) throw new Error(`Reminders load failed: ${res.status}`);
  return res.json();
}

export async function deleteReminder(id: string): Promise<void> {
  const res = await fetch(`${API_URL}/reminders/${id}`, {
    method: "DELETE",
    headers: await authHeaders(),
  });
  if (!res.ok) throw new Error(`Reminder delete failed: ${res.status}`);
}

// 4D: goals (injected into chat so the companion encourages them).
export type Goal = {
  id: string;
  title: string;
  detail: string | null;
  status: string;
  created_at: string;
  completed_at: string | null;
};

export async function createGoal(input: {
  title: string;
  detail: string | null;
}): Promise<Goal> {
  const res = await fetch(`${API_URL}/goals`, {
    method: "POST",
    headers: await authHeaders(),
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error(`Goal save failed: ${res.status}`);
  return res.json();
}

export async function listGoals(status?: string): Promise<Goal[]> {
  const url = status
    ? `${API_URL}/goals?status=${encodeURIComponent(status)}`
    : `${API_URL}/goals`;
  const res = await fetch(url, { headers: await authHeaders() });
  if (!res.ok) throw new Error(`Goals load failed: ${res.status}`);
  return res.json();
}

export async function updateGoal(
  id: string,
  patch: { status?: string; title?: string; detail?: string | null }
): Promise<void> {
  const res = await fetch(`${API_URL}/goals/${id}`, {
    method: "PATCH",
    headers: await authHeaders(),
    body: JSON.stringify(patch),
  });
  if (!res.ok) throw new Error(`Goal update failed: ${res.status}`);
}