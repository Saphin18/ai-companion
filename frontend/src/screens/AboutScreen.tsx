import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useTheme } from "../context/ThemeContext";

type Feature = { icon: string; title: string; body: string };

const FEATURES: Feature[] = [
  {
    icon: "📖",
    title: "Journal",
    body: "Write down your thoughts. Your companion reads them and reflects back with care.",
  },
  {
    icon: "⏰",
    title: "Reminders",
    body: "Set gentle nudges for the things you don't want to forget.",
  },
  {
    icon: "🎯",
    title: "Goals",
    body: "Tell your companion what you're working toward, and it will gently cheer you on in chat.",
  },
  {
    icon: "🔔",
    title: "Daily check-in",
    body: "Once a day, at a time you choose, your companion sends you a fresh, caring note.",
  },
];

export default function AboutScreen({ onBack }: { onBack: () => void }) {
  const { theme } = useTheme();

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <View style={[styles.header, { borderBottomColor: theme.border }]}>
        <TouchableOpacity onPress={onBack} hitSlop={12}>
          <Text style={{ color: theme.accent, fontSize: 16 }}>‹ Back</Text>
        </TouchableOpacity>
        <Text style={{ color: theme.textPrimary, fontSize: 18, fontWeight: "600" }}>
          About
        </Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <Text style={[styles.appName, { color: theme.textPrimary }]}>Saphin AI</Text>
        <Text style={[styles.intro, { color: theme.textSecondary }]}>
          A warm companion that's here to talk, remember what matters to you, and
          gently support you day to day.
        </Text>

        {FEATURES.map((f) => (
          <View
            key={f.title}
            style={[
              styles.card,
              { backgroundColor: theme.surface, borderColor: theme.border },
            ]}
          >
            <Text style={[styles.cardTitle, { color: theme.textPrimary }]}>
              {f.icon}  {f.title}
            </Text>
            <Text style={[styles.cardBody, { color: theme.textSecondary }]}>
              {f.body}
            </Text>
          </View>
        ))}

        <Text style={[styles.footer, { color: theme.textSecondary }]}>
          Made with care, just for you. 💜
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
    paddingTop: 52,
    borderBottomWidth: 1,
  },
  appName: { fontSize: 24, fontWeight: "700", marginBottom: 8 },
  intro: { fontSize: 14, lineHeight: 21, marginBottom: 20 },
  card: { borderWidth: 1, borderRadius: 12, padding: 14, marginBottom: 12 },
  cardTitle: { fontSize: 15, fontWeight: "600", marginBottom: 4 },
  cardBody: { fontSize: 13, lineHeight: 19 },
  footer: { fontSize: 13, textAlign: "center", marginTop: 12, marginBottom: 20 },
});
