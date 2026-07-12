import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
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

type Props = {
  sessionId: string | null;
  onBack: () => void;
};

const WELCOME: ChatMessage = {
  id: "welcome",
  role: "companion",
  text: "Hi, I'm glad you're here. What's on your mind today?",
  createdAt: Date.now(),
};

export default function ChatScreen({ sessionId, onBack }: Props) {
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME]);
  const [currentSession, setCurrentSession] = useState<string | null>(sessionId);
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(sessionId !== null);

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
      <View style={styles.center}>
        <ActivityIndicator color="#7c6cf0" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <Text style={styles.backText}>‹ Chats</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Companion</Text>
        <View style={{ width: 60 }} />
      </View>

      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <ChatBubble message={item} />}
        contentContainerStyle={styles.list}
        keyboardShouldPersistTaps="handled"
      />

      {sending && <Text style={styles.thinking}>Thinking…</Text>}

      <ChatInput onSend={handleSend} disabled={sending} />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0f1419" },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#0f1419",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 56,
    paddingBottom: 16,
  },
  backBtn: { padding: 4 },
  backText: { color: "#7c6cf0", fontSize: 17 },
  headerTitle: { color: "#fff", fontSize: 20, fontWeight: "700" },
  list: { paddingHorizontal: 16, paddingBottom: 10 },
  thinking: {
    color: "#8b8ba7",
    paddingHorizontal: 20,
    paddingBottom: 6,
    fontStyle: "italic",
  },
});
