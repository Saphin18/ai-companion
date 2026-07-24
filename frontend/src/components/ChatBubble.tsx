import { useEffect, useState } from 'react';
import {
  Image,
  Linking,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
import type { Attachment, ChatMessage } from '../types/chat';
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

function formatDuration(ms: number | null): string {
  if (!ms || ms < 0) return '';
  const total = Math.round(ms / 1000);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

// A fixed decorative waveform. Real amplitude analysis needs native audio
// processing that Expo doesn't expose, so this is honest decoration, not a
// fake reading of the audio.
const BARS = [7, 13, 19, 9, 15, 5, 17, 9, 13, 7, 15, 5, 11, 7, 16, 10];

function VoiceBubble({
  attachment,
  tint,
}: {
  attachment: Attachment;
  tint: string;
}) {
  const player = useAudioPlayer(attachment.url ? { uri: attachment.url } : null);
  const status = useAudioPlayerStatus(player);
  const playing = status?.playing ?? false;

  const toggle = () => {
    if (!attachment.url) return;
    if (playing) {
      player.pause();
    } else {
      if (status?.didJustFinish) player.seekTo(0);
      player.play();
    }
  };

  return (
    <View style={styles.voiceRow}>
      <TouchableOpacity
        onPress={toggle}
        style={[styles.playBtn, { backgroundColor: 'rgba(255,255,255,0.18)' }]}
        accessibilityLabel={playing ? 'Pause voice message' : 'Play voice message'}
      >
        <Ionicons name={playing ? 'pause' : 'play'} size={15} color={tint} />
      </TouchableOpacity>

      <View style={styles.wave}>
        {BARS.map((h, i) => (
          <View
            key={i}
            style={[
              styles.bar,
              { height: h, backgroundColor: tint, opacity: playing ? 0.95 : 0.55 },
            ]}
          />
        ))}
      </View>

      <Text style={[styles.duration, { color: tint }]}>
        {formatDuration(attachment.duration_ms)}
      </Text>
    </View>
  );
}

export default function ChatBubble({ message }: Props) {
  const { theme } = useTheme();
  const isUser = message.role === 'user';
  const textColor = isUser ? theme.bubbleUserText : theme.bubbleCompanionText;

  const attachments = message.attachments ?? [];
  const voice = attachments.find((a) => a.kind === 'voice');
  const images = attachments.filter((a) => a.kind === 'image');
  const docs = attachments.filter((a) => a.kind === 'document');

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
        {images.map((img) =>
          img.url ? (
            <Image
              key={img.id}
              source={{ uri: img.url }}
              style={styles.image}
              resizeMode="cover"
            />
          ) : null
        )}

        {docs.map((doc) => (
          <View
            key={doc.id}
            style={[styles.docChip, { borderColor: 'rgba(255,255,255,0.25)' }]}
          >
            <Ionicons name="document-text-outline" size={18} color={textColor} />
            <Text
              style={[styles.docName, { color: textColor }]}
              numberOfLines={1}
            >
              {doc.original_name ?? 'Document'}
            </Text>
          </View>
        ))}

        {voice && <VoiceBubble attachment={voice} tint={textColor} />}

        {message.text.trim().length > 0 && (
          <Text
            style={[
              styles.text,
              { color: textColor },
              // The transcript sits under the player, smaller and dimmer, so
              // the chat stays skimmable without becoming a wall of words.
              voice && styles.transcript,
              voice && { borderTopColor: 'rgba(255,255,255,0.18)' },
            ]}
          >
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
        )}
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
  transcript: {
    fontSize: 13.5,
    lineHeight: 19,
    opacity: 0.85,
    marginTop: 8,
    paddingTop: 7,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  link: {
    textDecorationLine: 'underline',
    fontWeight: '600',
  },
  image: {
    width: 200,
    height: 200,
    borderRadius: 12,
    marginBottom: 8,
    backgroundColor: 'rgba(0,0,0,0.15)',
  },
  docChip: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginBottom: 8,
    maxWidth: 220,
  },
  docName: {
    fontSize: 13,
    marginLeft: 8,
    flexShrink: 1,
  },
  voiceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 170,
  },
  playBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 9,
  },
  wave: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    height: 22,
  },
  bar: {
    width: 2.5,
    borderRadius: 2,
    marginRight: 2.5,
  },
  duration: {
    fontSize: 11,
    marginLeft: 4,
    opacity: 0.9,
  },
});
