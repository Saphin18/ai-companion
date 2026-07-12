import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { supabase } from "../services/supabase";
import { getProfile, updateProfile } from "../services/api";

type Props = {
  onClose: () => void;
  onClearChat: () => void;
};

export default function ProfileScreen({ onClose, onClearChat }: Props) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await supabase.auth.getUser();
        setEmail(data.user?.email ?? "");
        const profile = await getProfile();
        setName(profile.display_name ?? "");
      } catch (e) {
        console.warn(e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateProfile(name.trim());
      Alert.alert("Saved", "Your name has been updated.");
    } catch (e) {
      Alert.alert("Error", "Could not save your name.");
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const handleClearChat = () => {
    Alert.alert(
      "Clear chat view",
      "This clears the conversation from this screen. Your account stays logged in.",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Clear", style: "destructive", onPress: onClearChat },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color="#7c6cf0" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onClose}>
          <Text style={styles.back}>‹ Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Profile</Text>
        <View style={{ width: 50 }} />
      </View>

      <Text style={styles.label}>Display name</Text>
      <TextInput
        style={styles.input}
        value={name}
        onChangeText={setName}
        placeholder="What should I call you?"
        placeholderTextColor="#6b7280"
      />

      <Text style={styles.label}>Email</Text>
      <Text style={styles.readonly}>{email}</Text>

      <TouchableOpacity
        style={styles.primaryBtn}
        onPress={handleSave}
        disabled={saving}
      >
        <Text style={styles.primaryText}>
          {saving ? "Saving..." : "Save"}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.secondaryBtn} onPress={handleClearChat}>
        <Text style={styles.secondaryText}>Clear chat view</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <Text style={styles.logoutText}>Log out</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0f1419", padding: 24, paddingTop: 60 },
  center: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#0f1419" },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 32 },
  back: { color: "#7c6cf0", fontSize: 17 },
  title: { color: "#fff", fontSize: 20, fontWeight: "700" },
  label: { color: "#9ca3af", fontSize: 13, marginBottom: 8, marginTop: 16 },
  input: { backgroundColor: "#1a2230", color: "#fff", borderRadius: 12, padding: 14, fontSize: 16 },
  readonly: { color: "#e5e7eb", fontSize: 16, paddingVertical: 4 },
  primaryBtn: { backgroundColor: "#7c6cf0", borderRadius: 12, padding: 16, alignItems: "center", marginTop: 28 },
  primaryText: { color: "#fff", fontSize: 16, fontWeight: "700" },
  secondaryBtn: { borderColor: "#374151", borderWidth: 1, borderRadius: 12, padding: 16, alignItems: "center", marginTop: 14 },
  secondaryText: { color: "#e5e7eb", fontSize: 16, fontWeight: "600" },
  logoutBtn: { borderRadius: 12, padding: 16, alignItems: "center", marginTop: 14 },
  logoutText: { color: "#ef4444", fontSize: 16, fontWeight: "600" },
});
