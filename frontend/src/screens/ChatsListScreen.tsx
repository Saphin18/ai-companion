import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { listSessions, SessionSummary } from "../services/api";

type Props = {
  onOpenChat: (sessionId: string | null) => void;
  onOpenProfile: () => void;
};

export default function ChatsListScreen({ onOpenChat, onOpenProfile }: Props) {
  const [sessions, setSessions] = useState<SessionSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        setSessions(await listSessions());
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

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Your Chats</Text>
        <TouchableOpacity onPress={onOpenProfile} style={styles.menuBtn}>
          <Text style={styles.menuIcon}>☰</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={styles.newBtn}
        onPress={() => onOpenChat(null)}
      >
        <Text style={styles.newBtnText}>+ New chat</Text>
      </TouchableOpacity>

      {loading ? (
        <ActivityIndicator color="#7c6cf0" style={{ marginTop: 40 }} />
      ) : sessions.length === 0 ? (
        <Text style={styles.empty}>
          No chats yet. Start a new one above.
        </Text>
      ) : (
        <FlatList
          data={sessions}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingBottom: 20 }}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.row}
              onPress={() => onOpenChat(item.id)}
            >
              <Text style={styles.rowTitle} numberOfLines={1}>
                {item.title || "New chat"}
              </Text>
              <Text style={styles.rowDate}>{formatDate(item.updated_at)}</Text>
            </TouchableOpacity>
          )}
        />
      )}
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
  rowTitle: { color: "#fff", fontSize: 16, flex: 1, marginRight: 10 },
  rowDate: { color: "#8b8ba7", fontSize: 13 },
});
