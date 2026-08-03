import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as SecureStore from 'expo-secure-store';
import {
  AudioModule,
  RecordingPresets,
  setAudioModeAsync,
  useAudioRecorder,
  useAudioRecorderState,
} from 'expo-audio';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { useTheme } from '../context/ThemeContext';
import { pickerLock } from '../services/pickerLock';
import { uploadAttachment } from '../services/attachments';
import type { Attachment, AttachmentKind } from '../types/chat';

// --- Web-safe helpers (native paths unchanged) ---

function showAlert(title: string, message: string) {
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    window.alert(title + '\n\n' + message);
  } else {
    Alert.alert(title, message);
  }
}

async function secureGet(key: string): Promise<string | null> {
  if (Platform.OS === 'web') {
    try { return localStorage.getItem(key); } catch { return null; }
  }
  return SecureStore.getItemAsync(key);
}

async function secureSet(key: string, value: string): Promise<void> {
  if (Platform.OS === 'web') {
    try { localStorage.setItem(key, value); } catch {}
    return;
  }
  return SecureStore.setItemAsync(key, value);
}

async function secureDelete(key: string): Promise<void> {
  if (Platform.OS === 'web') {
    try { localStorage.removeItem(key); } catch {}
    return;
  }
  return SecureStore.deleteItemAsync(key);
}

// --- End web-safe helpers ---

interface Props {
  onSend: (text: string, attachments: Attachment[]) => void;
  disabled?: boolean;
  handsFree?: boolean;
  onToggleHandsFree?: () => void;
  autoRecordSignal?: number;
  triggerRecordSignal?: number;
  draftKey?: string;
  triggerPhotoSignal?: number;
  triggerDocSignal?: number;
}

const MAX_RECORD_MS = 120000;

