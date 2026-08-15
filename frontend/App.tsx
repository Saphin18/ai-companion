import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  AppState,
  AppStateStatus,
  BackHandler,
  Platform,
  StatusBar,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import { Session } from "@supabase/supabase-js";
import { Ionicons } from "@expo/vector-icons";
import * as Font from "expo-font";
import * as Notifications from "expo-notifications";
import { supabase } from "./src/services/supabase";
import { getProfile, updateProfile, registerPushToken } from "./src/services/api";
import {
  ensureAndroidChannel,
  requestPermission,
  getExpoPushToken,
} from "./src/services/notifications";
import { ThemeProvider, useTheme } from "./src/context/ThemeContext";
import { pickerLock } from "./src/services/pickerLock";
import {
  isBiometricAvailable,
  isBiometricEnabled,
} from "./src/services/biometrics";
import LandingScreen from "./src/screens/LandingScreen";
import AuthScreen from "./src/screens/AuthScreen";
import LockScreen from "./src/screens/LockScreen";
import ChatsListScreen from "./src/screens/ChatsListScreen";
import ChatScreen from "./src/screens/ChatScreen";
import ProfileScreen from "./src/screens/ProfileScreen";
import JournalScreen from "./src/screens/JournalScreen";
import RemindersScreen from "./src/screens/RemindersScreen";
import GoalsScreen from "./src/screens/GoalsScreen";
import AboutScreen from "./src/screens/AboutScreen";
import WallpaperPickerScreen from "./src/screens/WallpaperPickerScreen";
import WebSidebar from "./src/components/WebSidebar";

type View3 =
  | { name: "list" }
  | { name: "chat"; sessionId: string | null; initialMessage?: string | null; initialAction?: "record" | "photo" | "document" | null }
  | { name: "profile" }
  | { name: "journal" }
  | { name: "reminders" }
  | { name: "goals" }
  | { name: "about" }
  | { name: "wallpaper" };

type AuthView = "landing" | "signup" | "login";

const IS_WEB = Platform.OS === "web";

// Load Ionicons font for web (fixes empty-square icons on Vercel deploy)
if (IS_WEB && typeof document !== "undefined") {
  const style = document.createElement("style");
  style.textContent = "@font-face { font-family: 'Ionicons'; src: url('/fonts/Ionicons.ttf') format('truetype'); }";
  document.head.appendChild(style);
}

async function syncProfile(
  session: Session,
  hydrateFromServer: (m?: any) => void
) {
  try {
    const profile = await getProfile();
    hydrateFromServer(profile.theme_preference);
    if (!profile.display_name) {
      const metaName = (
        session.user.user_metadata?.full_name as string | undefined
      )?.trim();
      if (metaName) await updateProfile(metaName);
    }
  } catch (e) {
    console.warn(e);
  }
}

async function syncPushToken() {
  if (IS_WEB) return;
  try {
    await ensureAndroidChannel();
    const granted = await requestPermission();
    if (!granted) return;
    const token = await getExpoPushToken();
    if (token) await registerPushToken(token, Platform.OS);
  } catch {
    // ignore
  }
}

async function maybeOfferBiometric() {
  if (IS_WEB) return;
  try {
    const AsyncStorage = (await import("@react-native-async-storage/async-storage")).default;
    const alreadyAsked = await AsyncStorage.getItem("biometric_prompt_shown");
    if (alreadyAsked) return;
    const available = await isBiometricAvailable();
    if (!available) return;
    const enabled = await isBiometricEnabled();
    if (enabled) return;
    await AsyncStorage.setItem("biometric_prompt_shown", "1");
    Alert.alert(
      "Enable quick unlock?",
      "You can turn on fingerprint or face unlock anytime in Profile, under Security.",
      [{ text: "OK" }]
    );
  } catch {
    // ignore
  }
}

