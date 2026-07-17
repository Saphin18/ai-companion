import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Platform } from "react-native";
import * as ImagePicker from "expo-image-picker";
import DateTimePicker from "@react-native-community/datetimepicker";
import { supabase } from "../services/supabase";
import {
  deleteAccount,
  getProfile,
  updateProfile,
  updatePersonalityMode,
  uploadAvatar,
  getProfile as _getProfileUnused,
  updateCheckinSettings,
} from "../services/api";
import {
  requestPermission as reqNotifPermission,
  ensureAndroidChannel,
  getExpoPushToken,
} from "../services/notifications";
import { registerPushToken } from "../services/api";
import { useTheme, ThemeMode } from "../context/ThemeContext";
import { ThemePicker } from "../theme/components";
import {
  isBiometricAvailable,
  isBiometricEnabled,
  enableBiometric,
  disableBiometric,
  authenticateBiometric,
} from "../services/biometrics";

// Same reset page the login screen uses (backend-hosted).
const RESET_REDIRECT_URL =
  "https://saphin-ai-backend.onrender.com/reset-password";

const PERSONALITY_OPTIONS: { key: string; label: string; emoji: string }[] = [
  { key: "balanced", label: "Balanced", emoji: "🙂" },
  { key: "motivator", label: "Motivator", emoji: "💪" },
  { key: "humor", label: "Humor", emoji: "😄" },
  { key: "calm", label: "Calm", emoji: "🌿" },
];

type Props = {
  onClose: () => void;
};

