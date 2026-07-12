import { useState } from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';

interface Props {
  onSend: (text: string) => void;
  disabled?: boolean;
}

export default function ChatInput({ onSend, disabled }: Props) {
  const { theme } = useTheme();
  const [text, setText] = useState('');

  const handleSend = () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    onSend(trimmed);
    setText('');
  };

  const canSend = !disabled && !!text.trim();

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: theme.surface, borderTopColor: theme.border },
      ]}
    >
      <TextInput
        style={[
          styles.input,
          { backgroundColor: theme.surfaceAlt, color: theme.textPrimary },
        ]}
        value={text}
        onChangeText={setText}
        placeholder="Type a message..."
        placeholderTextColor={theme.textSecondary}
        multiline
        editable={!disabled}
      />
      <TouchableOpacity
        style={[
          styles.sendButton,
          { backgroundColor: canSend ? theme.accent : theme.surfaceAlt },
        ]}
        onPress={handleSend}
        disabled={!canSend}
      >
        <Text
          style={[
            styles.sendText,
            { color: canSend ? theme.accentText : theme.textSecondary },
          ]}
        >
          Send
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: Platform.OS === 'ios' ? 10 : 16,
    borderTopWidth: 1,
  },
  input: {
    flex: 1,
    borderRadius: 24,
    paddingHorizontal: 18,
    paddingTop: 12,
    paddingBottom: 12,
    fontSize: 15,
    minHeight: 48,
    maxHeight: 120,
    marginRight: 10,
  },
  sendButton: {
    borderRadius: 24,
    paddingHorizontal: 22,
    minHeight: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendText: {
    fontWeight: '600',
    fontSize: 15,
  },
});