import { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { Session } from "@supabase/supabase-js";
import { supabase } from "./src/services/supabase";
import { getProfile, updateProfile } from "./src/services/api";
import AuthScreen from "./src/screens/AuthScreen";
import ChatsListScreen from "./src/screens/ChatsListScreen";
import ChatScreen from "./src/screens/ChatScreen";
import ProfileScreen from "./src/screens/ProfileScreen";

type View3 =
  | { name: "list" }
  | { name: "chat"; sessionId: string | null }
  | { name: "profile" };

// The name is entered at signup, but there's no session yet (email confirmation
// is on), so it can't be saved then. It's stashed in the user's auth metadata
// instead; on the first real login we copy it into the profile if it's missing.
async function ensureProfileName(session: Session) {
  try {
    const profile = await getProfile();
    if (!profile.display_name) {
      const metaName = (
        session.user.user_metadata?.full_name as string | undefined
      )?.trim();
      if (metaName) {
        await updateProfile(metaName);
      }
    }
  } catch (e) {
    console.warn(e);
  }
}

export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(false);
  const [view, setView] = useState<View3>({ name: "list" });

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setReady(true);
      if (data.session) ensureProfileName(data.session);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((event, s) => {
      setSession(s);
      setView({ name: "list" });
      if (s && event === "SIGNED_IN") ensureProfileName(s);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  if (!ready) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#0f1419",
        }}
      >
        <ActivityIndicator color="#7c6cf0" />
      </View>
    );
  }

  if (!session) return <AuthScreen />;

  if (view.name === "profile") {
    return <ProfileScreen onClose={() => setView({ name: "list" })} />;
  }

  if (view.name === "chat") {
    return (
      <ChatScreen
        sessionId={view.sessionId}
        onBack={() => setView({ name: "list" })}
      />
    );
  }

  return (
    <ChatsListScreen
      onOpenChat={(sessionId) => setView({ name: "chat", sessionId })}
      onOpenProfile={() => setView({ name: "profile" })}
    />
  );
}
