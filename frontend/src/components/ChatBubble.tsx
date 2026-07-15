import { Linking, StyleSheet, Text, View } from 'react-native';
import type { ChatMessage } from '../types/chat';
import { useTheme } from '../context/ThemeContext';

interface Props {
  message: ChatMessage;
}

// Matches http:// or https:// URLs inside the message text.
const URL_REGEX = /(https?:\/\/[^\s]+)/gi;

// Trailing punctuation that usually belongs to the sentence, not the link.
function splitTrailingPunctuation(url: string): [string, string] {
  const match = url.match(/[.,!?)\]]+$/);
  if (match) {
    const trail = match[0];
    return [url.slice(0, url.length - trail.length), trail];
  }
  return [url, ''];
}

export default function ChatBubble({ message }: Props) {
  const { theme } = useTheme();
  const isUser = message.role === 'user';
  const textColor = isUser ? theme.bubbleUserText : theme.bubbleCompanionText;

  // Break the text into plain segments and clickable link segments.
  const parts = message.text.split(URL_REGEX);

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
        <Text style={[styles.text, { color: textColor }]}>
          {parts.map((part, index) => {
            if (part && URL_REGEX.test(part)) {
              // Reset lastIndex because the regex is global (stateful) on .test().
              URL_REGEX.lastIndex = 0;
              const [link, trailing] = splitTrailingPunctuation(part);
              return (
                <Text key={index}>
                  <Text
                    style={[styles.link, { color: theme.accent }]}
                    onPress={() => Linking.openURL(link)}
                  >
                    {link}
                  </Text>
                  {trailing}
                </Text>
              );
            }
            URL_REGEX.lastIndex = 0;
            return <Text key={index}>{part}</Text>;
          })}
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
  link: {
    textDecorationLine: 'underline',
    fontWeight: '600',
  },
});