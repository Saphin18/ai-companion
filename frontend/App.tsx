import { useEffect, useState } from "react";
import { ActivityIndicator, BackHandler, StatusBar, View } from "react-native";
import { Session } from "@supabase/supabase-js";
import { supabase } from "./src/services/supabase";
import { getProfile, updateProfile } from "./src/services/api";
import { ThemeProvider, useTheme } from "./src/context/ThemeContext";
import AuthScreen from "./src/screens/AuthScreen";
import ChatsListScreen from "./src/screens/ChatsListScreen";
import ChatScreen from "./src/screens/ChatScreen";
import ProfileScreen from "./src/screens/ProfileScreen";

type View3 =
  | { name: "list" }
  | { name: "chat"; sessionId: string | null }
  | { name: "profile" };

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

function Root() {
  const { theme, hydrateFromServer } = useTheme();
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(false);
  const [view, setView] = useState<View3>({ name: "list" });

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setReady(true);
      if (data.session) syncProfile(data.session, hydrateFromServer);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((event, s) => {
      setSession(s);
      setView({ name: "list" });
      if (s && event === "SIGNED_IN") syncProfile(s, hydrateFromServer);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  // Android hardware/gesture back: go to the Chats list from any sub-screen;
  // only exit the app when already on the list.
  useEffect(() => {
    const onBackPress = () => {
      if (view.name === "chat" || view.name === "profile") {
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

  let content;
  if (view.name === "profile") {
    content = <ProfileScreen onClose={() => setView({ name: "list" })} />;
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