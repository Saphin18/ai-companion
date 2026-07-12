import { StyleSheet, Text, View } from 'react-native';
import type { ChatMessage } from '../types/chat';
import { useTheme } from '../context/ThemeContext';

interface Props {
  message: ChatMessage;
}

export default function ChatBubble({ message }: Props) {
  const { theme } = useTheme();
  const isUser = message.role === 'user';

  return (
    <View style={[styles.row, isUser ? styles.rowUser : styles.rowCompanion]}>
      <View
        style={[
          styles.bubble,
          isUser
            ? [styles.bubbleUser, { backgroundColor: theme.bubbleUser }]
            : [styles.bubbleCompanion, { backgroundColor: theme.bubbleCompanion }],
        ]}
      >
        <Text
          style={[
            styles.text,
            { color: isUser ? theme.bubbleUserText : theme.bubbleCompanionText },
          ]}
        >
          {message.text}
        </Text>
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
    borderBottomRightRadius: 4,
  },
  bubbleCompanion: {
    borderBottomLeftRadius: 4,
  },
  text: {
    fontSize: 15,
    lineHeight: 20,
  },
});