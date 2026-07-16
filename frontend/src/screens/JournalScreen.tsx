import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import {
  createJournalEntry,
  listJournalEntries,
  JournalEntry,
} from "../services/api";
import { useTheme } from "../context/ThemeContext";

type Props = {
  onBack: () => void;
};

export default function JournalScreen({ onBack }: Props) {
  const { theme } = useTheme();
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState("");
  const [saving, setSaving] = useState(false);
  const [latest, setLatest] = useState<JournalEntry | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setEntries(await listJournalEntries());
      } catch (e) {
        console.warn(e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  };

  const handleSave = async () => {
    const content = text.trim();
    if (!content) {
      Alert.alert("Empty entry", "Write a little about your day first.");
      return;
    }
    setSaving(true);
    try {
      const entry = await createJournalEntry(content);
      setLatest(entry);
      setEntries((prev) => [entry, ...prev]);
      setText("");
    } catch (e) {
      console.warn(e);
      Alert.alert("Couldn't save", "Please try again in a moment.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack}>
          <Text style={[styles.back, { color: theme.accent }]}>‹ Back</Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.textPrimary }]}>Journal</Text>
        <View style={{ width: 50 }} />
      </View>

      <FlatList
        style={styles.flex}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View>
            <Text style={[styles.prompt, { color: theme.textSecondary }]}>
              How are you feeling today?
            </Text>
            <TextInput
              style={[
                styles.input,
                { backgroundColor: theme.surface, color: theme.textPrimary },
              ]}
              value={text}
              onChangeText={setText}
              placeholder="Write about your day..."
              placeholderTextColor={theme.textSecondary}
              multiline
              textAlignVertical="top"
            />
            <TouchableOpacity
              style={[styles.saveBtn, { backgroundColor: theme.accent }]}
              onPress={handleSave}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator color={theme.accentText} />
              ) : (
                <Text style={[styles.saveText, { color: theme.accentText }]}>
                  Save entry
                </Text>
              )}
            </TouchableOpacity>

            {latest?.reflection && (
              <View
                style={[
                  styles.reflection,
                  { backgroundColor: theme.surface, borderLeftColor: theme.accent },
                ]}
              >
                <Text style={[styles.reflectionLabel, { color: theme.accent }]}>
                  Reflection
                </Text>
                <Text style={[styles.reflectionText, { color: theme.textPrimary }]}>
                  {latest.reflection}
                </Text>
              </View>
            )}

            {entries.length > 0 && (
              <Text style={[styles.sectionLabel, { color: theme.textSecondary }]}>
                PAST ENTRIES
              </Text>
            )}
          </View>
        }
        data={entries}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          loading ? (
            <ActivityIndicator color={theme.accent} style={{ marginTop: 24 }} />
          ) : (
            <Text style={[styles.empty, { color: theme.textSecondary }]}>
              No entries yet. Your first one is above.
            </Text>
          )
        }
        renderItem={({ item }) => (
          <View style={[styles.entry, { backgroundColor: theme.surface }]}>
            <View style={styles.entryHeader}>
              <Text style={[styles.entryDate, { color: theme.textSecondary }]}>
                {formatDate(item.created_at)}
              </Text>
            </View>
            <Text style={[styles.entryContent, { color: theme.textPrimary }]}>
              {item.content}
            </Text>
            {item.reflection && (
              <Text style={[styles.entryReflection, { color: theme.textSecondary }]}>
                {item.reflection}
              </Text>
            )}
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 60 },
  flex: { flex: 1 },
  scrollContent: { paddingHorizontal: 24, paddingBottom: 40 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
    paddingHorizontal: 24,
  },
  back: { fontSize: 17 },
  title: { fontSize: 20, fontWeight: "700" },

  prompt: { fontSize: 14, marginBottom: 10, marginTop: 4 },
  input: {
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    minHeight: 120,
    lineHeight: 22,
  },
  saveBtn: { borderRadius: 12, padding: 15, alignItems: "center", marginTop: 12 },
  saveText: { fontSize: 16, fontWeight: "700" },

  reflection: {
    borderRadius: 12,
    borderLeftWidth: 3,
    padding: 14,
    marginTop: 18,
  },
  reflectionLabel: { fontSize: 12, fontWeight: "700", marginBottom: 6 },
  reflectionText: { fontSize: 14, lineHeight: 21, fontStyle: "italic" },

  sectionLabel: { fontSize: 12, letterSpacing: 1, marginTop: 26, marginBottom: 12 },
  empty: { textAlign: "center", marginTop: 24, fontSize: 15 },

  entry: { borderRadius: 12, padding: 14, marginBottom: 10 },
  entryHeader: { flexDirection: "row", justifyContent: "flex-end", marginBottom: 4 },
  entryDate: { fontSize: 12 },
  entryContent: { fontSize: 15, lineHeight: 21 },
  entryReflection: {
    fontSize: 13,
    lineHeight: 19,
    fontStyle: "italic",
    marginTop: 10,
  },
});