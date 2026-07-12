import { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { Session } from "@supabase/supabase-js";
import { supabase } from "./src/services/supabase";
import AuthScreen from "./src/screens/AuthScreen";
import ChatsListScreen from "./src/screens/ChatsListScreen";
import ChatScreen from "./src/screens/ChatScreen";
import ProfileScreen from "./src/screens/ProfileScreen";

type View3 =
  | { name: "list" }
  | { name: "chat"; sessionId: string | null }
  | { name: "profile" };

export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(false);
  const [view, setView] = useState<View3>({ name: "list" });

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setReady(true);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      setSession(s);
      setView({ name: "list" });
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
    return (
      <ProfileScreen
        onClose={() => setView({ name: "list" })}
        onClearChat={() => setView({ name: "chat", sessionId: null })}
      />
    );
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