function Root() {
  const { theme, hydrateFromServer } = useTheme();
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(false);
  const [locked, setLocked] = useState(false);
  const [view, setView] = useState<View3>({ name: "list" });
  const [authView, setAuthView] = useState<AuthView>("landing");

  const [webSidebarOpen, setWebSidebarOpen] = useState(true);
  const [webRefreshKey, setWebRefreshKey] = useState(0);
  const [fontsReady, setFontsReady] = useState(false);

  const { width: windowWidth } = useWindowDimensions();
  const isDesktopWeb = IS_WEB && windowWidth >= 768;

  const appState = useRef<AppStateStatus>(AppState.currentState);
  const backgroundedAt = useRef<number>(0);

  // --- Load Ionicons font for web (fixes empty-square icons on Vercel) ---
  useEffect(() => {
    Font.loadAsync(Ionicons.font)
      .then(() => setFontsReady(true))
      .catch(() => setFontsReady(true));
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data }) => {
      setSession(data.session);
      if (data.session) {
        syncProfile(data.session, hydrateFromServer);
        syncPushToken();
        if (!IS_WEB) {
          try {
            const [enabled, available] = await Promise.all([
              isBiometricEnabled(),
              isBiometricAvailable(),
            ]);
            if (enabled && available) setLocked(true);
          } catch {
            // ignore
          }
        }
      }
      setReady(true);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((event, s) => {
      setSession(s);
      setView({ name: "list" });
      if (!s) {
        // Reset to landing page on sign out
        setAuthView("landing");
      }
      if (s && event === "SIGNED_IN") {
        setLocked(false);
        syncProfile(s, hydrateFromServer);
        syncPushToken();
        maybeOfferBiometric();
      }
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (IS_WEB) return;
    const sub = Notifications.addNotificationResponseReceivedListener((resp) => {
      const type = resp.notification.request.content.data?.type;
      if (type === "checkin") {
        setView({ name: "chat", sessionId: null });
      }
    });
    return () => sub.remove();
  }, []);

  useEffect(() => {
    if (IS_WEB) return;
    const sub = AppState.addEventListener("change", async (next) => {
      const prev = appState.current;
      appState.current = next;
      if (next.match(/inactive|background/)) {
        backgroundedAt.current = Date.now();
      }
      if (prev.match(/inactive|background/) && next === "active") {
        const awayMs = Date.now() - backgroundedAt.current;
        if (awayMs < 4000) return;
        if (pickerLock.active) return;
        if (session) {
          try {
            const [enabled, available] = await Promise.all([
              isBiometricEnabled(),
              isBiometricAvailable(),
            ]);
            if (enabled && available) setLocked(true);
          } catch {
            // ignore
          }
        }
      }
    });
    return () => sub.remove();
  }, [session]);

  useEffect(() => {
    if (IS_WEB) return;
    const onBackPress = () => {
      // Handle back from auth screens to landing
      if (!session && authView !== "landing") {
        setAuthView("landing");
        return true;
      }
      if (
        view.name === "chat" ||
        view.name === "profile" ||
        view.name === "journal" ||
        view.name === "reminders" ||
        view.name === "goals" ||
        view.name === "about" ||
        view.name === "wallpaper"
      ) {
        setView({ name: "list" });
        return true;
      }
      return false;
    };
    const sub = BackHandler.addEventListener("hardwareBackPress", onBackPress);
    return () => sub.remove();
  }, [view, session, authView]);

  useEffect(() => {
    if (IS_WEB && view.name === "list") {
      setWebRefreshKey((k) => k + 1);
    }
  }, [view.name]);

  const bar = (
    <StatusBar barStyle={theme.isDark ? "light-content" : "dark-content"} />
  );

  if (!ready || !fontsReady) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: theme.background,
        }}
      >
        {bar}
        <ActivityIndicator color={theme.accent} />
      </View>
    );
  }

  if (!session) {
    // --- Landing page / Auth flow ---
    if (authView === "landing") {
      if (isDesktopWeb) {
        return (
          <>
            {bar}
            <LandingScreen
              onGetStarted={() => setAuthView("signup")}
              onLogin={() => setAuthView("login")}
            />
          </>
        );
      }
      return (
        <>
          {bar}
          <LandingScreen
            onGetStarted={() => setAuthView("signup")}
            onLogin={() => setAuthView("login")}
          />
        </>
      );
    }

    // Sign up or login screen
    if (isDesktopWeb) {
      return (
        <>
          {bar}
          <AuthScreen
            initialSignUp={authView === "signup"}
            onBack={() => setAuthView("landing")}
          />
        </>
      );
    }
    return (
      <>
        {bar}
        <AuthScreen
          initialSignUp={authView === "signup"}
          onBack={() => setAuthView("landing")}
        />
      </>
    );
  }

  if (locked) {
    return (
      <>
        {bar}
        <LockScreen
          onUnlock={() => setLocked(false)}
          onUsePassword={() => {
            setLocked(false);
            supabase.auth.signOut();
          }}
        />
      </>
    );
  }

  let content;
  if (view.name === "profile") {
    content = <ProfileScreen onClose={() => setView({ name: "list" })} />;
  } else if (view.name === "journal") {
    content = <JournalScreen onBack={() => setView({ name: "list" })} />;
  } else if (view.name === "reminders") {
    content = <RemindersScreen onBack={() => setView({ name: "list" })} />;
  } else if (view.name === "goals") {
    content = <GoalsScreen onBack={() => setView({ name: "list" })} />;
  } else if (view.name === "about") {
    content = <AboutScreen onBack={() => setView({ name: "list" })} />;
  } else if (view.name === "wallpaper") {
    content = <WallpaperPickerScreen onBack={() => setView({ name: "list" })} />;
  } else if (view.name === "chat") {
    content = (
      <ChatScreen
        sessionId={view.sessionId}
        initialMessage={view.initialMessage ?? null}
        initialAction={view.initialAction ?? null}
        onBack={() => setView({ name: "list" })}
      />
    );
  } else {
    content = (
      <ChatsListScreen
        onOpenChat={(sessionId) => setView({ name: "chat", sessionId })}
        onStartChatWithMessage={(text) =>
          setView({ name: "chat", sessionId: null, initialMessage: text })
        }
        onStartChatWithAction={(action) =>
          setView({ name: "chat", sessionId: null, initialAction: action })
        }
        onOpenProfile={() => setView({ name: "profile" })}
        onOpenJournal={() => setView({ name: "journal" })}
        onOpenReminders={() => setView({ name: "reminders" })}
        onOpenGoals={() => setView({ name: "goals" })}
        onOpenAbout={() => setView({ name: "about" })}
        onOpenWallpaper={() => setView({ name: "wallpaper" })}
      />
    );
  }

  if (isDesktopWeb) {
    return (
      <>
        {bar}
        <View style={{ flexDirection: "row", flex: 1, backgroundColor: "transparent" }}>
          {webSidebarOpen && (
            <WebSidebar
              onOpenChat={(id) => {
                setView(id ? { name: "chat", sessionId: id } : { name: "list" });
                setWebRefreshKey((k) => k + 1);
              }}
              onOpenProfile={() => setView({ name: "profile" })}
              onOpenJournal={() => setView({ name: "journal" })}
              onOpenReminders={() => setView({ name: "reminders" })}
              onOpenGoals={() => setView({ name: "goals" })}
              onOpenAbout={() => setView({ name: "about" })}
              onOpenWallpaper={() => setView({ name: "wallpaper" })}
              onCollapse={() => setWebSidebarOpen(false)}
              activeView={view.name}
              refreshKey={webRefreshKey}
            />
          )}
          <View style={{ flex: 1 }}>
            {!webSidebarOpen && (
              <TouchableOpacity
                onPress={() => setWebSidebarOpen(true)}
                style={{
                  position: "absolute",
                  top: 16,
                  left: 16,
                  zIndex: 10,
                  padding: 8,
                }}
              >
                <Ionicons name="menu" size={22} color={theme.textSecondary} />
              </TouchableOpacity>
            )}
            <View style={{ flex: 1, maxWidth: 720, width: "100%", alignSelf: "center" }}>
              {content}
            </View>
          </View>
        </View>
      </>
    );
  }

  return (
    <>
      {bar}
      {content}
    </>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <Root />
    </ThemeProvider>
  );
}
