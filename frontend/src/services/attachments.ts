/**
 * Phase 6 - attachments (voice notes, images, documents).
 *
 * Kept in its own file so api.ts is untouched. Uses the same auth pattern.
 */
import { supabase } from "./supabase";
import type { Attachment, AttachmentKind } from "../types/chat";

const API_URL = process.env.EXPO_PUBLIC_API_URL as string;

async function bearer(forceRefresh = false): Promise<string | undefined> {
  let {
    data: { session },
  } = await supabase.auth.getSession();
  if (forceRefresh || !session?.access_token) {
    const refreshed = await supabase.auth.refreshSession();
    session = refreshed.data.session;
  }
  return session?.access_token;
}

/**
 * Upload one file to POST /attachments and get back the stored row,
 * including whatever text the backend managed to read out of it.
 *
 * Retries once on 401: uploads are slow, and a token can expire mid-flight.
 * Losing a voice recording to an expired session would be miserable.
 */
export async function uploadAttachment(
  localUri: string,
  kind: AttachmentKind,
  fileName: string,
  mimeType: string,
  durationMs?: number
): Promise<Attachment> {
  const send = async (token: string | undefined) => {
    const form = new FormData();
    // React Native's FormData takes this {uri,name,type} shape.
    form.append("file", {
      uri: localUri,
      name: fileName,
      type: mimeType,
    } as any);
    form.append("kind", kind);
    if (durationMs != null) form.append("duration_ms", String(Math.round(durationMs)));

    return fetch(`${API_URL}/attachments`, {
      method: "POST",
      // NOTE: do NOT set Content-Type here - fetch must add the multipart
      // boundary itself, and overriding it breaks the upload.
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: form,
    });
  };

  let res = await send(await bearer());
  if (res.status === 401) {
    res = await send(await bearer(true));
  }

  if (!res.ok) {
    if (res.status === 413) throw new Error("That file is too large.");
    throw new Error(`Upload failed (${res.status})`);
  }
  return res.json();
}

/** Ask for a fresh signed URL when an old one has expired. */
export async function refreshAttachmentUrl(id: string): Promise<string | null> {
  const token = await bearer();
  const res = await fetch(`${API_URL}/attachments/${id}/url`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!res.ok) return null;
  return (await res.json()).url ?? null;
}

export type ChatReply = { reply: string; session_id: string };

/** Same as sendChatMessage, but carries attachment ids along with the text. */
export async function sendChatWithAttachments(
  message: string,
  sessionId: string | null,
  attachmentIds: string[]
): Promise<ChatReply> {
  const token = await bearer();
  const res = await fetch(`${API_URL}/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({
      message,
      session_id: sessionId,
      attachment_ids: attachmentIds,
    }),
  });
  if (!res.ok) throw new Error(`Chat failed: ${res.status}`);
  return res.json();
}
