import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { getProfile, listSessions, SessionSummary } from "../services/api";
import { supabase } from "../services/supabase";
import { useTheme } from "../context/ThemeContext";

type Props = {
  onOpenChat: (sessionId: string | null) => void;
  onOpenProfile: () => void;
  onOpenJournal: () => void;
  onOpenReminders: () => void;
  onOpenGoals: () => void;
  onOpenAbout: () => void;
  onOpenWallpaper: () => void;
  onCollapse: () => void;
  activeView: string;
  refreshKey: number;
};

function sortSessions(list: SessionSummary[]): SessionSummary[] {
  return [...list].sort((a, b) => {
    if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
    return b.updated_at.localeCompare(a.updated_at);
  });
}

export default function WebSidebar({
  onOpenChat,
  onOpenProfile,
  onOpenJournal,
  onOpenReminders,
  onOpenGoals,
  onOpenAbout,
  onOpenWallpaper,
  onCollapse,
  activeView,
  refreshKey,
}: Props) {
  const { theme } = useTheme();
  const [sessions, setSessions] = useState<SessionSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState("");
  const [initial, setInitial] = useState("?");

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setSessions(sortSessions(await listSessions()));
      } catch (e) {
        console.warn(e);
      } finally {
        setLoading(false);
      }
      try {
        const profile = await getProfile();
        setAvatarUrl(profile.avatar_url ?? null);
        const name = (profile.display_name || "").trim();
        setDisplayName(name || "friend");
        setInitial((name[0] || "?").toUpperCase());
      } catch (e) {
        console.warn(e);
      }
    })();
  }, [refreshKey]);

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  };

  const navItem = (
    iconName: keyof typeof Ionicons.glyphMap,
    label: string,
    onPress: () => void,
    viewName?: string
  ) => {
    const isActive = activeView === viewName;
    return (
      <TouchableOpacity
        style={[styles.navItem, isActive && { backgroundColor: theme.surfaceAlt }]}
        onPress={onPress}
      >
        <Ionicons
          name={iconName}
          size={18}
          color={isActive ? theme.accent : theme.textSecondary}
        />
        <Text
          style={[
            styles.navLabel,
            { color: isActive ? theme.textPrimary : theme.textSecondary },
          ]}
        >
          {label}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: theme.surface, borderRightColor: theme.border },
      ]}
    >
      <View style={styles.header}>
        <Text style={[styles.brand, { color: theme.textPrimary }]}>Saphin AI</Text>
        <TouchableOpacity onPress={onCollapse} hitSlop={8}>
          <Ionicons name="chevron-back" size={20} color={theme.textSecondary} />
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={[styles.newChat, { borderColor: theme.border }]}
        onPress={() => onOpenChat(null)}
      >
        <Ionicons name="add" size={18} color={theme.accent} />
        <Text style={[styles.newChatText, { color: theme.accent }]}>New chat</Text>
      </TouchableOpacity>

      <View style={styles.nav}>
        {navItem("chatbubbles-outline", "Chats", () => onOpenChat(null), "list")}
        {navItem("book-outline", "Journal", onOpenJournal, "journal")}
        {navItem("alarm-outline", "Reminders", onOpenReminders, "reminders")}
        {navItem("flag-outline", "Goals", onOpenGoals, "goals")}
        {navItem("information-circle-outline", "About", onOpenAbout, "about")}
        {navItem("color-palette-outline", "Wallpaper", onOpenWallpaper, "wallpaper")}
      </View>

      <View style={[styles.divider, { backgroundColor: theme.border }]} />

      <Text style={[styles.recentsLabel, { color: theme.textSecondary }]}>
        Recent chats
      </Text>

      <View style={{ flex: 1 }}>
        {loading ? (
          <ActivityIndicator color={theme.accent} style={{ marginTop: 20 }} />
        ) : sessions.length === 0 ? (
          <Text style={[styles.empty, { color: theme.textSecondary }]}>
            No chats yet.
          </Text>
        ) : (
          <FlatList
            data={sessions}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ paddingBottom: 10 }}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.chatRow}
                onPress={() => onOpenChat(item.id)}
              >
                <Ionicons
                  name="chatbubble-outline"
                  size={14}
                  color={theme.textSecondary}
                  style={{ marginRight: 8, marginTop: 2 }}
                />
                <View style={{ flex: 1 }}>
                  <Text
                    style={[styles.chatTitle, { color: theme.textPrimary }]}
                    numberOfLines={1}
                  >
                    {item.pinned ? "\uD83D\uDCCC " : ""}
                    {item.title || "New chat"}
                  </Text>
                  <Text style={[styles.chatDate, { color: theme.textSecondary }]}>
                    {formatDate(item.updated_at)}
                  </Text>
                </View>
              </TouchableOpacity>
            )}
          />
        )}
      </View>


    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 280,
    borderRightWidth: 1,
    paddingTop: 16,
    paddingHorizontal: 12,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 8,
    marginBottom: 16,
  },
  brand: { fontSize: 20, fontWeight: "700" },
  newChat: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderRadius: 10,
    marginBottom: 12,
  },
  newChatText: { fontSize: 14, fontWeight: "600" },
  nav: { marginBottom: 4 },
  navItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 9,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 2,
  },
  navLabel: { fontSize: 14 },
  divider: { height: 1, marginVertical: 10 },
  recentsLabel: {
    fontSize: 11,
    letterSpacing: 0.8,
    paddingHorizontal: 12,
    marginBottom: 6,
    textTransform: "uppercase",
  },
  empty: { fontSize: 13, paddingHorizontal: 12, marginTop: 8 },
  chatRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  chatTitle: { fontSize: 13 },
  chatDate: { fontSize: 11, marginTop: 2 },
  profile: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderTopWidth: 1,
  },
  avatar: { width: 34, height: 34, borderRadius: 17 },
  avatarFallback: {
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: { fontSize: 14, fontWeight: "600" },
  profileName: { fontSize: 13, fontWeight: "500" },
  profileSub: { fontSize: 11 },
});
