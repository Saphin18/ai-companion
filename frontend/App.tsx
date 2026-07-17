import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  AppState,
  AppStateStatus,
  BackHandler,
  Platform,
  StatusBar,
  View,
} from "react-native";
import { Session } from "@supabase/supabase-js";
import * as Notifications from "expo-notifications";
import { supabase } from "./src/services/supabase";
import { getProfile, updateProfile, registerPushToken } from "./src/services/api";
import {
  ensureAndroidChannel,
  requestPermission,
  getExpoPushToken,
} from "./src/services/notifications";
import { ThemeProvider, useTheme } from "./src/context/ThemeContext";
import {
  isBiometricAvailable,
  isBiometricEnabled,
} from "./src/services/biometrics";
import AuthScreen from "./src/screens/AuthScreen";
import LockScreen from "./src/screens/LockScreen";
import ChatsListScreen from "./src/screens/ChatsListScreen";
import ChatScreen from "./src/screens/ChatScreen";
import ProfileScreen from "./src/screens/ProfileScreen";
import JournalScreen from "./src/screens/JournalScreen";
import RemindersScreen from "./src/screens/RemindersScreen";
import GoalsScreen from "./src/screens/GoalsScreen";
import AboutScreen from "./src/screens/AboutScreen";

type View3 =
  | { name: "list" }
  | { name: "chat"; sessionId: string | null; initialMessage?: string | null }
  | { name: "profile" }
  | { name: "journal" }
  | { name: "reminders" }
  | { name: "goals" }
  | { name: "about" };

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
  try {
    const available = await isBiometricAvailable();
    if (!available) return;
    const enabled = await isBiometricEnabled();
    if (enabled) return;
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

  const appState = useRef<AppStateStatus>(AppState.currentState);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data }) => {
      setSession(data.session);
      if (data.session) {
        syncProfile(data.session, hydrateFromServer);
        syncPushToken();
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
      setReady(true);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((event, s) => {
      setSession(s);
      setView({ name: "list" });
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
    const sub = Notifications.addNotificationResponseReceivedListener((resp) => {
      const type = resp.notification.request.content.data?.type;
      if (type === "checkin") {
        setView({ name: "chat", sessionId: null });
      }
    });
    return () => sub.remove();
  }, []);

  useEffect(() => {
    const sub = AppState.addEventListener("change", async (next) => {
      const prev = appState.current;
      appState.current = next;
      if (prev === "background" && next === "active") {
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
    const onBackPress = () => {
      if (
        view.name === "chat" ||
        view.name === "profile" ||
        view.name === "journal" ||
        view.name === "reminders" ||
        view.name === "goals" ||
        view.name === "about"
      ) {
        setView({ name: "list" });
        return true;
      }
      return false;
    };
    const sub = BackHandler.addEventListener("hardwareBackPress", onBackPress);
    return () => sub.remove();
  }, [view]);

  const bar = (
    <StatusBar barStyle={theme.isDark ? "light-content" : "dark-content"} />
  );

  if (!ready) {
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
    return (
      <>
        {bar}
        <AuthScreen />
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
  } else if (view.name === "chat") {
    content = (
      <ChatScreen
        sessionId={view.sessionId}
        initialMessage={view.initialMessage ?? null}
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
        onOpenProfile={() => setView({ name: "profile" })}
        onOpenJournal={() => setView({ name: "journal" })}
        onOpenReminders={() => setView({ name: "reminders" })}
        onOpenGoals={() => setView({ name: "goals" })}
        onOpenAbout={() => setView({ name: "about" })}
      />
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