export default function ChatInput({
  onSend,
  disabled,
  handsFree,
  onToggleHandsFree,
  autoRecordSignal,
  triggerRecordSignal,
  draftKey = 'draft:new',
  triggerPhotoSignal,
  triggerDocSignal,
}: Props) {
  const { theme } = useTheme();
  const [text, setText] = useState('');

  const storeKey = `saphin.draft.${draftKey}`;

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const saved = await secureGet(storeKey);
        if (alive && saved) setText(saved);
      } catch {
        // ignore
      }
    })();
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storeKey]);

  useEffect(() => {
    const t = setTimeout(() => {
      secureSet(storeKey, text).catch(() => {});
    }, 300);
    return () => clearTimeout(t);
  }, [text, storeKey]);
  const [pending, setPending] = useState<Attachment[]>([]);
  const [busy, setBusy] = useState<string | null>(null);

  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const recorderState = useAudioRecorderState(recorder);
  const recording = recorderState?.isRecording ?? false;
  const startedAt = useRef<number>(0);
  const autoStop = useRef<ReturnType<typeof setTimeout> | null>(null);

  const startRecording = async () => {
    try {
      const granted = await AudioModule.requestRecordingPermissionsAsync();
      if (!granted.granted) {
        showAlert(
          'Microphone needed',
          'Allow microphone access in your phone settings to send voice messages.'
        );
        return;
      }
      await setAudioModeAsync({ allowsRecording: true, playsInSilentMode: true });
      await recorder.prepareToRecordAsync();
      recorder.record();
      startedAt.current = Date.now();
      autoStop.current = setTimeout(() => stopRecording(), MAX_RECORD_MS);
    } catch (e) {
      showAlert('Could not start recording', 'Please try again.');
    }
  };

  const stopRecording = async () => {
    if (autoStop.current) {
      clearTimeout(autoStop.current);
      autoStop.current = null;
    }
    const durationMs = Date.now() - startedAt.current;
    try {
      await recorder.stop();
      const uri = recorder.uri;
      if (!uri || durationMs < 600) return;

      setBusy('Transcribing...');
      const att = await uploadAttachment(
        uri,
        'voice',
        `voice-${Date.now()}.m4a`,
        'audio/m4a',
        durationMs
      );
      onSend(att.extracted_text ?? '', [att]);
    } catch (e: any) {
      showAlert('Voice message failed', e?.message ?? 'Please try again.');
    } finally {
      setBusy(null);
      await setAudioModeAsync({ allowsRecording: false });
    }
  };

  const cancelRecording = async () => {
    if (autoStop.current) {
      clearTimeout(autoStop.current);
      autoStop.current = null;
    }
    try {
      await recorder.stop();
    } catch {
      // ignore - we are throwing the audio away anyway
    } finally {
      startedAt.current = 0;
      await setAudioModeAsync({ allowsRecording: false });
    }
  };

  // Hands-free: parent bumps this number when it's the user's turn again.
  useEffect(() => {
    if (autoRecordSignal && handsFree && !recording && !disabled && !busy) {
      startRecording();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoRecordSignal]);

  // Home-screen mic shortcut: open the mic once, regardless of hands-free.
  // A short delay lets the native audio recorder (useAudioRecorder) finish
  // initializing after mount. Without it, startRecording() fires before the
  // recorder is ready and silently does nothing.
  useEffect(() => {
    if (triggerRecordSignal && !recording && !disabled && !busy) {
      const t = setTimeout(() => {
        startRecording();
      }, 500);
      return () => clearTimeout(t);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [triggerRecordSignal]);

  useEffect(() => {
    if (triggerPhotoSignal && !recording && !disabled && !busy) {
      pickImage();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [triggerPhotoSignal]);

  useEffect(() => {
    if (triggerDocSignal && !recording && !disabled && !busy) {
      pickDocument();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [triggerDocSignal]);

  useEffect(() => {
    return () => {
      if (autoStop.current) clearTimeout(autoStop.current);
    };
  }, []);

  const pickImage = async () => {
    try {
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!perm.granted) return;
      pickerLock.active = true;
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        quality: 0.7,
      });
      pickerLock.active = false;
      if (result.canceled || !result.assets?.length) return;
      const asset = result.assets[0];
      setBusy('Reading image...');
      const att = await uploadAttachment(
        asset.uri,
        'image',
        asset.fileName ?? `image-${Date.now()}.jpg`,
        asset.mimeType ?? 'image/jpeg'
      );
      setPending((p) => [...p, att]);
    } catch (e: any) {
      pickerLock.active = false;
      showAlert('Could not add image', e?.message ?? 'Please try again.');
    } finally {
      setBusy(null);
    }
  };

  const pickDocument = async () => {
    try {
      pickerLock.active = true;
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'text/*', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
        copyToCacheDirectory: true,
      });
      pickerLock.active = false;
      if (result.canceled || !result.assets?.length) return;
      const asset = result.assets[0];
      setBusy('Reading document...');
      const att = await uploadAttachment(
        asset.uri,
        'document',
        asset.name ?? `document-${Date.now()}`,
        asset.mimeType ?? 'application/octet-stream'
      );
      if (!att.extracted_text) {
        showAlert(
          'Nothing to read',
          "I couldn't find any text in that file. Scanned pages and images inside PDFs aren't readable yet."
        );
      }
      setPending((p) => [...p, att]);
    } catch (e: any) {
      pickerLock.active = false;
      showAlert('Could not add document', e?.message ?? 'Please try again.');
    } finally {
      setBusy(null);
    }
  };

  // Web: open the browser's native file picker directly — no confirm dialog.
  // Accepts both images and documents in one picker.
  const pickFileWeb = () => {
    if (typeof document === 'undefined') return;
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*,application/pdf,text/plain,.docx,.doc,.txt';
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;
      const isImage = file.type.startsWith('image/');
      const kind: AttachmentKind = isImage ? 'image' : 'document';
      setBusy(isImage ? 'Reading image...' : 'Reading document...');
      try {
        const uri = URL.createObjectURL(file);
        const att = await uploadAttachment(
          uri,
          kind,
          file.name,
          file.type || 'application/octet-stream'
        );
        URL.revokeObjectURL(uri);
        if (!isImage && !att.extracted_text) {
          showAlert(
            'Nothing to read',
            "I couldn't find any text in that file. Scanned pages and images inside PDFs aren't readable yet."
          );
        }
        setPending((p) => [...p, att]);
      } catch (e: any) {
        showAlert('Could not add file', e?.message ?? 'Please try again.');
      } finally {
        setBusy(null);
      }
    };
    input.click();
  };

  const openAttachMenu = () => {
    if (Platform.OS === 'web') {
      pickFileWeb();
    } else {
      Alert.alert('Attach', 'What would you like to send?', [
        { text: 'Photo', onPress: pickImage },
        { text: 'Document', onPress: pickDocument },
        { text: 'Cancel', style: 'cancel' },
      ]);
    }
  };

  const handleSend = () => {
    const trimmed = text.trim();
    if (!trimmed && pending.length === 0) return;
    onSend(trimmed, pending);
    setText('');
    setPending([]);
    secureDelete(storeKey).catch(() => {});
  };

  // Web: Enter sends, Shift+Enter adds newline (like ChatGPT / Claude).
  const handleKeyPress = (e: any) => {
    if (Platform.OS !== 'web') return;
    if (e.nativeEvent?.key === 'Enter' && !e.nativeEvent?.shiftKey) {
      e.preventDefault?.();
      const trimmed = text.trim();
      if (trimmed || pending.length > 0) {
        handleSend();
      }
    }
  };

  const canSend = !disabled && !busy && (!!text.trim() || pending.length > 0);

  return (
    <View
      style={[
        styles.wrapper,
        { backgroundColor: theme.surface, borderTopColor: theme.border },
      ]}
    >
      {busy && (
        <View style={styles.statusRow}>
          <ActivityIndicator size="small" color={theme.accent} />
          <Text style={[styles.statusText, { color: theme.textSecondary }]}>
            {busy}
          </Text>
        </View>
      )}

      {pending.length > 0 && (
        <View style={styles.chips}>
          {pending.map((a) => (
            <View
              key={a.id}
              style={[styles.chip, { backgroundColor: theme.surfaceAlt }]}
            >
              <Ionicons
                name={a.kind === 'image' ? 'image-outline' : 'document-text-outline'}
                size={14}
                color={theme.textSecondary}
              />
              <Text
                style={[styles.chipText, { color: theme.textPrimary }]}
                numberOfLines={1}
              >
                {a.original_name ?? a.kind}
              </Text>
              <TouchableOpacity
                onPress={() => setPending((p) => p.filter((x) => x.id !== a.id))}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Ionicons name="close" size={14} color={theme.textSecondary} />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}

      {recording ? (
        <View style={styles.container}>
          <TouchableOpacity
            style={[styles.iconBtn, { backgroundColor: theme.surfaceAlt }]}
            onPress={cancelRecording}
            accessibilityLabel="Cancel voice message"
          >
            <Ionicons name="trash-outline" size={20} color={theme.danger} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.recording, { backgroundColor: theme.surfaceAlt }]}
            onPress={stopRecording}
            activeOpacity={0.8}
          >
            <View style={[styles.recDot, { backgroundColor: theme.danger }]} />
            <Text style={[styles.recText, { color: theme.textPrimary }]}>
              Recording... tap to send
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.iconBtn, { backgroundColor: theme.accent }]}
            onPress={stopRecording}
          >
            <Ionicons name="send" size={20} color={theme.accentText} />
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.container}>
          <TouchableOpacity
            style={styles.plainBtn}
            onPress={openAttachMenu}
            disabled={disabled || !!busy}
          >
            <Ionicons name="add-circle-outline" size={26} color={theme.textSecondary} />
          </TouchableOpacity>

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
            editable={!disabled && !busy}
            onKeyPress={handleKeyPress}
          />

          {canSend ? (
            <TouchableOpacity
              style={[styles.iconBtn, { backgroundColor: theme.accent }]}
              onPress={handleSend}
            >
              <Ionicons name="send" size={20} color={theme.accentText} />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[
                styles.iconBtn,
                { backgroundColor: handsFree ? theme.accent : theme.surfaceAlt },
              ]}
              onPress={startRecording}
              onLongPress={onToggleHandsFree}
              disabled={disabled || !!busy}
              accessibilityLabel="Record a voice message. Long press for hands-free mode."
            >
              <Ionicons
                name="mic"
                size={20}
                color={handsFree ? theme.accentText : theme.textSecondary}
              />
            </TouchableOpacity>
          )}
        </View>
      )}

      {handsFree && !recording && (
        <Text style={[styles.handsFreeHint, { color: theme.textSecondary }]}>
          Hands-free on - long press the mic to turn it off
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    borderTopWidth: 1,
    paddingBottom: Platform.OS === 'ios' ? 10 : 16,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 12,
    paddingTop: 10,
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
    marginHorizontal: 8,
  },
  plainBtn: {
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  recording: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 24,
    paddingHorizontal: 18,
    minHeight: 48,
    marginHorizontal: 8,
  },
  recDot: {
    width: 9,
    height: 9,
    borderRadius: 5,
    marginRight: 10,
  },
  recText: {
    fontSize: 15,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingTop: 10,
  },
  statusText: {
    fontSize: 13,
    marginLeft: 8,
    fontStyle: 'italic',
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 14,
    paddingTop: 10,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 6,
    maxWidth: 200,
  },
  chipText: {
    fontSize: 12,
    marginHorizontal: 6,
    flexShrink: 1,
  },
  handsFreeHint: {
    fontSize: 11,
    textAlign: 'center',
    paddingTop: 6,
  },
});
