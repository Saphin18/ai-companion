import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useTheme } from "../context/ThemeContext";
import {
  createReminder,
  listReminders,
  deleteReminder,
  Reminder,
} from "../services/api";
import {
  requestPermission,
  ensureAndroidChannel,
  scheduleLocalReminder,
  cancelLocal,
} from "../services/notifications";

export default function RemindersScreen({ onBack }: { onBack: () => void }) {
  const { theme } = useTheme();
  const text = theme.textPrimary;
  const sub = theme.textSecondary;
  const border = theme.border;
  const card = theme.surface;

  const [items, setItems] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [time, setTime] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);
  const [daily, setDaily] = useState(false);
  const [saving, setSaving] = useState(false);

  async function refresh() {
    try {
      setItems(await listReminders());
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
      Alert.alert("Add a title", "Give your reminder a name first.");
      return;
    }
    setSaving(true);
    try {
      const granted = await requestPermission();
      if (!granted) {
        Alert.alert(
          "Notifications are off",
          "Turn on notifications for Saphin AI to receive reminders."
        );
        setSaving(false);
        return;
      }
      await ensureAndroidChannel();

      const when = new Date();
      when.setHours(time.getHours(), time.getMinutes(), 0, 0);
      if (!daily && when.getTime() <= Date.now()) {
        when.setDate(when.getDate() + 1);
      }

      const notifId = await scheduleLocalReminder({
        title: "Reminder",
        body: t,
        date: when,
        repeatsDaily: daily,
      });

      await createReminder({
        title: t,
        remind_at: when.toISOString(),
        repeats_daily: daily,
        local_notif_id: notifId,
      });

      setTitle("");
      setDaily(false);
      await refresh();
    } catch (e) {
      console.warn(e);
      Alert.alert("Could not save", "Please try again.");
    } finally {
      setSaving(false);
    }
  }

  async function remove(r: Reminder) {
    try {
      if (r.local_notif_id) await cancelLocal(r.local_notif_id);
      await deleteReminder(r.id);
      setItems((prev) => prev.filter((x) => x.id !== r.id));
    } catch (e) {
      console.warn(e);
    }
  }

  const hh = time.getHours().toString().padStart(2, "0");
  const mm = time.getMinutes().toString().padStart(2, "0");

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <View style={[styles.header, { borderBottomColor: border }]}>
        <TouchableOpacity onPress={onBack} hitSlop={12}>
          <Text style={{ color: theme.accent, fontSize: 16 }}>Back</Text>
        </TouchableOpacity>
        <Text style={{ color: text, fontSize: 18, fontWeight: "600" }}>
          Reminders
        </Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <View style={[styles.card, { backgroundColor: card, borderColor: border }]}>
          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder="What should I remind you about?"
            placeholderTextColor={sub}
            style={{ color: text, fontSize: 16, paddingVertical: 8 }}
          />

          <TouchableOpacity
            onPress={() => setShowPicker(true)}
            style={[styles.timeBtn, { borderColor: border }]}
          >
            <Text style={{ color: text, fontSize: 15 }}>
              Time: {hh}:{mm}
            </Text>
          </TouchableOpacity>

          {showPicker && (
            <DateTimePicker
              value={time}
              mode="time"
              is24Hour={false}
              onChange={(_, d) => {
                setShowPicker(Platform.OS === "ios");
                if (d) setTime(d);
              }}
            />
          )}

          <View style={styles.row}>
            <Text style={{ color: text, fontSize: 15 }}>Repeat every day</Text>
            <Switch value={daily} onValueChange={setDaily} />
          </View>

          <TouchableOpacity
            onPress={add}
            disabled={saving}
            style={[
              styles.addBtn,
              { backgroundColor: theme.accent, opacity: saving ? 0.6 : 1 },
            ]}
          >
            <Text style={{ color: "#ffffff", fontWeight: "600" }}>
              {saving ? "Saving..." : "Add reminder"}
            </Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <ActivityIndicator color={theme.accent} style={{ marginTop: 24 }} />
        ) : items.length === 0 ? (
          <Text style={{ color: sub, textAlign: "center", marginTop: 24 }}>
            No reminders yet.
          </Text>
        ) : (
          items.map((r) => (
            <View
              key={r.id}
              style={[styles.item, { backgroundColor: card, borderColor: border }]}
            >
              <View style={{ flex: 1 }}>
                <Text style={{ color: text, fontSize: 15 }}>{r.title}</Text>
                <Text style={{ color: sub, fontSize: 12, marginTop: 2 }}>
                  {r.repeats_daily ? "Every day" : "Once"}
                  {r.remind_at
                    ? " - " +
                      new Date(r.remind_at).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : ""}
                </Text>
              </View>
              <TouchableOpacity onPress={() => remove(r)} hitSlop={8}>
                <Text style={{ color: "#e5484d", fontSize: 14 }}>Delete</Text>
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
  timeBtn: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    marginTop: 12,
    alignItems: "center",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 14,
  },
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



