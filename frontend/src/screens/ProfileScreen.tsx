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
import { deleteAccount, getProfile, updateProfile } from "../services/api";

type Props = {
  onClose: () => void;
};

export default function ProfileScreen({ onClose }: Props) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

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

  // Permanent deletion: two confirmations so it can't happen by accident.
  const handleDeleteAccount = () => {
    Alert.alert(
      "Delete account",
      "This permanently deletes your account. Are you sure?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Continue",
          style: "destructive",
          onPress: confirmDeleteAccount,
        },
      ]
    );
  };

  const confirmDeleteAccount = () => {
    Alert.alert(
      "This can't be undone",
      "Your account will be permanently deleted and you'll be signed out. Delete forever?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete forever",
          style: "destructive",
          onPress: doDeleteAccount,
        },
      ]
    );
  };

  const doDeleteAccount = async () => {
    setDeleting(true);
    try {
      await deleteAccount();
      // Sign out locally; App will drop back to the auth screen.
      await supabase.auth.signOut();
    } catch (e) {
      console.warn(e);
      Alert.alert("Error", "Could not delete your account. Please try again.");
      setDeleting(false);
    }
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

      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <Text style={styles.logoutText}>Log out</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.deleteBtn}
        onPress={handleDeleteAccount}
        disabled={deleting}
      >
        {deleting ? (
          <ActivityIndicator color="#ef4444" />
        ) : (
          <Text style={styles.deleteText}>Delete account</Text>
        )}
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
  logoutBtn: { borderRadius: 12, padding: 16, alignItems: "center", marginTop: 14 },
  logoutText: { color: "#ef4444", fontSize: 16, fontWeight: "600" },
  deleteBtn: {
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    marginTop: 4,
    borderWidth: 1,
    borderColor: "#ef4444",
  },
  deleteText: { color: "#ef4444", fontSize: 15, fontWeight: "700" },
});
