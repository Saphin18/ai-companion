import { StyleSheet, Text, View } from 'react-native';
import type { ChatMessage } from '../types/chat';

interface Props {
  message: ChatMessage;
}

export default function ChatBubble({ message }: Props) {
  const isUser = message.role === 'user';
  return (
    <View style={[styles.row, isUser ? styles.rowUser : styles.rowCompanion]}>
      <View style={[styles.bubble, isUser ? styles.bubbleUser : styles.bubbleCompanion]}>
        <Text style={isUser ? styles.textUser : styles.textCompanion}>{message.text}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    width: '100%',
    marginVertical: 4,
    flexDirection: 'row',
  },
  rowUser: {
    justifyContent: 'flex-end',
  },
  rowCompanion: {
    justifyContent: 'flex-start',
  },
  bubble: {
    maxWidth: '78%',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 18,
  },
  bubbleUser: {
    backgroundColor: '#6366f1',
    borderBottomRightRadius: 4,
  },
  bubbleCompanion: {
    backgroundColor: '#1e293b',
    borderBottomLeftRadius: 4,
  },
  textUser: {
    color: '#ffffff',
    fontSize: 15,
    lineHeight: 20,
  },
  textCompanion: {
    color: '#e2e8f0',
    fontSize: 15,
    lineHeight: 20,
  },
});
