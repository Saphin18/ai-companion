import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  BackHandler,
  Dimensions,
  FlatList,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
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
  onStartChatWithMessage: (text: string) => void;
  onStartChatWithAction: (action: "record" | "photo" | "document") => void;
  onOpenProfile: () => void;
  onOpenJournal: () => void;
  onOpenReminders: () => void;
  onOpenGoals: () => void;
  onOpenAbout: () => void;
};

const SCREEN_W = Dimensions.get("window").width;
const DRAWER_W = Math.min(320, SCREEN_W * 0.82);

function sortSessions(list: SessionSummary[]): SessionSummary[] {
  return [...list].sort((a, b) => {
    if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
    return b.updated_at.localeCompare(a.updated_at);
  });
}

export default function ChatsListScreen({
  onOpenChat,
  onStartChatWithMessage,
  onStartChatWithAction,
  onOpenProfile,
  onOpenJournal,
  onOpenReminders,
  onOpenGoals,
  onOpenAbout,
}: Props) {
  const { theme } = useTheme();
  const { width: windowWidth } = useWindowDimensions();
  const isDesktopWeb = Platform.OS === "web" && windowWidth >= 768;

  const [sessions, setSessions] = useState<SessionSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [initial, setInitial] = useState("?");
  const [displayName, setDisplayName] = useState("");

  const [draft, setDraft] = useState("");

  const [drawerOpen, setDrawerOpen] = useState(false);
  const slide = useRef(new Animated.Value(-DRAWER_W)).current;
  const fade = useRef(new Animated.Value(0)).current;

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
      try {
        const { data } = await supabase.auth.getUser();
        const profile = await getProfile();
        setAvatarUrl(profile.avatar_url ?? null);
        const name = (profile.display_name || data.user?.email || "").trim();
        setDisplayName(name || "friend");
        setInitial((name[0] || "?").toUpperCase());
      } catch (e) {
        console.warn(e);
      }
    })();
  }, []);

  const openDrawer = () => {
    setDrawerOpen(true);
    Animated.parallel([
      Animated.timing(slide, { toValue: 0, duration: 220, useNativeDriver: true }),
      Animated.timing(fade, { toValue: 1, duration: 220, useNativeDriver: true }),
    ]).start();
  };

  const closeDrawer = (after?: () => void) => {
    Animated.parallel([
      Animated.timing(slide, {
        toValue: -DRAWER_W,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(fade, { toValue: 0, duration: 200, useNativeDriver: true }),
    ]).start(() => {
      setDrawerOpen(false);
      if (after) after();
    });
  };

  useEffect(() => {
    const onBack = () => {
      if (drawerOpen) {
        closeDrawer();
        return true;
      }
      return false;
    };
    const sub = BackHandler.addEventListener("hardwareBackPress", onBack);
    return () => sub.remove();
  }, [drawerOpen]);

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  };

  const sendDraft = () => {
    const t = draft.trim();
    if (!t) return;
    Keyboard.dismiss();
    setDraft("");
    onStartChatWithMessage(t);
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

  const drawerItem = (label: string, onPress: () => void) => (
    <TouchableOpacity
      style={styles.drawerItem}
      onPress={() => closeDrawer(onPress)}
    >
      <Text style={[styles.drawerItemText, { color: theme.textPrimary }]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  const homeBody = (
    <View style={{ flex: 1 }}>
      <View style={styles.header}>
        {!isDesktopWeb ? (<TouchableOpacity onPress={openDrawer} hitSlop={12}>
          <Text style={[styles.menuIcon, { color: theme.textPrimary }]}>{"\u2261"}</Text>
        </TouchableOpacity>) : (<View />)}
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

      <View style={styles.greetWrap}>
        <Text style={[styles.greetHi, { color: theme.textPrimary }]}>
          Hey {displayName.split(" ")[0]},
        </Text>
        <Text style={[styles.greetSub, { color: theme.textSecondary }]}>
          how are you feeling today?
        </Text>
      </View>

      <View
        style={[
          styles.inputBar,
          { backgroundColor: theme.surface, borderColor: theme.border },
        ]}
      >
        <TouchableOpacity
          onPress={() => {
            if (Platform.OS === "web" && typeof window !== "undefined") {
              const photo = window.confirm("Attach a photo?\n\nOK = Photo\nCancel = Document");
              onStartChatWithAction(photo ? "photo" : "document");
            } else {
              Alert.alert("Attach", "What would you like to send?", [
                { text: "Photo", onPress: () => onStartChatWithAction("photo") },
                { text: "Document", onPress: () => onStartChatWithAction("document") },
                { text: "Cancel", style: "cancel" },
              ]);
            }
          }}
          style={styles.homeIconBtn}
        >
          <Ionicons name="add-circle-outline" size={24} color={theme.textSecondary} />
        </TouchableOpacity>
        <TextInput
          style={[styles.input, { color: theme.textPrimary }]}
          value={draft}
          onChangeText={setDraft}
          placeholder="Chat with Saphin..."
          placeholderTextColor={theme.textSecondary}
          multiline
          returnKeyType="send"
          onSubmitEditing={sendDraft}
          blurOnSubmit
        />
        {draft.trim() ? (
          <TouchableOpacity
            onPress={sendDraft}
            style={[
              styles.sendBtn,
              { backgroundColor: theme.accent },
            ]}
          >
            <Ionicons name="arrow-up" size={20} color={theme.accentText} />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            onPress={() => onStartChatWithAction("record")}
            style={[
              styles.sendBtn,
              { backgroundColor: theme.surfaceAlt },
            ]}
          >
            <Ionicons name="mic" size={20} color={theme.textSecondary} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {Platform.OS === "ios" ? (
        <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding">
          {homeBody}
        </KeyboardAvoidingView>
      ) : (
        homeBody
      )}

      {/* ===== Drawer ===== */}
      {!isDesktopWeb && drawerOpen && (
        <View style={StyleSheet.absoluteFill}>
          <Animated.View
            style={[styles.backdrop, { opacity: fade }]}
          >
            <Pressable style={{ flex: 1 }} onPress={() => closeDrawer()} />
          </Animated.View>

          <Animated.View
            style={[
              styles.drawer,
              {
                width: DRAWER_W,
                backgroundColor: theme.surface,
                transform: [{ translateX: slide }],
              },
            ]}
          >
            <Text style={[styles.drawerBrand, { color: theme.textPrimary }]}>
              Saphin AI
            </Text>

            <TouchableOpacity
              style={styles.drawerItem}
              onPress={() => closeDrawer(() => onOpenChat(null))}
            >
              <Text style={[styles.drawerItemText, { color: theme.accent, fontWeight: "700" }]}>
                {"\uFF0B"}  New chat
              </Text>
            </TouchableOpacity>

            <View style={[styles.drawerDivider, { backgroundColor: theme.border }]} />

            {drawerItem("\uD83D\uDCD6  Journal", onOpenJournal)}
            {drawerItem("\u23F0  Reminders", onOpenReminders)}
            {drawerItem("\uD83C\uDFAF  Goals", onOpenGoals)}
            {drawerItem("\u2139\uFE0F  About", onOpenAbout)}

            <View style={[styles.drawerDivider, { backgroundColor: theme.border }]} />
            <Text style={[styles.recentsLabel, { color: theme.textSecondary }]}>
              Recents
            </Text>

            {loading ? (
              <ActivityIndicator color={theme.accent} style={{ marginTop: 20 }} />
            ) : sessions.length === 0 ? (
              <Text style={[styles.emptyDrawer, { color: theme.textSecondary }]}>
                No chats yet.
              </Text>
            ) : (
              <FlatList
                data={sessions}
                keyExtractor={(item) => item.id}
                contentContainerStyle={{ paddingBottom: 20 }}
                keyboardShouldPersistTaps="handled"
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.recentRow}
                    onPress={() => closeDrawer(() => onOpenChat(item.id))}
                    onLongPress={() => setMenuFor(item)}
                    delayLongPress={250}
                  >
                    {item.pinned && <Text style={styles.pin}>{"\uD83D\uDCCC"}</Text>}
                    <Text
                      style={[styles.recentTitle, { color: theme.textPrimary }]}
                      numberOfLines={1}
                    >
                      {item.title || "New chat"}
                    </Text>
                    <Text style={[styles.recentDate, { color: theme.textSecondary }]}>
                      {formatDate(item.updated_at)}
                    </Text>
                  </TouchableOpacity>
                )}
              />
            )}
          </Animated.View>
        </View>
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
                {menuFor?.pinned ? "\uD83D\uDCCC  Unpin" : "\uD83D\uDCCC  Pin"}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.sheetItem}
              onPress={() => menuFor && openRename(menuFor)}
            >
              <Text style={[styles.sheetText, { color: theme.textPrimary }]}>
                {"\u270F\uFE0F"}  Rename
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.sheetItem}
              onPress={() => menuFor && handleRemove(menuFor)}
            >
              <Text style={[styles.sheetText, { color: theme.danger }]}>
                {"\uD83D\uDDD1"}  Remove from list
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
  menuIcon: { fontSize: 30, fontWeight: "400" },
  headerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  headerAvatarText: { fontSize: 18, fontWeight: "700" },
  headerAvatarImg: { width: 40, height: 40, borderRadius: 20 },

  greetWrap: { flex: 1, justifyContent: "center", alignItems: "center", paddingHorizontal: 24 },
  greetHi: { fontSize: 26, fontWeight: "700", textAlign: "center" },
  greetSub: { fontSize: 17, marginTop: 6, textAlign: "center" },

  inputBar: {
    flexDirection: "row",
    alignItems: "flex-end",
    marginHorizontal: 16,
    marginBottom: 18,
    borderWidth: 1,
    borderRadius: 24,
    paddingLeft: 6,
    paddingRight: 6,
    paddingVertical: 6,
  },
  homeIconBtn: {
    width: 38,
    height: 38,
    justifyContent: "center",
    alignItems: "center",
  },
  input: { flex: 1, fontSize: 16, maxHeight: 120, paddingVertical: 8 },
  sendBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 4,
    marginBottom: 2,
  },

  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.45)" },
  drawer: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    paddingTop: 56,
    paddingHorizontal: 14,
  },
  drawerBrand: { fontSize: 22, fontWeight: "700", marginBottom: 14, paddingHorizontal: 6 },
  drawerItem: { paddingVertical: 12, paddingHorizontal: 6 },
  drawerItemText: { fontSize: 16 },
  drawerDivider: { height: 1, marginVertical: 8 },
  recentsLabel: { fontSize: 12, letterSpacing: 1, paddingHorizontal: 6, marginBottom: 6 },
  emptyDrawer: { fontSize: 14, paddingHorizontal: 6, marginTop: 10 },
  recentRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 6,
  },
  pin: { fontSize: 12, marginRight: 6 },
  recentTitle: { fontSize: 15, flex: 1, marginRight: 8 },
  recentDate: { fontSize: 12 },

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

