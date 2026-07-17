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
import ChatBubble from "../components/ChatBubble";
import ChatInput from "../components/ChatInput";
import { sendChatMessage, loadSessionMessages } from "../services/api";
import { ChatMessage } from "../types/chat";
import { useTheme } from "../context/ThemeContext";

type Props = {
  sessionId: string | null;
  onBack: () => void;
  initialMessage?: string | null;
};

const WELCOME: ChatMessage = {
  id: "welcome",
  role: "companion",
  text: "Hi, I'm glad you're here. What's on your mind today?",
  createdAt: Date.now(),
};

export default function ChatScreen({ sessionId, onBack, initialMessage }: Props) {
  const { theme } = useTheme();
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME]);
  const [currentSession, setCurrentSession] = useState<string | null>(sessionId);
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(sessionId !== null);

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

  useEffect(() => {
    if (sessionId === null) {
      setMessages([WELCOME]);
      setLoading(false);
      return;
    }
    (async () => {
      try {
        const history = await loadSessionMessages(sessionId);
        const mapped: ChatMessage[] = history.map((m) => ({
          id: m.id,
          role: m.role === "assistant" ? "companion" : "user",
          text: m.content,
          createdAt: new Date(m.created_at).getTime(),
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
      handleSend(initialMessage.trim());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialMessage]);

  const handleSend = async (text: string) => {
    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: "user",
      text,
      createdAt: Date.now(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setSending(true);
    try {
      const { reply, session_id } = await sendChatMessage(text, currentSession);
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

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: theme.background }]}>
        <ActivityIndicator color={theme.accent} />
      </View>
    );
  }

  const body = (
    <>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <Text style={[styles.backText, { color: theme.accent }]}>‹ Chats</Text>
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
          Thinking…
        </Text>
      )}

      <ChatInput onSend={handleSend} disabled={sending} />
    </>
  );

  // iOS: lift with padding. Android: no wrapper — the OS `resize` mode moves the
  // input above the keyboard by itself (a second lifter here would double it up).
  if (Platform.OS === "ios") {
    return (
      <KeyboardAvoidingView
        style={[styles.container, { backgroundColor: theme.background }]}
        behavior="padding"
      >
        {body}
      </KeyboardAvoidingView>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
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