export default function ProfileScreen({ onClose }: Props) {
  const { theme, mode, setMode } = useTheme();
  const [name, setName] = useState("");
  const [savedName, setSavedName] = useState("");
  const [email, setEmail] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [personalityMode, setPersonalityMode] = useState<string>("balanced");
  const [checkinEnabled, setCheckinEnabled] = useState(false);
  const [checkinTime, setCheckinTime] = useState(new Date());
  const [showCheckinPicker, setShowCheckinPicker] = useState(false);
  const [checkinBusy, setCheckinBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [deleteStep, setDeleteStep] = useState(0);
  const [pickerOpen, setPickerOpen] = useState(false);

  // Change-password dialog state
  const [pwOpen, setPwOpen] = useState(false);
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [changingPw, setChangingPw] = useState(false);
  const [sendingReset, setSendingReset] = useState(false);

  // Biometric state
  const [bioAvailable, setBioAvailable] = useState(false);
  const [bioEnabled, setBioEnabled] = useState(false);
  const [bioBusy, setBioBusy] = useState(false);
  const [bioDialogOpen, setBioDialogOpen] = useState(false);
  const [bioPw, setBioPw] = useState("");

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
        setPersonalityMode(profile.personality_mode ?? "balanced");
        setCheckinEnabled(profile.checkin_enabled ?? false);
        const _ct = new Date();
        _ct.setHours(profile.checkin_hour ?? 9, profile.checkin_minute ?? 0, 0, 0);
        setCheckinTime(_ct);
        const [available, enabled] = await Promise.all([
          isBiometricAvailable(),
          isBiometricEnabled(),
        ]);
        setBioAvailable(available);
        setBioEnabled(enabled);
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

  // Personality picker: save instantly on tap, roll back on failure.
  const handlePersonality = async (key: string) => {
    if (key === personalityMode) return;
    const prev = personalityMode;
    setPersonalityMode(key);
    try {
      await updatePersonalityMode(key);
    } catch {
      setPersonalityMode(prev);
      Alert.alert("Error", "Could not update the personality. Try again.");
    }
  };

  const persistCheckin = async (enabled: boolean, when: Date) => {
    setCheckinBusy(true);
    try {
      if (enabled) {
        const granted = await reqNotifPermission();
        if (!granted) {
          Alert.alert(
            "Notifications are off",
            "Turn on notifications for Saphin AI to receive daily check-ins."
          );
          setCheckinEnabled(false);
          setCheckinBusy(false);
          return;
        }
        await ensureAndroidChannel();
        const token = await getExpoPushToken();
        if (token) {
          try {
            await registerPushToken(token, Platform.OS);
          } catch {
            // best-effort
          }
        }
      }
      await updateCheckinSettings({
        checkin_enabled: enabled,
        checkin_hour: when.getHours(),
        checkin_minute: when.getMinutes(),
        checkin_tz_offset_minutes: new Date().getTimezoneOffset(),
      });
    } catch (e) {
      Alert.alert("Error", "Could not save your check-in setting.");
      setCheckinEnabled(!enabled);
    } finally {
      setCheckinBusy(false);
    }
  };

  const onToggleCheckin = async (value: boolean) => {
    setCheckinEnabled(value);
    await persistCheckin(value, checkinTime);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  // Biometric toggle: ON asks for password + fingerprint; OFF wipes stored creds.
  const onToggleBiometric = async (value: boolean) => {
    if (value) {
      setBioPw("");
      setBioDialogOpen(true);
    } else {
      setBioBusy(true);
      try {
        await disableBiometric();
        setBioEnabled(false);
        Alert.alert("Turned off", "Fingerprint login has been disabled.");
      } catch {
        Alert.alert("Error", "Could not turn off fingerprint login.");
      } finally {
        setBioBusy(false);
      }
    }
  };

  const confirmEnableBiometric = async () => {
    if (!bioPw) {
      Alert.alert("Password needed", "Enter your password to enable fingerprint login.");
      return;
    }
    setBioBusy(true);
    try {
      // 1) Verify the password is correct.
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: bioPw,
      });
      if (error) {
        Alert.alert("Wrong password", "That password is incorrect.");
        setBioBusy(false);
        return;
      }
      // 2) Confirm identity with a fingerprint scan before storing.
      const ok = await authenticateBiometric();
      if (!ok) {
        Alert.alert("Cancelled", "Fingerprint not confirmed. Nothing was saved.");
        setBioBusy(false);
        return;
      }
      // 3) Store credentials in the encrypted keystore.
      await enableBiometric(email.trim(), bioPw);
      setBioEnabled(true);
      setBioDialogOpen(false);
      setBioPw("");
      Alert.alert(
        "Fingerprint login on",
        "Next time, tap the fingerprint icon on the login screen to log in."
      );
    } catch (e: any) {
      Alert.alert("Error", e?.message ?? "Could not enable fingerprint login.");
    } finally {
      setBioBusy(false);
    }
  };

  const openPwDialog = () => {
    setCurrentPw("");
    setNewPw("");
    setConfirmPw("");
    setShowPw(false);
    setPwOpen(true);
  };

  const handleChangePassword = async () => {
    if (!currentPw || !newPw || !confirmPw) {
      Alert.alert("Missing info", "Please fill in all three password fields.");
      return;
    }
    if (newPw.length < 6) {
      Alert.alert("Weak password", "New password must be at least 6 characters.");
      return;
    }
    if (newPw !== confirmPw) {
      Alert.alert("Passwords don't match", "The new passwords don't match.");
      return;
    }
    if (newPw === currentPw) {
      Alert.alert(
        "Choose a different password",
        "Your new password must be different from your current one."
      );
      return;
    }
    setChangingPw(true);
    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: currentPw,
      });
      if (signInError) {
        Alert.alert(
          "Wrong current password",
          "Your current password is incorrect. If you've forgotten it, tap 'Forgot password?'."
        );
        setChangingPw(false);
        return;
      }
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPw,
      });
      if (updateError) throw updateError;

      // Keep fingerprint login working: refresh the stored password if enabled.
      try {
        if (await isBiometricEnabled()) {
          await enableBiometric(email.trim(), newPw);
        }
      } catch {
        // ignore
      }

      setPwOpen(false);
      Alert.alert("Password changed", "Your password has been updated.");
    } catch (e: any) {
      Alert.alert("Error", e?.message ?? "Could not change your password.");
    } finally {
      setChangingPw(false);
    }
  };

  const handleForgotFromProfile = async () => {
    if (!email.trim()) {
      Alert.alert("No email", "We couldn't find your account email.");
      return;
    }
    setSendingReset(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: RESET_REDIRECT_URL,
      });
      if (error) throw error;
      setPwOpen(false);
      Alert.alert(
        "Check your email",
        "We sent a link to reset your password to " + email.trim() + "."
      );
    } catch (e: any) {
      Alert.alert("Error", e?.message ?? "Could not send the reset email.");
    } finally {
      setSendingReset(false);
    }
  };

  const doDeleteAccount = async () => {
    setDeleting(true);
    try {
      // Wipe any stored biometric credentials on account deletion.
      try {
        await disableBiometric();
      } catch {
        // ignore
      }
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
    <View style={[styles.container, { backgroundColor: "transparent" }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onClose}>
          <Text style={[styles.back, { color: theme.accent }]}>‹ Back</Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.textPrimary }]}>Profile</Text>
        <View style={{ width: 50 }} />
      </View>

      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
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

        <Text style={[styles.label, { color: theme.textSecondary }]}>Theme</Text>
        <ThemePicker />

        <Text style={[styles.label, { color: theme.textSecondary }]}>
          Companion personality
        </Text>
        <View style={styles.personaWrap}>
          {PERSONALITY_OPTIONS.map((opt) => {
            const active = personalityMode === opt.key;
            return (
              <TouchableOpacity
                key={opt.key}
                style={[
                  styles.personaPill,
                  {
                    backgroundColor: active ? theme.accent : theme.surface,
                    borderColor: active ? theme.accent : theme.border,
                  },
                ]}
                onPress={() => handlePersonality(opt.key)}
              >
                <Text
                  style={[
                    styles.personaText,
                    { color: active ? theme.accentText : theme.textPrimary },
                  ]}
                >
                  {opt.emoji}  {opt.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
        <Text style={[styles.personaHint, { color: theme.textSecondary }]}>
          Changes how your companion talks. Your mood still gently adjusts the tone.
        </Text>

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
        <Text style={[styles.sectionLabel, { color: theme.textSecondary }]}>
          DAILY CHECK-IN
        </Text>

        <View
          style={[
            styles.bioRow,
            { backgroundColor: theme.surface, borderColor: theme.border },
          ]}
        >
          <View style={{ flex: 1 }}>
            <Text style={[styles.bioTitle, { color: theme.textPrimary }]}>
              Daily check-in
            </Text>
            <Text style={[styles.bioSub, { color: theme.textSecondary }]}>
              A gentle, fresh note from your companion once a day.
            </Text>
          </View>
          {checkinBusy ? (
            <ActivityIndicator color={theme.accent} />
          ) : (
            <Switch
              value={checkinEnabled}
              onValueChange={onToggleCheckin}
              trackColor={{ false: theme.border, true: theme.accent }}
              thumbColor="#fff"
            />
          )}
        </View>

        {checkinEnabled && (
          <TouchableOpacity
            style={[styles.secondaryBtn, { borderColor: theme.border, marginTop: 12 }]}
            onPress={() => setShowCheckinPicker(true)}
          >
            <Text style={[styles.secondaryText, { color: theme.textPrimary }]}>
              Time:{" "}
              {checkinTime.getHours().toString().padStart(2, "0")}:
              {checkinTime.getMinutes().toString().padStart(2, "0")}
            </Text>
          </TouchableOpacity>
        )}

        {showCheckinPicker && (
          <DateTimePicker
            value={checkinTime}
            mode="time"
            is24Hour={false}
            onChange={(_, d) => {
              setShowCheckinPicker(Platform.OS === "ios");
              if (d) {
                setCheckinTime(d);
                persistCheckin(checkinEnabled, d);
              }
            }}
          />
        )}

        <View style={[styles.divider, { backgroundColor: theme.border }]} />
        <Text style={[styles.sectionLabel, { color: theme.textSecondary }]}>
          SECURITY
        </Text>

        <TouchableOpacity
          style={[styles.secondaryBtn, { borderColor: theme.border }]}
          onPress={openPwDialog}
        >
          <Text style={[styles.secondaryText, { color: theme.textPrimary }]}>
            Change password
          </Text>
        </TouchableOpacity>

        {bioAvailable && (
          <View
            style={[
              styles.bioRow,
              { backgroundColor: theme.surface, borderColor: theme.border },
            ]}
          >
            <View style={{ flex: 1 }}>
              <Text style={[styles.bioTitle, { color: theme.textPrimary }]}>
                Fingerprint login
              </Text>
              <Text style={[styles.bioSub, { color: theme.textSecondary }]}>
                Use your fingerprint or face to log in.
              </Text>
            </View>
            {bioBusy ? (
              <ActivityIndicator color={theme.accent} />
            ) : (
              <Switch
                value={bioEnabled}
                onValueChange={onToggleBiometric}
                trackColor={{ false: theme.border, true: theme.accent }}
                thumbColor="#fff"
              />
            )}
          </View>
        )}

        <View style={[styles.divider, { backgroundColor: theme.border }]} />
        <Text style={[styles.sectionLabel, { color: theme.textSecondary }]}>
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
      </ScrollView>

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

      {/* Enable-biometric dialog */}
      <Modal
        visible={bioDialogOpen}
        transparent
        animationType="fade"
        onRequestClose={() => !bioBusy && setBioDialogOpen(false)}
      >
        <Pressable
          style={[styles.overlay, { backgroundColor: theme.overlay }]}
          onPress={() => !bioBusy && setBioDialogOpen(false)}
        >
          <Pressable style={[styles.dialog, { backgroundColor: theme.surface }]}>
            <Text style={[styles.dialogTitle, { color: theme.textPrimary }]}>
              Enable fingerprint login
            </Text>
            <Text style={[styles.dialogBody, { color: theme.textSecondary }]}>
              Enter your password to turn on fingerprint login. It's stored securely
              on this device only.
            </Text>
            <TextInput
              style={[
                styles.pwInput,
                { backgroundColor: theme.surfaceAlt, color: theme.textPrimary },
              ]}
              value={bioPw}
              onChangeText={setBioPw}
              placeholder="Your password"
              placeholderTextColor={theme.textSecondary}
              secureTextEntry
              autoCapitalize="none"
            />
            <View style={styles.dialogActions}>
              <TouchableOpacity
                style={[styles.dialogCancel, { borderColor: theme.border }]}
                onPress={() => setBioDialogOpen(false)}
                disabled={bioBusy}
              >
                <Text style={[styles.dialogCancelText, { color: theme.textPrimary }]}>
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.dialogConfirm, { backgroundColor: theme.accent }]}
                onPress={confirmEnableBiometric}
                disabled={bioBusy}
              >
                {bioBusy ? (
                  <ActivityIndicator color={theme.accentText} />
                ) : (
                  <Text style={[styles.dialogConfirmText, { color: theme.accentText }]}>
                    Enable
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Change password dialog */}
      <Modal
        visible={pwOpen}
        transparent
        animationType="fade"
        onRequestClose={() => !changingPw && setPwOpen(false)}
      >
        <Pressable
          style={[styles.overlay, { backgroundColor: theme.overlay }]}
          onPress={() => !changingPw && setPwOpen(false)}
        >
          <Pressable style={[styles.dialog, { backgroundColor: theme.surface }]}>
            <Text style={[styles.dialogTitle, { color: theme.textPrimary }]}>
              Change password
            </Text>

            <TextInput
              style={[
                styles.pwInput,
                { backgroundColor: theme.surfaceAlt, color: theme.textPrimary },
              ]}
              value={currentPw}
              onChangeText={setCurrentPw}
              placeholder="Current password"
              placeholderTextColor={theme.textSecondary}
              secureTextEntry={!showPw}
              autoCapitalize="none"
            />
            <TextInput
              style={[
                styles.pwInput,
                { backgroundColor: theme.surfaceAlt, color: theme.textPrimary },
              ]}
              value={newPw}
              onChangeText={setNewPw}
              placeholder="New password (min 6 chars)"
              placeholderTextColor={theme.textSecondary}
              secureTextEntry={!showPw}
              autoCapitalize="none"
            />
            <TextInput
              style={[
                styles.pwInput,
                { backgroundColor: theme.surfaceAlt, color: theme.textPrimary },
              ]}
              value={confirmPw}
              onChangeText={setConfirmPw}
              placeholder="Confirm new password"
              placeholderTextColor={theme.textSecondary}
              secureTextEntry={!showPw}
              autoCapitalize="none"
            />

            <View style={styles.pwUtilityRow}>
              <TouchableOpacity onPress={() => setShowPw((v) => !v)}>
                <Text style={[styles.pwUtilityText, { color: theme.textSecondary }]}>
                  {showPw ? "Hide" : "Show"}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleForgotFromProfile}
                disabled={sendingReset}
              >
                <Text style={[styles.pwUtilityText, { color: theme.accent }]}>
                  {sendingReset ? "Sending..." : "Forgot password?"}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.dialogActions}>
              <TouchableOpacity
                style={[styles.dialogCancel, { borderColor: theme.border }]}
                onPress={() => setPwOpen(false)}
                disabled={changingPw}
              >
                <Text style={[styles.dialogCancelText, { color: theme.textPrimary }]}>
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.dialogConfirm, { backgroundColor: theme.accent }]}
                onPress={handleChangePassword}
                disabled={changingPw}
              >
                {changingPw ? (
                  <ActivityIndicator color={theme.accentText} />
                ) : (
                  <Text style={[styles.dialogConfirmText, { color: theme.accentText }]}>
                    Update
                  </Text>
                )}
              </TouchableOpacity>
            </View>
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
  container: { flex: 1, paddingTop: 60 },
  flex: { flex: 1 },
  scrollContent: { paddingHorizontal: 24, paddingBottom: 40 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
    paddingHorizontal: 24,
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

  personaWrap: { flexDirection: "row", flexWrap: "wrap", marginTop: 4 },
  personaPill: {
    borderRadius: 20,
    borderWidth: 1,
    paddingVertical: 9,
    paddingHorizontal: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  personaText: { fontSize: 14, fontWeight: "600" },
  personaHint: { fontSize: 12, marginTop: 2, marginBottom: 4 },

  primaryBtn: { borderRadius: 12, padding: 16, alignItems: "center", marginTop: 24 },
  primaryText: { fontSize: 16, fontWeight: "700" },

  secondaryBtn: {
    borderRadius: 12,
    padding: 15,
    alignItems: "center",
    marginTop: 4,
    borderWidth: 1,
  },
  secondaryText: { fontSize: 15, fontWeight: "600" },

  bioRow: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    marginTop: 12,
  },
  bioTitle: { fontSize: 15, fontWeight: "600" },
  bioSub: { fontSize: 12, marginTop: 2 },

  divider: { height: 1, marginTop: 24, marginBottom: 16 },
  sectionLabel: { fontSize: 12, letterSpacing: 1, marginBottom: 12 },

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

  pwInput: { borderRadius: 12, padding: 13, fontSize: 15, marginBottom: 10 },
  pwUtilityRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 2,
    marginBottom: 18,
    paddingHorizontal: 2,
  },
  pwUtilityText: { fontSize: 13, fontWeight: "600" },

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





