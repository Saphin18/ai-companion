import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { supabase } from "../services/supabase";
import { updateProfile } from "../services/api";

export default function AuthScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [fullName, setFullName] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);

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

  const switchMode = () => {
    Animated.timing(modeAnim, {
      toValue: 1,
      duration: 180,
      useNativeDriver: true,
    }).start(() => {
      setIsSignUp((prev) => !prev);
      // Clear the confirm field when switching modes so a stale value never blocks login.
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

  const handleSubmit = async () => {
    if (!email.trim() || !password) {
      Alert.alert("Missing info", "Please enter your email and password.");
      return;
    }
    if (isSignUp && !fullName.trim()) {
      Alert.alert("Missing info", "Please enter your full name.");
      return;
    }
    if (isSignUp && password.length < 6) {
      Alert.alert("Weak password", "Password must be at least 6 characters.");
      return;
    }
    if (isSignUp && password !== confirmPassword) {
      Alert.alert(
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
        // Supabase hides "email exists" for security: it returns success with an
        // empty identities array and sends no email. Detect that and tell the user.
        if (data.user && data.user.identities && data.user.identities.length === 0) {
          Alert.alert(
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
        Alert.alert(
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
      }
    } catch (e: any) {
      Alert.alert("Error", e.message ?? "Something went wrong.");
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
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.flex}
      >
        <Animated.View
          style={[
            styles.container,
            { opacity: fade, transform: [{ translateY: slide }] },
          ]}
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
              {
                opacity: modeOpacity,
                transform: [{ translateY: modeTranslate }],
              },
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

            <TouchableOpacity
              style={styles.button}
              onPress={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>
                  {isSignUp ? "Sign up" : "Log in"}
                </Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity onPress={switchMode}>
              <Text style={styles.switchText}>
                {isSignUp
                  ? "Already have an account? Log in"
                  : "New here? Create an account"}
              </Text>
            </TouchableOpacity>
          </Animated.View>
        </Animated.View>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  flex: { flex: 1 },
  container: { flex: 1, justifyContent: "center", padding: 28 },
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
  passwordInput: {
    flex: 1,
    color: "#fff",
    padding: 15,
    fontSize: 16,
  },
  toggle: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  toggleText: {
    color: "#a99cf5",
    fontSize: 14,
    fontWeight: "600",
  },
  button: {
    backgroundColor: "#7c6cf0",
    borderRadius: 14,
    padding: 16,
    alignItems: "center",
    marginTop: 6,
  },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "700" },
  switchText: {
    color: "#c9c6e0",
    textAlign: "center",
    marginTop: 18,
    fontSize: 14,
  },
});
