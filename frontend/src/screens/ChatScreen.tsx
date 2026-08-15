import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import * as Speech from "expo-speech";
import ChatBubble from "../components/ChatBubble";
import ChatInput from "../components/ChatInput";
import { loadSessionMessages } from "../services/api";
import { sendChatWithAttachments } from "../services/attachments";
import { Attachment, ChatMessage } from "../types/chat";
import { useTheme } from "../context/ThemeContext";

type Props = {
  sessionId: string | null;
  onBack: () => void;
  initialMessage?: string | null;
  initialAction?: "record" | "photo" | "document" | null;
};

const WELCOME: ChatMessage = {
  id: "welcome",
  role: "companion",
  text: "Hi, I'm glad you're here. What's on your mind today?",
  createdAt: Date.now(),
};

export default function ChatScreen({ sessionId, onBack, initialMessage, initialAction }: Props) {
  const { theme } = useTheme();
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME]);
  const [currentSession, setCurrentSession] = useState<string | null>(sessionId);
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(sessionId !== null);

  // Phase 6: hands-free turn mode. When on, the companion reads its reply
  // aloud and then reopens the mic, so a whole conversation needs no taps.
  const [handsFree, setHandsFree] = useState(false);
  const [autoRecordSignal, setAutoRecordSignal] = useState(0);
  const handsFreeRef = useRef(false);
  handsFreeRef.current = handsFree;

  // Home-screen attachment shortcuts: signal ChatInput to open a picker on mount.
  const [triggerRecordSignal, setTriggerRecordSignal] = useState(0);
  const [triggerPhotoSignal, setTriggerPhotoSignal] = useState(0);
  const [triggerDocSignal, setTriggerDocSignal] = useState(0);

  const listRef = useRef<FlatList<ChatMessage>>(null);

  const scrollToEnd = () => {
    requestAnimationFrame(() => {
      listRef.current?.scrollToEnd({ animated: true });
    });
  };

  useEffect(() => {
    const showSub = Keyboard.addListener("keyboardDidShow", scrollToEnd);
    return () => showSub.remove();
  }, []);

  // Never leave the phone talking after the user walks away from this screen.
  useEffect(() => {
    return () => {
      Speech.stop();
    };
  }, []);

  useEffect(() => {
    if (sessionId === null) {
      setMessages([WELCOME]);
      setLoading(false);
      return;
    }
    (async () => {
      try {
        const history = await loadSessionMessages(sessionId);
        const mapped: ChatMessage[] = history.map((m: any) => ({
          id: m.id,
          role: m.role === "assistant" ? "companion" : "user",
          text: m.content,
          createdAt: new Date(m.created_at).getTime(),
          attachments: m.attachments ?? [],
        }));
        setMessages(mapped.length > 0 ? mapped : [WELCOME]);
      } catch (e) {
        console.warn(e);
        setMessages([WELCOME]);
      } finally {
        setLoading(false);
      }
    })();
  }, [sessionId]);

  const sentInitial = useRef(false);
  useEffect(() => {
    if (
      !sentInitial.current &&
      initialMessage &&
      initialMessage.trim() &&
      sessionId === null
    ) {
      sentInitial.current = true;
      handleSend(initialMessage.trim(), []);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialMessage]);

  // Home-screen shortcut: fire the matching picker/recorder once on first mount.
  const firedAction = useRef(false);
  useEffect(() => {
    if (!firedAction.current && initialAction && !loading && !sending) {
      firedAction.current = true;
      if (initialAction === "record") setTriggerRecordSignal((n) => n + 1);
      else if (initialAction === "photo") setTriggerPhotoSignal((n) => n + 1);
      else if (initialAction === "document") setTriggerDocSignal((n) => n + 1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialAction, loading]);

  const handleSend = async (text: string, attachments: Attachment[] = []) => {
    if (!text.trim() && attachments.length === 0) return;

    // A voice note with no transcript still deserves a bubble.
    const shown =
      text.trim() ||
      (attachments.some((a) => a.kind === "voice")
        ? "(voice message)"
        : "(attachment)");

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: "user",
      text: shown,
      createdAt: Date.now(),
      attachments,
    };
    setMessages((prev) => [...prev, userMsg]);
    setSending(true);
    Speech.stop();

    try {
      const { reply, session_id } = await sendChatWithAttachments(
        text,
        currentSession,
        attachments.map((a) => a.id)
      );
      setCurrentSession(session_id);
      setMessages((prev) => [
        ...prev,
        {
          id: `a-${Date.now()}`,
          role: "companion",
          text: reply,
          createdAt: Date.now(),
        },
      ]);

      if (handsFreeRef.current) {
        Speech.speak(reply, {
          onDone: () => {
            // Only reopen the mic if hands-free is still on.
            if (handsFreeRef.current) setAutoRecordSignal((n) => n + 1);
          },
          onStopped: () => {},
        });
      }
    } catch (e) {
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: "companion",
          text: "Sorry, I couldn't reach the server. Please try again.",
          createdAt: Date.now(),
        },
      ]);
    } finally {
      setSending(false);
    }
  };

  const toggleHandsFree = () => {
    setHandsFree((on) => {
      if (on) Speech.stop();
      return !on;
    });
  };

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: "transparent" }]}>
        <ActivityIndicator color={theme.accent} />
      </View>
    );
  }

  const body = (
    <>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <Text style={[styles.backText, { color: theme.accent }]}>{"\u2039"} Chats</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.textPrimary }]}>
          Companion
        </Text>
        <View style={{ width: 60 }} />
      </View>

      <FlatList
        ref={listRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <ChatBubble message={item} />}
        contentContainerStyle={styles.list}
        keyboardShouldPersistTaps="handled"
        onContentSizeChange={scrollToEnd}
        onLayout={scrollToEnd}
      />

      {sending && (
        <Text style={[styles.thinking, { color: theme.textSecondary }]}>
          Thinking{"\u2026"}
        </Text>
      )}

      <ChatInput
        onSend={handleSend}
        disabled={sending}
        handsFree={handsFree}
        onToggleHandsFree={toggleHandsFree}
        autoRecordSignal={autoRecordSignal}
        triggerRecordSignal={triggerRecordSignal}
        draftKey={currentSession ?? 'new'}
        triggerPhotoSignal={triggerPhotoSignal}
        triggerDocSignal={triggerDocSignal}
      />
    </>
  );

  // iOS: lift with padding. Android: no wrapper {"\u2014"} the OS `resize` mode moves the
  // input above the keyboard by itself (a second lifter here would double it up).
  if (Platform.OS === "ios") {
    return (
      <KeyboardAvoidingView
        style={[styles.container, { backgroundColor: "transparent" }]}
        behavior="padding"
      >
        {body}
      </KeyboardAvoidingView>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: "transparent" }]}>
      {body}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 56,
    paddingBottom: 16,
  },
  backBtn: { padding: 4 },
  backText: { fontSize: 17 },
  headerTitle: { fontSize: 20, fontWeight: "700" },
  list: { paddingHorizontal: 16, paddingBottom: 10 },
  thinking: {
    paddingHorizontal: 20,
    paddingBottom: 6,
    fontStyle: "italic",
  },
});
