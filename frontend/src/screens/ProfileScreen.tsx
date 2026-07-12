import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { supabase } from "../services/supabase";
import {
  deleteAccount,
  getProfile,
  updateProfile,
  uploadAvatar,
} from "../services/api";
import { useTheme, ThemeMode } from "../context/ThemeContext";

type Props = {
  onClose: () => void;
};

export default function ProfileScreen({ onClose }: Props) {
  const { theme, mode, setMode } = useTheme();
  const [name, setName] = useState("");
  const [savedName, setSavedName] = useState("");
  const [email, setEmail] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [deleteStep, setDeleteStep] = useState(0);
  const [pickerOpen, setPickerOpen] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await supabase.auth.getUser();
        setEmail(data.user?.email ?? "");
        const profile = await getProfile();
        const n = profile.display_name ?? "";
        setName(n);
        setSavedName(n);
        setAvatarUrl(profile.avatar_url ?? null);
      } catch (e) {
        console.warn(e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const initial = (name.trim()[0] || email.trim()[0] || "?").toUpperCase();
  const nameChanged = name.trim() !== savedName.trim() && name.trim().length > 0;

  const handleSave = async () => {
    if (!nameChanged) return;
    setSaving(true);
    try {
      await updateProfile(name.trim());
      setSavedName(name.trim());
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

  const doDeleteAccount = async () => {
    setDeleting(true);
    try {
      await deleteAccount();
      await supabase.auth.signOut();
    } catch (e) {
      console.warn(e);
      setDeleteStep(0);
      Alert.alert("Error", "Could not delete your account. Please try again.");
      setDeleting(false);
    }
  };

  const processResult = async (result: ImagePicker.ImagePickerResult) => {
    if (result.canceled || !result.assets?.[0]?.uri) return;
    setUploading(true);
    try {
      const url = await uploadAvatar(result.assets[0].uri);
      setAvatarUrl(url);
    } catch (e: any) {
      Alert.alert("Upload failed", e?.message ?? "Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const takePhoto = async () => {
    setPickerOpen(false);
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) {
      Alert.alert("Camera permission needed", "Enable camera access to take a photo.");
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.6,
    });
    await processResult(result);
  };

  const pickFromGallery = async () => {
    setPickerOpen(false);
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert("Gallery permission needed", "Enable photo access to choose an image.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.6,
    });
    await processResult(result);
  };

  const THEME_OPTIONS: { key: ThemeMode; label: string }[] = [
    { key: "dark", label: "Dark" },
    { key: "light", label: "Light" },
    { key: "system", label: "System" },
  ];

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: theme.background }]}>
        <ActivityIndicator color={theme.accent} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onClose}>
          <Text style={[styles.back, { color: theme.accent }]}>‹ Back</Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.textPrimary }]}>Profile</Text>
        <View style={{ width: 50 }} />
      </View>

      <View style={styles.avatarWrap}>
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => setPickerOpen(true)}
          disabled={uploading}
        >
          <View style={[styles.avatar, { backgroundColor: theme.accent }]}>
            {avatarUrl ? (
              <Image
                source={{ uri: avatarUrl }}
                style={styles.avatarImg}
                resizeMode="cover"
              />
            ) : (
              <Text style={[styles.avatarText, { color: theme.accentText }]}>
                {initial}
              </Text>
            )}
            {uploading && (
              <View style={styles.avatarOverlay}>
                <ActivityIndicator color="#fff" />
              </View>
            )}
          </View>
          <View
            style={[
              styles.cameraBadge,
              { backgroundColor: theme.surface, borderColor: theme.background },
            ]}
          >
            <Text style={styles.cameraIcon}>📷</Text>
          </View>
        </TouchableOpacity>
        <Text style={[styles.avatarHint, { color: theme.textSecondary }]}>
          Tap to change photo
        </Text>
      </View>

      <Text style={[styles.label, { color: theme.textSecondary }]}>
        Display name
      </Text>
      <TextInput
        style={[
          styles.input,
          { backgroundColor: theme.surface, color: theme.textPrimary },
        ]}
        value={name}
        onChangeText={setName}
        placeholder="What should I call you?"
        placeholderTextColor={theme.textSecondary}
      />

      <Text style={[styles.label, { color: theme.textSecondary }]}>Email</Text>
      <Text style={[styles.readonly, { color: theme.textPrimary }]}>{email}</Text>

      <Text style={[styles.label, { color: theme.textSecondary }]}>Appearance</Text>
      <View
        style={[
          styles.segment,
          { backgroundColor: theme.surface, borderColor: theme.border },
        ]}
      >
        {THEME_OPTIONS.map((opt) => {
          const active = mode === opt.key;
          return (
            <TouchableOpacity
              key={opt.key}
              style={[styles.segmentItem, active && { backgroundColor: theme.accent }]}
              onPress={() => setMode(opt.key)}
            >
              <Text
                style={[
                  styles.segmentText,
                  { color: active ? theme.accentText : theme.textSecondary },
                ]}
              >
                {opt.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <TouchableOpacity
        style={[
          styles.primaryBtn,
          { backgroundColor: nameChanged ? theme.accent : theme.surface },
        ]}
        onPress={handleSave}
        disabled={!nameChanged || saving}
      >
        <Text
          style={[
            styles.primaryText,
            { color: nameChanged ? theme.accentText : theme.textSecondary },
          ]}
        >
          {saving ? "Saving..." : "Save"}
        </Text>
      </TouchableOpacity>

      <View style={[styles.divider, { backgroundColor: theme.border }]} />
      <Text style={[styles.dangerZone, { color: theme.textSecondary }]}>
        DANGER ZONE
      </Text>

      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <Text style={[styles.logoutText, { color: theme.danger }]}>Log out</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.deleteBtn, { borderColor: theme.danger }]}
        onPress={() => setDeleteStep(1)}
        disabled={deleting}
      >
        {deleting ? (
          <ActivityIndicator color={theme.danger} />
        ) : (
          <Text style={[styles.deleteText, { color: theme.danger }]}>
            Delete my account
          </Text>
        )}
      </TouchableOpacity>
      <Text style={[styles.deleteHint, { color: theme.textSecondary }]}>
        Frees your email to sign up again. Your chat history stays stored per our
        privacy policy.
      </Text>

      {/* Camera / Gallery picker dialog */}
      <Modal
        visible={pickerOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setPickerOpen(false)}
      >
        <Pressable
          style={[styles.overlay, { backgroundColor: theme.overlay }]}
          onPress={() => setPickerOpen(false)}
        >
          <Pressable style={[styles.dialog, { backgroundColor: theme.surface }]}>
            <Text style={[styles.dialogTitle, { color: theme.textPrimary }]}>
              Change photo
            </Text>
            <TouchableOpacity
              style={[styles.pickItem, { backgroundColor: theme.accent }]}
              onPress={takePhoto}
            >
              <Text style={[styles.pickItemText, { color: theme.accentText }]}>
                📷  Take a photo
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.pickItem, { backgroundColor: theme.surfaceAlt }]}
              onPress={pickFromGallery}
            >
              <Text style={[styles.pickItemText, { color: theme.textPrimary }]}>
                🖼  Choose from gallery
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.pickCancel}
              onPress={() => setPickerOpen(false)}
            >
              <Text style={[styles.pickCancelText, { color: theme.textSecondary }]}>
                Cancel
              </Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Delete dialog */}
      <Modal
        visible={deleteStep > 0}
        transparent
        animationType="fade"
        onRequestClose={() => setDeleteStep(0)}
      >
        <Pressable
          style={[styles.overlay, { backgroundColor: theme.overlay }]}
          onPress={() => !deleting && setDeleteStep(0)}
        >
          <Pressable style={[styles.dialog, { backgroundColor: theme.surface }]}>
            <Text style={[styles.dialogTitle, { color: theme.textPrimary }]}>
              {deleteStep === 1 ? "Delete my account?" : "This can't be undone"}
            </Text>
            <Text style={[styles.dialogBody, { color: theme.textSecondary }]}>
              {deleteStep === 1
                ? "This permanently deletes your login and signs you out. Your email becomes free to sign up again. Your chat history stays stored per our privacy policy."
                : "Your login will be permanently removed and you'll be signed out. Delete forever?"}
            </Text>
            <View style={styles.dialogActions}>
              <TouchableOpacity
                style={[styles.dialogCancel, { borderColor: theme.border }]}
                onPress={() => setDeleteStep(0)}
                disabled={deleting}
              >
                <Text style={[styles.dialogCancelText, { color: theme.textPrimary }]}>
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.dialogConfirm, { backgroundColor: theme.danger }]}
                onPress={() =>
                  deleteStep === 1 ? setDeleteStep(2) : doDeleteAccount()
                }
                disabled={deleting}
              >
                {deleting ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.dialogConfirmText}>
                    {deleteStep === 1 ? "Continue" : "Delete forever"}
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
  container: { flex: 1, padding: 24, paddingTop: 60 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  back: { fontSize: 17 },
  title: { fontSize: 20, fontWeight: "700" },

  avatarWrap: { alignItems: "center", marginBottom: 8 },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  avatarImg: { width: 88, height: 88, borderRadius: 44 },
  avatarText: { fontSize: 36, fontWeight: "700" },
  avatarOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 44,
  },
  cameraBadge: {
    position: "absolute",
    right: -2,
    bottom: -2,
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 2,
    justifyContent: "center",
    alignItems: "center",
  },
  cameraIcon: { fontSize: 14 },
  avatarHint: { fontSize: 13, marginTop: 10 },

  label: { fontSize: 13, marginBottom: 8, marginTop: 16 },
  input: { borderRadius: 12, padding: 14, fontSize: 16 },
  readonly: { fontSize: 16, paddingVertical: 4 },

  segment: {
    flexDirection: "row",
    borderRadius: 12,
    borderWidth: 1,
    padding: 4,
    marginTop: 4,
  },
  segmentItem: { flex: 1, paddingVertical: 10, borderRadius: 9, alignItems: "center" },
  segmentText: { fontSize: 14, fontWeight: "600" },

  primaryBtn: { borderRadius: 12, padding: 16, alignItems: "center", marginTop: 24 },
  primaryText: { fontSize: 16, fontWeight: "700" },

  divider: { height: 1, marginTop: 28, marginBottom: 16 },
  dangerZone: { fontSize: 12, letterSpacing: 1, marginBottom: 8 },

  logoutBtn: { borderRadius: 12, padding: 14, alignItems: "center" },
  logoutText: { fontSize: 16, fontWeight: "600" },
  deleteBtn: {
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    marginTop: 8,
    borderWidth: 1,
  },
  deleteText: { fontSize: 15, fontWeight: "700" },
  deleteHint: { fontSize: 12, textAlign: "center", marginTop: 8, paddingHorizontal: 10 },

  overlay: { flex: 1, justifyContent: "center", padding: 28 },
  dialog: { borderRadius: 18, padding: 22 },
  dialogTitle: { fontSize: 18, fontWeight: "700", marginBottom: 14 },
  dialogBody: { fontSize: 14, lineHeight: 20, marginBottom: 20 },
  dialogActions: { flexDirection: "row", justifyContent: "flex-end" },
  dialogCancel: {
    borderRadius: 12,
    paddingVertical: 11,
    paddingHorizontal: 20,
    borderWidth: 1,
    marginRight: 10,
  },
  dialogCancelText: { fontSize: 15, fontWeight: "600" },
  dialogConfirm: {
    borderRadius: 12,
    paddingVertical: 11,
    paddingHorizontal: 20,
    minWidth: 120,
    alignItems: "center",
  },
  dialogConfirmText: { color: "#fff", fontSize: 15, fontWeight: "700" },

  pickItem: {
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 18,
    marginBottom: 10,
  },
  pickItemText: { fontSize: 16, fontWeight: "600", textAlign: "center" },
  pickCancel: { paddingVertical: 12, alignItems: "center", marginTop: 2 },
  pickCancelText: { fontSize: 15, fontWeight: "600" },
});