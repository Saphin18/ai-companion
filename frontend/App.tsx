import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  AppState,
  AppStateStatus,
  BackHandler,
  StatusBar,
  View,
} from "react-native";
import { Session } from "@supabase/supabase-js";
import { supabase } from "./src/services/supabase";
import { getProfile, updateProfile } from "./src/services/api";
import { ThemeProvider, useTheme } from "./src/context/ThemeContext";
import {
  isBiometricAvailable,
  isBiometricEnabled,
  getBiometricSetting,
  setBiometricEnabled,
} from "./src/services/biometrics";
import AuthScreen from "./src/screens/AuthScreen";
import LockScreen from "./src/screens/LockScreen";
import ChatsListScreen from "./src/screens/ChatsListScreen";
import ChatScreen from "./src/screens/ChatScreen";
import ProfileScreen from "./src/screens/ProfileScreen";
import JournalScreen from "./src/screens/JournalScreen";

type View3 =
  | { name: "list" }
  | { name: "chat"; sessionId: string | null }
  | { name: "profile" }
  | { name: "journal" };

// On login: adopt the server's theme (if this device has none saved), and
// copy the signup name into the profile if it's still missing.
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

// After a fresh password login, offer to turn on biometric quick-unlock —
// but only once (never asked before) and only on capable devices.
async function maybeOfferBiometric() {
  try {
    const available = await isBiometricAvailable();
    if (!available) return;
    const setting = await getBiometricSetting();
    if (setting !== null) return; // already decided
    Alert.alert(
      "Enable quick unlock?",
      "Use your fingerprint or face to unlock Saphin AI next time, instead of typing your password.",
      [
        { text: "Not now", style: "cancel", onPress: () => setBiometricEnabled(false) },
        { text: "Enable", onPress: () => setBiometricEnabled(true) },
      ]
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
        try {
          const [enabled, available] = await Promise.all([
            isBiometricEnabled(),
            isBiometricAvailable(),
          ]);
          if (enabled && available) setLocked(true);
        } catch {
          // ignore — fall back to no lock
        }
      }
      setReady(true);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((event, s) => {
      setSession(s);
      setView({ name: "list" });
      if (s && event === "SIGNED_IN") {
        setLocked(false); // just logged in with password — already authenticated
        syncProfile(s, hydrateFromServer);
        maybeOfferBiometric();
      }
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  // Re-lock when the app returns from a true background (not the brief flicker
  // the biometric prompt itself causes — that's why we check prev === background).
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

  // Android hardware/gesture back: go to the Chats list from any sub-screen;
  // only exit the app when already on the list.
  useEffect(() => {
    const onBackPress = () => {
      if (
        view.name === "chat" ||
        view.name === "profile" ||
        view.name === "journal"
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
  } else if (view.name === "chat") {
    content = (
      <ChatScreen
        sessionId={view.sessionId}
        onBack={() => setView({ name: "list" })}
      />
    );
  } else {
    content = (
      <ChatsListScreen
        onOpenChat={(sessionId) => setView({ name: "chat", sessionId })}
        onOpenProfile={() => setView({ name: "profile" })}
        onOpenJournal={() => setView({ name: "journal" })}
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