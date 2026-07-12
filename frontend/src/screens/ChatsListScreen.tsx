import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import {
  listSessions,
  removeSession,
  renameSession,
  setSessionPinned,
  SessionSummary,
} from "../services/api";

type Props = {
  onOpenChat: (sessionId: string | null) => void;
  onOpenProfile: () => void;
};

// Pinned chats float to the top; within each group, most recent first.
function sortSessions(list: SessionSummary[]): SessionSummary[] {
  return [...list].sort((a, b) => {
    if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
    return b.updated_at.localeCompare(a.updated_at);
  });
}

export default function ChatsListScreen({ onOpenChat, onOpenProfile }: Props) {
  const [sessions, setSessions] = useState<SessionSummary[]>([]);
  const [loading, setLoading] = useState(true);

  // The session whose action menu is open (null = menu closed).
  const [menuFor, setMenuFor] = useState<SessionSummary | null>(null);
  // Rename modal state.
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
    })();
  }, []);

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    });
  };

  const handleTogglePin = async (item: SessionSummary) => {
    setMenuFor(null);
    const next = !item.pinned;
    // Optimistic: update + re-sort immediately, roll back if the call fails.
    setSessions((prev) =>
      sortSessions(
        prev.map((s) => (s.id === item.id ? { ...s, pinned: next } : s))
      )
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
        sortSessions(
          prev.map((s) => (s.id === renameFor.id ? { ...s, title } : s))
        )
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
    Alert.alert(
      "Remove from list",
      "This hides the chat from your list. It won't appear here anymore.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: async () => {
            // Optimistic remove; restore on failure.
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
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Your Chats</Text>
        <TouchableOpacity onPress={onOpenProfile} style={styles.menuBtn}>
          <Text style={styles.menuIcon}>☰</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.newBtn} onPress={() => onOpenChat(null)}>
        <Text style={styles.newBtnText}>+ New chat</Text>
      </TouchableOpacity>

      {loading ? (
        <ActivityIndicator color="#7c6cf0" style={{ marginTop: 40 }} />
      ) : sessions.length === 0 ? (
        <Text style={styles.empty}>No chats yet. Start a new one above.</Text>
      ) : (
        <FlatList
          data={sessions}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingBottom: 20 }}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.row}
              onPress={() => onOpenChat(item.id)}
              onLongPress={() => setMenuFor(item)}
              delayLongPress={250}
            >
              {item.pinned && <Text style={styles.pin}>📌</Text>}
              <Text style={styles.rowTitle} numberOfLines={1}>
                {item.title || "New chat"}
              </Text>
              <Text style={styles.rowDate}>{formatDate(item.updated_at)}</Text>
            </TouchableOpacity>
          )}
        />
      )}

      {/* Action menu (long-press): Pin / Rename / Remove */}
      <Modal
        visible={menuFor !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setMenuFor(null)}
      >
        <Pressable style={styles.overlay} onPress={() => setMenuFor(null)}>
          <Pressable style={styles.sheet}>
            <Text style={styles.sheetTitle} numberOfLines={1}>
              {menuFor?.title || "New chat"}
            </Text>
            <TouchableOpacity
              style={styles.sheetItem}
              onPress={() => menuFor && handleTogglePin(menuFor)}
            >
              <Text style={styles.sheetText}>
                {menuFor?.pinned ? "📌  Unpin" : "📌  Pin"}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.sheetItem}
              onPress={() => menuFor && openRename(menuFor)}
            >
              <Text style={styles.sheetText}>✏️  Rename</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.sheetItem}
              onPress={() => menuFor && handleRemove(menuFor)}
            >
              <Text style={[styles.sheetText, styles.danger]}>
                🗑  Remove from list
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.sheetCancel}
              onPress={() => setMenuFor(null)}
            >
              <Text style={styles.sheetCancelText}>Cancel</Text>
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
        <Pressable style={styles.overlay} onPress={() => setRenameFor(null)}>
          <Pressable style={styles.renameBox}>
            <Text style={styles.renameTitle}>Rename chat</Text>
            <TextInput
              style={styles.renameInput}
              value={renameText}
              onChangeText={setRenameText}
              placeholder="Chat name"
              placeholderTextColor="#8b8ba7"
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
                <Text style={styles.renameCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.renameSave}
                onPress={submitRename}
                disabled={busy}
              >
                {busy ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.renameSaveText}>Save</Text>
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
  container: { flex: 1, backgroundColor: "#0f1419", paddingTop: 56 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  headerTitle: { color: "#fff", fontSize: 24, fontWeight: "700" },
  menuBtn: { padding: 6 },
  menuIcon: { color: "#fff", fontSize: 24 },
  newBtn: {
    backgroundColor: "#7c6cf0",
    marginHorizontal: 20,
    borderRadius: 14,
    padding: 15,
    alignItems: "center",
    marginBottom: 20,
  },
  newBtnText: { color: "#fff", fontSize: 16, fontWeight: "700" },
  empty: { color: "#8b8ba7", textAlign: "center", marginTop: 40, fontSize: 15 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#1a2230",
    marginHorizontal: 20,
    marginBottom: 10,
    borderRadius: 14,
    padding: 16,
  },
  pin: { fontSize: 13, marginRight: 8 },
  rowTitle: { color: "#fff", fontSize: 16, flex: 1, marginRight: 10 },
  rowDate: { color: "#8b8ba7", fontSize: 13 },

  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.55)",
    justifyContent: "center",
    padding: 28,
  },
  sheet: {
    backgroundColor: "#1a2230",
    borderRadius: 18,
    paddingVertical: 8,
    overflow: "hidden",
  },
  sheetTitle: {
    color: "#8b8ba7",
    fontSize: 13,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 6,
  },
  sheetItem: { paddingVertical: 15, paddingHorizontal: 20 },
  sheetText: { color: "#fff", fontSize: 16 },
  danger: { color: "#ff6b6b" },
  sheetCancel: {
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "rgba(255,255,255,0.1)",
    marginTop: 4,
  },
  sheetCancelText: { color: "#8b8ba7", fontSize: 16, textAlign: "center" },

  renameBox: { backgroundColor: "#1a2230", borderRadius: 18, padding: 20 },
  renameTitle: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "600",
    marginBottom: 14,
  },
  renameInput: {
    backgroundColor: "rgba(255,255,255,0.1)",
    color: "#fff",
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
  },
  renameActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 16,
  },
  renameCancel: { paddingVertical: 10, paddingHorizontal: 16 },
  renameCancelText: { color: "#8b8ba7", fontSize: 15, fontWeight: "600" },
  renameSave: {
    backgroundColor: "#7c6cf0",
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 22,
    marginLeft: 8,
    minWidth: 84,
    alignItems: "center",
  },
  renameSaveText: { color: "#fff", fontSize: 15, fontWeight: "700" },
});
