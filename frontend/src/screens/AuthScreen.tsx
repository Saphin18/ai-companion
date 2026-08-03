import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { supabase } from "../services/supabase";
import { updateProfile } from "../services/api";
import {
  isBiometricAvailable,
  isBiometricEnabled,
  getStoredCredentials,
  authenticateBiometric,
  enableBiometric,
} from "../services/biometrics";

// Where Supabase sends the recovery email link (backend-hosted reset page).
// Cross-platform alert: window.alert on web, native Alert elsewhere
function showAlert(title: string, message: string) {
  if (Platform.OS === "web" && typeof window !== "undefined") {
    window.alert(title + "\n\n" + message);
  } else {
    showAlert(title, message);
  }
}

const RESET_REDIRECT_URL =
  "https://saphin-ai-backend.onrender.com/reset-password";

// Keyboard: iOS uses KeyboardAvoidingView (padding); Android uses a plain View and
// lets the OS "resize" mode lift the screen (stacking both doubled it — handover §9 #26).
const KeyboardWrapper: any = Platform.OS === "ios" ? KeyboardAvoidingView : View;

export default function AuthScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [fullName, setFullName] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [canUseBiometric, setCanUseBiometric] = useState(false);

  const passwordRef = useRef<TextInput>(null);
  const confirmRef = useRef<TextInput>(null);
  const emailRef = useRef<TextInput>(null);

  const fade = useRef(new Animated.Value(0)).current;
  const slide = useRef(new Animated.Value(30)).current;
  const modeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade, { toValue: 1, duration: 900, useNativeDriver: true }),
      Animated.timing(slide, { toValue: 0, duration: 900, useNativeDriver: true }),
    ]).start();
  }, []);

  // Show the fingerprint button only if biometrics are enabled, the device
  // supports them, and we have stored credentials to log in with.
  useEffect(() => {
    (async () => {
      try {
        const [enabled, available, creds] = await Promise.all([
          isBiometricEnabled(),
          isBiometricAvailable(),
          getStoredCredentials(),
        ]);
        setCanUseBiometric(enabled && available && !!creds);
      } catch {
        setCanUseBiometric(false);
      }
    })();
  }, []);

  const switchMode = () => {
    Animated.timing(modeAnim, {
      toValue: 1,
      duration: 180,
      useNativeDriver: true,
    }).start(() => {
      setIsSignUp((prev) => !prev);
      setConfirmPassword("");
      modeAnim.setValue(-1);
      Animated.timing(modeAnim, {
        toValue: 0,
        duration: 220,
        useNativeDriver: true,
      }).start();
    });
  };

  const modeTranslate = modeAnim.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: [40, 0, -40],
  });
  const modeOpacity = modeAnim.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: [0, 1, 0],
  });

  const handleForgotPassword = async () => {
    if (!email.trim()) {
      showAlert(
        "Enter your email",
        "Type your account email in the Email field above, then tap “Forgot password?” again."
      );
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: RESET_REDIRECT_URL,
      });
      if (error) throw error;
      showAlert(
        "Check your email",
        "If an account exists for that email, we sent a link to reset your password."
      );
    } catch (e: any) {
      showAlert("Error", e.message ?? "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const handleBiometricLogin = async () => {
    const creds = await getStoredCredentials();
    if (!creds) {
      showAlert("Not set up", "Please log in with your password first.");
      setCanUseBiometric(false);
      return;
    }
    const ok = await authenticateBiometric();
    if (!ok) return; // user cancelled or failed; stay on password screen
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: creds.email,
        password: creds.password,
      });
      if (error) {
        // Stored password no longer valid (e.g. changed elsewhere).
        showAlert(
          "Please log in again",
          "Your saved login is out of date. Enter your password to continue."
        );
        setCanUseBiometric(false);
      }
    } catch (e: any) {
      showAlert("Error", e.message ?? "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!email.trim() || !password) {
      showAlert("Missing info", "Please enter your email and password.");
      return;
    }
    if (isSignUp && !fullName.trim()) {
      showAlert("Missing info", "Please enter your full name.");
      return;
    }
    if (isSignUp && password.length < 6) {
      showAlert("Weak password", "Password must be at least 6 characters.");
      return;
    }
    if (isSignUp && password !== confirmPassword) {
      showAlert(
        "Passwords don't match",
        "Please make sure both passwords are the same."
      );
      return;
    }
    setLoading(true);
    try {
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: { data: { full_name: fullName.trim() } },
        });
        if (error) throw error;
        if (data.user && data.user.identities && data.user.identities.length === 0) {
          showAlert(
            "Email already registered",
            "This email is already in use. Please log in instead."
          );
          setIsSignUp(false);
          setConfirmPassword("");
          return;
        }
        try {
          await updateProfile(fullName.trim());
        } catch {
          // No session yet if email confirmation is on; name re-saves on first login.
        }
        showAlert(
          "Check your email",
          "We sent you a confirmation link. Confirm, then log in."
        );
        setIsSignUp(false);
        setConfirmPassword("");
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        if (error) throw error;
        // If biometrics are already enabled, refresh the stored password so a
        // recent password change keeps fingerprint login working.
        try {
          if (await isBiometricEnabled()) {
            await enableBiometric(email.trim(), password);
          }
        } catch {
          // ignore
        }
      }
    } catch (e: any) {
      showAlert("Error", e.message ?? "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient
      colors={["#2a2350", "#3b2f63", "#1a1730"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.gradient}
    >
      <KeyboardWrapper
        {...(Platform.OS === "ios" ? { behavior: "padding" } : {})}
        style={styles.flex}
      >
        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Animated.View
            style={[styles.inner, { opacity: fade, transform: [{ translateY: slide }] }]}
          >
            <View style={styles.brand}>
              <View style={styles.orb} />
              <Text style={styles.appName}>Your Companion</Text>
              <Text style={styles.tagline}>
                A warm space to talk, whenever you need it.
              </Text>
            </View>

            <Animated.View
              style={[
                styles.card,
                { opacity: modeOpacity, transform: [{ translateY: modeTranslate }] },
              ]}
            >
              <Text style={styles.cardTitle}>
                {isSignUp ? "Create your account" : "Welcome back"}
              </Text>

              {isSignUp && (
                <TextInput
                  style={styles.input}
                  value={fullName}
                  onChangeText={setFullName}
                  placeholder="Full name"
                  placeholderTextColor="#8b8ba7"
                  autoCapitalize="words"
                  returnKeyType="next"
                  onSubmitEditing={() => emailRef.current?.focus()}
                />
              )}

              <TextInput
                ref={emailRef}
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="Email"
                placeholderTextColor="#8b8ba7"
                autoCapitalize="none"
                keyboardType="email-address"
                returnKeyType="next"
                onSubmitEditing={() => passwordRef.current?.focus()}
                blurOnSubmit={false}
              />

              <View style={styles.passwordRow}>
                <TextInput
                  ref={passwordRef}
                  style={styles.passwordInput}
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Password"
                  placeholderTextColor="#8b8ba7"
                  secureTextEntry={!showPassword}
                  returnKeyType={isSignUp ? "next" : "done"}
                  onSubmitEditing={() =>
                    isSignUp ? confirmRef.current?.focus() : handleSubmit()
                  }
                  blurOnSubmit={!isSignUp}
                />
                <TouchableOpacity
                  style={styles.toggle}
                  onPress={() => setShowPassword((v) => !v)}
                >
                  <Text style={styles.toggleText}>
                    {showPassword ? "Hide" : "Show"}
                  </Text>
                </TouchableOpacity>
              </View>

              {isSignUp && (
                <View style={styles.passwordRow}>
                  <TextInput
                    ref={confirmRef}
                    style={styles.passwordInput}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    placeholder="Confirm password"
                    placeholderTextColor="#8b8ba7"
                    secureTextEntry={!showPassword}
                    returnKeyType="done"
                    onSubmitEditing={handleSubmit}
                  />
                  <TouchableOpacity
                    style={styles.toggle}
                    onPress={() => setShowPassword((v) => !v)}
                  >
                    <Text style={styles.toggleText}>
                      {showPassword ? "Hide" : "Show"}
                    </Text>
                  </TouchableOpacity>
                </View>
              )}

              {!isSignUp && (
                <TouchableOpacity
                  style={styles.forgotWrap}
                  onPress={handleForgotPassword}
                  disabled={loading}
                >
                  <Text style={styles.forgotText}>Forgot password?</Text>
                </TouchableOpacity>
              )}

              {/* Login row: password button + optional fingerprint button */}
              {isSignUp ? (
                <TouchableOpacity
                  style={styles.button}
                  onPress={handleSubmit}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.buttonText}>Sign up</Text>
                  )}
                </TouchableOpacity>
              ) : (
                <View style={styles.loginRow}>
                  <TouchableOpacity
                    style={[styles.button, styles.loginButton]}
                    onPress={handleSubmit}
                    disabled={loading}
                  >
                    {loading ? (
                      <ActivityIndicator color="#fff" />
                    ) : (
                      <Text style={styles.buttonText}>Log in</Text>
                    )}
                  </TouchableOpacity>

                  {canUseBiometric && (
                    <TouchableOpacity
                      style={styles.bioButton}
                      onPress={handleBiometricLogin}
                      disabled={loading}
                    >
                      <Ionicons name="finger-print" size={28} color="#a99cf5" />
                    </TouchableOpacity>
                  )}
                </View>
              )}

              <TouchableOpacity onPress={switchMode}>
                <Text style={styles.switchText}>
                  {isSignUp
                    ? "Already have an account? Log in"
                    : "New here? Create an account"}
                </Text>
              </TouchableOpacity>
            </Animated.View>
          </Animated.View>
        </ScrollView>
      </KeyboardWrapper>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  flex: { flex: 1 },
  scrollContent: { flexGrow: 1, justifyContent: "center", padding: 28 },
  inner: {},
  brand: { alignItems: "center", marginBottom: 36 },
  orb: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#a99cf5",
    marginBottom: 18,
    shadowColor: "#a99cf5",
    shadowOpacity: 0.6,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 0 },
  },
  appName: { color: "#fff", fontSize: 28, fontWeight: "700" },
  tagline: {
    color: "#c9c6e0",
    fontSize: 15,
    marginTop: 8,
    textAlign: "center",
    paddingHorizontal: 20,
  },
  card: {
    backgroundColor: "rgba(255,255,255,0.07)",
    borderRadius: 22,
    padding: 24,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
  },
  cardTitle: {
    color: "#fff",
    fontSize: 19,
    fontWeight: "600",
    marginBottom: 20,
    textAlign: "center",
  },
  input: {
    backgroundColor: "rgba(255,255,255,0.1)",
    color: "#fff",
    borderRadius: 14,
    padding: 15,
    fontSize: 16,
    marginBottom: 14,
  },
  passwordRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 14,
    marginBottom: 14,
    paddingRight: 6,
  },
  passwordInput: { flex: 1, color: "#fff", padding: 15, fontSize: 16 },
  toggle: { paddingHorizontal: 12, paddingVertical: 8 },
  toggleText: { color: "#a99cf5", fontSize: 14, fontWeight: "600" },
  forgotWrap: {
    alignSelf: "flex-end",
    marginTop: -2,
    marginBottom: 14,
    paddingVertical: 4,
  },
  forgotText: { color: "#a99cf5", fontSize: 14, fontWeight: "600" },
  loginRow: { flexDirection: "row", alignItems: "center", marginTop: 6 },
  button: {
    backgroundColor: "#7c6cf0",
    borderRadius: 14,
    padding: 16,
    alignItems: "center",
  },
  loginButton: { flex: 1 },
  bioButton: {
    marginLeft: 12,
    width: 56,
    height: 56,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(169,156,245,0.6)",
    backgroundColor: "rgba(255,255,255,0.06)",
    justifyContent: "center",
    alignItems: "center",
  },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "700" },
  switchText: {
    color: "#c9c6e0",
    textAlign: "center",
    marginTop: 18,
    fontSize: 14,
  },
});

