// App.tsx — root entry point. Shows AuthScreen or ChatScreen based on session.

import { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, SafeAreaView, StyleSheet, View } from 'react-native';
import type { Session } from '@supabase/supabase-js';
import { supabase } from './src/services/supabase';
import AuthScreen from './src/screens/AuthScreen';
import ChatScreen from './src/screens/ChatScreen';

export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      {loading ? (
        <View style={styles.loading}>
          <ActivityIndicator size="large" color="#6366f1" />
        </View>
      ) : session ? (
        <ChatScreen />
      ) : (
        <AuthScreen />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
