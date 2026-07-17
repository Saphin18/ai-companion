import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import {
  getProfile,
  listSessions,
  removeSession,
  renameSession,
  setSessionPinned,
  SessionSummary,
} from "../services/api";
import { supabase } from "../services/supabase";
import { useTheme } from "../context/ThemeContext";

type Props = {
  onOpenChat: (sessionId: string | null) => void;
  onOpenProfile: () => void;
  onOpenJournal: () => void;
  onOpenReminders: () => void;
  onOpenGoals: () => void;
};

function sortSessions(list: SessionSummary[]): SessionSummary[] {
  return [...list].sort((a, b) => {
    if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
    return b.updated_at.localeCompare(a.updated_at);
  });
}

export default function ChatsListScreen({
  onOpenChat,
  onOpenProfile,
  onOpenJournal,
  onOpenReminders,
  onOpenGoals,
}: Props) {
  const { theme } = useTheme();
  const [sessions, setSessions] = useState<SessionSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [initial, setInitial] = useState("?");

  const [menuFor, setMenuFor] = useState<SessionSummary | null>(null);
  const [renameFor, setRenameFor] = useState<SessionSummary | null>(null);
  const [renameText, setRenameText] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        setSessions(sortSessions(await listSessions()));
      } catch (e) {
        console.warn(e);
      } finally {
        setLoading(false);
      }
      // Load avatar + initial for the header button.
      try {
        const { data } = await supabase.auth.getUser();
        const profile = await getProfile();
        setAvatarUrl(profile.avatar_url ?? null);
        const src = (profile.display_name || data.user?.email || "?").trim();
        setInitial((src[0] || "?").toUpperCase());
      } catch (e) {
        console.warn(e);
      }
    })();
  }, []);

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  };

  const handleTogglePin = async (item: SessionSummary) => {
    setMenuFor(null);
    const next = !item.pinned;
    setSessions((prev) =>
      sortSessions(prev.map((s) => (s.id === item.id ? { ...s, pinned: next } : s)))
    );
    try {
      await setSessionPinned(item.id, next);
    } catch (e) {
      console.warn(e);
      setSessions((prev) =>
        sortSessions(
          prev.map((s) => (s.id === item.id ? { ...s, pinned: item.pinned } : s))
        )
      );
      Alert.alert("Couldn't update", "Please try again.");
    }
  };

  const openRename = (item: SessionSummary) => {
    setMenuFor(null);
    setRenameFor(item);
    setRenameText(item.title || "");
  };

  const submitRename = async () => {
    if (!renameFor) return;
    const title = renameText.trim();
    if (!title) {
      Alert.alert("Empty name", "Please enter a name for this chat.");
      return;
    }
    setBusy(true);
    try {
      await renameSession(renameFor.id, title);
      setSessions((prev) =>
        sortSessions(prev.map((s) => (s.id === renameFor.id ? { ...s, title } : s)))
      );
      setRenameFor(null);
    } catch (e) {
      console.warn(e);
      Alert.alert("Couldn't rename", "Please try again.");
    } finally {
      setBusy(false);
    }
  };

  const handleRemove = (item: SessionSummary) => {
    setMenuFor(null);
    Alert.alert("Remove from list", "Are you sure you want to remove this chat?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Remove",
        style: "destructive",
        onPress: async () => {
          const prev = sessions;
          setSessions((cur) => cur.filter((s) => s.id !== item.id));
          try {
            await removeSession(item.id);
          } catch (e) {
            console.warn(e);
            setSessions(prev);
            Alert.alert("Couldn't remove", "Please try again.");
          }
        },
      },
    ]);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: theme.textPrimary }]}>
          Your Chats
        </Text>
        <TouchableOpacity onPress={onOpenProfile}>
          {avatarUrl ? (
            <Image source={{ uri: avatarUrl }} style={styles.headerAvatarImg} />
          ) : (
            <View style={[styles.headerAvatar, { backgroundColor: theme.accent }]}>
              <Text style={[styles.headerAvatarText, { color: theme.accentText }]}>
                {initial}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={[styles.newBtn, { backgroundColor: theme.accent }]}
        onPress={() => onOpenChat(null)}
      >
        <Text style={[styles.newBtnText, { color: theme.accentText }]}>
          + New chat
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.journalBtn, { borderColor: theme.accent }]}
        onPress={onOpenJournal}
      >
        <Text style={[styles.journalBtnText, { color: theme.accent }]}>
          📖  Journal
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.journalBtn, { borderColor: theme.accent }]}
        onPress={onOpenReminders}
      >
        <Text style={[styles.journalBtnText, { color: theme.accent }]}>
          ⏰  Reminders
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.journalBtn, { borderColor: theme.accent }]}
        onPress={onOpenGoals}
      >
        <Text style={[styles.journalBtnText, { color: theme.accent }]}>
          🎯  Goals
        </Text>
      </TouchableOpacity>

      {loading ? (
        <ActivityIndicator color={theme.accent} style={{ marginTop: 40 }} />
      ) : sessions.length === 0 ? (
        <Text style={[styles.empty, { color: theme.textSecondary }]}>
          No chats yet. Start a new one above.
        </Text>
      ) : (
        <FlatList
          data={sessions}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingBottom: 20 }}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.row, { backgroundColor: theme.surface }]}
              onPress={() => onOpenChat(item.id)}
              onLongPress={() => setMenuFor(item)}
              delayLongPress={250}
            >
              {item.pinned && <Text style={styles.pin}>📌</Text>}
              <Text
                style={[styles.rowTitle, { color: theme.textPrimary }]}
                numberOfLines={1}
              >
                {item.title || "New chat"}
              </Text>
              <Text style={[styles.rowDate, { color: theme.textSecondary }]}>
                {formatDate(item.updated_at)}
              </Text>
            </TouchableOpacity>
          )}
        />
      )}

      {/* Action menu */}
      <Modal
        visible={menuFor !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setMenuFor(null)}
      >
        <Pressable
          style={[styles.overlay, { backgroundColor: theme.overlay }]}
          onPress={() => setMenuFor(null)}
        >
          <Pressable style={[styles.sheet, { backgroundColor: theme.surface }]}>
            <Text
              style={[styles.sheetTitle, { color: theme.textSecondary }]}
              numberOfLines={1}
            >
              {menuFor?.title || "New chat"}
            </Text>
            <TouchableOpacity
              style={styles.sheetItem}
              onPress={() => menuFor && handleTogglePin(menuFor)}
            >
              <Text style={[styles.sheetText, { color: theme.textPrimary }]}>
                {menuFor?.pinned ? "📌  Unpin" : "📌  Pin"}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.sheetItem}
              onPress={() => menuFor && openRename(menuFor)}
            >
              <Text style={[styles.sheetText, { color: theme.textPrimary }]}>
                ✏️  Rename
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.sheetItem}
              onPress={() => menuFor && handleRemove(menuFor)}
            >
              <Text style={[styles.sheetText, { color: theme.danger }]}>
                🗑  Remove from list
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.sheetCancel, { borderTopColor: theme.border }]}
              onPress={() => setMenuFor(null)}
            >
              <Text style={[styles.sheetCancelText, { color: theme.textSecondary }]}>
                Cancel
              </Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Rename modal */}
      <Modal
        visible={renameFor !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setRenameFor(null)}
      >
        <Pressable
          style={[styles.overlay, { backgroundColor: theme.overlay }]}
          onPress={() => setRenameFor(null)}
        >
          <Pressable style={[styles.renameBox, { backgroundColor: theme.surface }]}>
            <Text style={[styles.renameTitle, { color: theme.textPrimary }]}>
              Rename chat
            </Text>
            <TextInput
              style={[
                styles.renameInput,
                { backgroundColor: theme.surfaceAlt, color: theme.textPrimary },
              ]}
              value={renameText}
              onChangeText={setRenameText}
              placeholder="Chat name"
              placeholderTextColor={theme.textSecondary}
              autoFocus
              returnKeyType="done"
              onSubmitEditing={submitRename}
              maxLength={80}
            />
            <View style={styles.renameActions}>
              <TouchableOpacity
                style={styles.renameCancel}
                onPress={() => setRenameFor(null)}
              >
                <Text style={[styles.renameCancelText, { color: theme.textSecondary }]}>
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.renameSave, { backgroundColor: theme.accent }]}
                onPress={submitRename}
                disabled={busy}
              >
                {busy ? (
                  <ActivityIndicator color={theme.accentText} />
                ) : (
                  <Text style={[styles.renameSaveText, { color: theme.accentText }]}>
                    Save
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 56 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  headerTitle: { fontSize: 24, fontWeight: "700" },
  headerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  headerAvatarText: { fontSize: 18, fontWeight: "700" },
  headerAvatarImg: { width: 40, height: 40, borderRadius: 20 },

  newBtn: {
    marginHorizontal: 20,
    borderRadius: 14,
    padding: 15,
    alignItems: "center",
    marginBottom: 10,
  },
  newBtnText: { fontSize: 16, fontWeight: "700" },

  journalBtn: {
    marginHorizontal: 20,
    borderRadius: 14,
    padding: 14,
    alignItems: "center",
    marginBottom: 20,
    borderWidth: 1,
  },
  journalBtnText: { fontSize: 16, fontWeight: "700" },

  empty: { textAlign: "center", marginTop: 40, fontSize: 15 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginHorizontal: 20,
    marginBottom: 10,
    borderRadius: 14,
    padding: 16,
  },
  pin: { fontSize: 13, marginRight: 8 },
  rowTitle: { fontSize: 16, flex: 1, marginRight: 10 },
  rowDate: { fontSize: 13 },

  overlay: { flex: 1, justifyContent: "center", padding: 28 },
  sheet: { borderRadius: 18, paddingVertical: 8, overflow: "hidden" },
  sheetTitle: { fontSize: 13, paddingHorizontal: 20, paddingTop: 12, paddingBottom: 6 },
  sheetItem: { paddingVertical: 15, paddingHorizontal: 20 },
  sheetText: { fontSize: 16 },
  sheetCancel: {
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderTopWidth: StyleSheet.hairlineWidth,
    marginTop: 4,
  },
  sheetCancelText: { fontSize: 16, textAlign: "center" },

  renameBox: { borderRadius: 18, padding: 20 },
  renameTitle: { fontSize: 17, fontWeight: "600", marginBottom: 14 },
  renameInput: { borderRadius: 12, padding: 14, fontSize: 16 },
  renameActions: { flexDirection: "row", justifyContent: "flex-end", marginTop: 16 },
  renameCancel: { paddingVertical: 10, paddingHorizontal: 16 },
  renameCancelText: { fontSize: 15, fontWeight: "600" },
  renameSave: {
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 22,
    marginLeft: 8,
    minWidth: 84,
    alignItems: "center",
  },
  renameSaveText: { fontSize: 15, fontWeight: "700" },
});
