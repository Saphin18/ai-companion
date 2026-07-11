import { useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import ChatBubble from '../components/ChatBubble';
import ChatInput from '../components/ChatInput';
import { sendChatMessage } from '../services/api';
import type { ChatMessage } from '../types/chat';

export default function ChatScreen() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'companion',
      text: "Hi, I'm glad you're here. What's on your mind today?",
      createdAt: Date.now(),
    },
  ]);
  const [isThinking, setIsThinking] = useState(false);
  const listRef = useRef<FlatList<ChatMessage>>(null);

  const handleSend = async (text: string) => {
    const userMessage: ChatMessage = {
      id: `${Date.now()}-user`,
      role: 'user',
      text,
      createdAt: Date.now(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setIsThinking(true);

    try {
      const replyText = await sendChatMessage(text);
      const companionMessage: ChatMessage = {
        id: `${Date.now()}-companion`,
        role: 'companion',
        text: replyText,
        createdAt: Date.now(),
      };
      setMessages((prev) => [...prev, companionMessage]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `${Date.now()}-error`,
          role: 'companion',
          text: "Sorry, something went wrong on my end. Let's try that again.",
          createdAt: Date.now(),
        },
      ]);
    } finally {
      setIsThinking(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}
    >
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Your Companion</Text>
      </View>

      <FlatList
        ref={listRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <ChatBubble message={item} />}
        contentContainerStyle={styles.listContent}
        onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
      />

      {isThinking && (
        <View style={styles.thinkingRow}>
          <ActivityIndicator size="small" color="#94a3b8" />
          <Text style={styles.thinkingText}>Thinking...</Text>
        </View>
      )}

      <ChatInput onSend={handleSend} disabled={isThinking} />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  header: {
    paddingTop: 60,
    paddingBottom: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
  },
  headerTitle: {
    color: '#f8fafc',
    fontSize: 20,
    fontWeight: '700',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  thinkingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 6,
  },
  thinkingText: {
    color: '#94a3b8',
    fontSize: 13,
    marginLeft: 8,
  },
});