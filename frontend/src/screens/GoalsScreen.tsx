import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useTheme } from "../context/ThemeContext";
import { createGoal, listGoals, updateGoal, Goal } from "../services/api";

export default function GoalsScreen({ onBack }: { onBack: () => void }) {
  const { theme } = useTheme();
  const text = theme.textPrimary;
  const sub = theme.textSecondary;
  const border = theme.border;
  const card = theme.surface;

  const [items, setItems] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [saving, setSaving] = useState(false);

  async function refresh() {
    try {
      setItems(await listGoals("active"));
    } catch (e) {
      console.warn(e);
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    refresh();
  }, []);

  async function add() {
    const t = title.trim();
    if (!t) {
      Alert.alert("Add a goal", "Type your goal first.");
      return;
    }
    setSaving(true);
    try {
      await createGoal({ title: t, detail: null });
      setTitle("");
      await refresh();
    } catch (e) {
      console.warn(e);
      Alert.alert("Could not save", "Please try again.");
    } finally {
      setSaving(false);
    }
  }

  async function complete(g: Goal) {
    try {
      await updateGoal(g.id, { status: "done" });
      setItems((prev) => prev.filter((x) => x.id !== g.id));
    } catch (e) {
      console.warn(e);
    }
  }

  return (
    <View style={{ flex: 1, backgroundColor: "transparent" }}>
      <View style={[styles.header, { borderBottomColor: border }]}>
        <TouchableOpacity onPress={onBack} hitSlop={12}>
          <Text style={{ color: theme.accent, fontSize: 16 }}>Back</Text>
        </TouchableOpacity>
        <Text style={{ color: text, fontSize: 18, fontWeight: "600" }}>Goals</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <View style={[styles.card, { backgroundColor: card, borderColor: border }]}>
          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder="What do you want to work toward?"
            placeholderTextColor={sub}
            style={{ color: text, fontSize: 16, paddingVertical: 8 }}
          />
          <TouchableOpacity
            onPress={add}
            disabled={saving}
            style={[
              styles.addBtn,
              { backgroundColor: theme.accent, opacity: saving ? 0.6 : 1 },
            ]}
          >
            <Text style={{ color: "#ffffff", fontWeight: "600" }}>
              {saving ? "Saving..." : "Add goal"}
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={{ color: sub, fontSize: 13, marginTop: 20, marginBottom: 4 }}>
          Your companion knows these and will gently cheer you on in chat.
        </Text>

        {loading ? (
          <ActivityIndicator color={theme.accent} style={{ marginTop: 24 }} />
        ) : items.length === 0 ? (
          <Text style={{ color: sub, textAlign: "center", marginTop: 24 }}>
            No active goals yet.
          </Text>
        ) : (
          items.map((g) => (
            <View
              key={g.id}
              style={[styles.item, { backgroundColor: card, borderColor: border }]}
            >
              <Text style={{ color: text, fontSize: 15, flex: 1 }}>{g.title}</Text>
              <TouchableOpacity onPress={() => complete(g)} hitSlop={8}>
                <Text style={{ color: theme.accent, fontSize: 14 }}>Done</Text>
              </TouchableOpacity>
            </View>
          ))
        )}
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
  card: { borderWidth: 1, borderRadius: 14, padding: 14 },
  addBtn: { borderRadius: 10, padding: 14, alignItems: "center", marginTop: 16 },
  item: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    marginTop: 12,
  },
});

