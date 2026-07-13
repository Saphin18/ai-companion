import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { authenticateBiometric } from "../services/biometrics";
import { useTheme } from "../context/ThemeContext";

type Props = {
  onUnlock: () => void;
  onUsePassword: () => void;
};

export default function LockScreen({ onUnlock, onUsePassword }: Props) {
  const { theme } = useTheme();
  const [checking, setChecking] = useState(false);
  const [failed, setFailed] = useState(false);

  const run = async () => {
    setChecking(true);
    setFailed(false);
    const ok = await authenticateBiometric();
    setChecking(false);
    if (ok) {
      onUnlock();
    } else {
      setFailed(true);
    }
  };

  // Auto-prompt the moment the lock screen appears.
  useEffect(() => {
    run();
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.orb, { backgroundColor: theme.accent }]} />
      <Text style={[styles.title, { color: theme.textPrimary }]}>Saphin AI</Text>
      <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
        {failed ? "Unlock failed. Try again." : "Unlock to continue"}
      </Text>

      <TouchableOpacity
        style={[styles.button, { backgroundColor: theme.accent }]}
        onPress={run}
        disabled={checking}
      >
        {checking ? (
          <ActivityIndicator color={theme.accentText} />
        ) : (
          <Text style={[styles.buttonText, { color: theme.accentText }]}>
            Unlock
          </Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity style={styles.link} onPress={onUsePassword}>
        <Text style={[styles.linkText, { color: theme.textSecondary }]}>
          Use password instead
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  orb: {
    width: 84,
    height: 84,
    borderRadius: 42,
    marginBottom: 24,
    opacity: 0.9,
  },
  title: { fontSize: 26, fontWeight: "700", marginBottom: 6 },
  subtitle: { fontSize: 15, marginBottom: 36, textAlign: "center" },
  button: {
    borderRadius: 14,
    paddingVertical: 15,
    paddingHorizontal: 48,
    alignItems: "center",
    minWidth: 200,
  },
  buttonText: { fontSize: 16, fontWeight: "700" },
  link: { marginTop: 22, padding: 8 },
  linkText: { fontSize: 14, fontWeight: "600" },
});