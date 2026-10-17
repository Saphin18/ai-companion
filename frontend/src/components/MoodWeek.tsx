// "Last 7 days" mood strip (Session 24).
//
// Seven dots, oldest on the left, today on the right. The user never fills
// these in - detect_mood() has been logging a reading for every message sent
// since Phase 3A and nothing has ever shown them. Tapping a past day opens a
// sheet listing the conversations behind it, because mood_logs.session_id was
// always stored and never followed.
//
// ===========================================================================
// TIMEZONE: grouping happens HERE, on the device, never on the server.
// ===========================================================================
// Timestamps arrive as UTC. `new Date(utc)` is automatically in the device's
// own timezone, so a phone in Kathmandu (UTC+5:45) buckets a 2am message into
// its own "today" rather than the previous UTC date. No setting, no stored
// preference, and it follows the user if they travel. Hardcoding a timezone
// would break for every user outside Nepal, silently.
//
// "Last 7 days" rather than "This week" on purpose: a Mon-Sun strip shows a
// single dot on a Monday morning and looks broken.

import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { listRecentMoods, MoodLog } from "../services/api";
import { useTheme } from "../context/ThemeContext";
import { type } from "../theme/typography";

const DAYS = 7;

/** Mood words that read as low. Used only to colour the dot. */
const LOW = new Set(["sad", "anxious", "stressed", "lonely", "angry", "tired"]);

export type MoodDay = {
  /** Local midnight for this day - the bucket key. */
  date: Date;
  /** One-letter label, in the device's own locale. */
  letter: string;
  /** Strongest reading of the day, or null if nothing was logged. */
  mood: string | null;
  intensity: number;
  logs: MoodLog[];
  isToday: boolean;
};

/** Local-midnight key for a timestamp, in the DEVICE's timezone. */
function localKey(iso: string): string {
  const d = new Date(iso);
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

function keyOf(d: Date): string {
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

/** Build the 7 buckets ending today, newest last. */
export function buildWeek(logs: MoodLog[]): MoodDay[] {
  const byDay = new Map<string, MoodLog[]>();
  for (const log of logs) {
    const k = localKey(log.created_at);
    const list = byDay.get(k);
    if (list) list.push(log);
    else byDay.set(k, [log]);
  }

  const today = new Date();
  const todayKey = keyOf(today);
  const out: MoodDay[] = [];

  for (let i = DAYS - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    d.setHours(0, 0, 0, 0);
    const k = keyOf(d);
    const dayLogs = byDay.get(k) ?? [];

    // The day's headline is its STRONGEST reading, not its last one - a
    // single hard moment matters more than whatever was said at bedtime.
    let strongest: MoodLog | null = null;
    for (const l of dayLogs) {
      if (!strongest || l.intensity > strongest.intensity) strongest = l;
    }

    out.push({
      date: d,
      letter: d.toLocaleDateString(undefined, { weekday: "short" }).charAt(0),
      mood: strongest ? strongest.mood : null,
      intensity: strongest ? strongest.intensity : 0,
      logs: dayLogs,
      isToday: k === todayKey,
    });
  }
  return out;
}

/** Distinct conversations behind a day, oldest first. */
function sessionsOf(day: MoodDay) {
  const seen = new Map<string, { id: string; title: string | null; at: string }>();
  for (const l of day.logs) {
    if (!l.session_id || seen.has(l.session_id)) continue;
    seen.set(l.session_id, {
      id: l.session_id,
      title: l.session_title,
      at: new Date(l.created_at).toLocaleTimeString(undefined, {
        hour: "numeric",
        minute: "2-digit",
      }),
    });
  }
  return [...seen.values()];
}

type Props = {
  /** Bumped by the parent to force a refetch. */
  refreshKey?: number;
  onOpenSession: (sessionId: string) => void;
  onStartChat: () => void;
};

export default function MoodWeek({ refreshKey, onOpenSession, onStartChat }: Props) {
  const { theme } = useTheme();
  const [week, setWeek] = useState<MoodDay[] | null>(null);
  const [failed, setFailed] = useState(false);
  const [open, setOpen] = useState<MoodDay | null>(null);

  useEffect(() => {
    let alive = true;
    setFailed(false);
    listRecentMoods(DAYS)
      .then((logs) => alive && setWeek(buildWeek(logs)))
      .catch(() => alive && setFailed(true));
    return () => {
      alive = false;
    };
  }, [refreshKey]);

  // Never show a broken strip. A mood history is a nice-to-have; if the call
  // fails the home screen simply carries on without it.
  if (failed) return null;

  if (!week) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="small" color={theme.textSecondary} />
      </View>
    );
  }

  const dotStyle = (d: MoodDay) => {
    if (d.isToday && !d.mood) {
      return {
        borderColor: theme.accent,
        borderStyle: "dashed" as const,
        backgroundColor: "transparent",
      };
    }
    if (!d.mood) {
      return { borderColor: theme.border, backgroundColor: theme.surface };
    }
    // Opacity by intensity. No red/green - this is a memory, not a score.
    const strength = Math.min(Math.max(d.intensity, 1), 5) / 5;
    return {
      borderColor: "transparent",
      backgroundColor: theme.accent,
      opacity: 0.3 + strength * 0.7,
    };
  };

  const labelColor = (d: MoodDay) => {
    if (!d.mood) return d.isToday ? theme.accent : theme.textSecondary;
    return d.intensity >= 4 ? theme.accentText : theme.textPrimary;
  };

  const sheetSessions = open ? sessionsOf(open) : [];

  return (
    <>
      <View style={styles.row}>
        {week.map((d) => (
          <TouchableOpacity
            key={keyOf(d.date)}
            style={[styles.dot, dotStyle(d)]}
            activeOpacity={0.7}
            onPress={() => (d.logs.length ? setOpen(d) : onStartChat())}
            accessibilityRole="button"
            accessibilityLabel={
              d.mood
                ? `${d.date.toLocaleDateString()}, you sounded ${d.mood}`
                : `${d.date.toLocaleDateString()}, nothing logged`
            }
          >
            <Text style={[styles.dotText, { color: labelColor(d) }]}>
              {d.isToday && !d.mood ? "+" : d.letter}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Modal
        visible={!!open}
        transparent
        animationType="slide"
        onRequestClose={() => setOpen(null)}
      >
        <Pressable
          style={[styles.veil, { backgroundColor: theme.overlay }]}
          onPress={() => setOpen(null)}
        >
          <Pressable
            style={[styles.sheet, { backgroundColor: theme.surface }]}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={[styles.grip, { backgroundColor: theme.border }]} />
            {open && (
              <>
                <Text style={[styles.sheetTitle, { color: theme.textPrimary }]}>
                  {open.isToday
                    ? "Today"
                    : open.date.toLocaleDateString(undefined, {
                        weekday: "long",
                      })}
                  {open.mood ? ` — you sounded ${open.mood}` : ""}
                </Text>
                <Text style={[styles.sheetWhen, { color: theme.textSecondary }]}>
                  {open.mood
                    ? `intensity ${open.intensity}/5 · ${sheetSessions.length} conversation${
                        sheetSessions.length === 1 ? "" : "s"
                      }`
                    : "Nothing logged yet"}
                </Text>

                <ScrollView style={styles.list}>
                  {sheetSessions.map((s) => (
                    <TouchableOpacity
                      key={s.id}
                      style={[styles.listRow, { borderBottomColor: theme.border }]}
                      onPress={() => {
                        setOpen(null);
                        onOpenSession(s.id);
                      }}
                    >
                      <Text style={[styles.chev, { color: theme.accent }]}>
                        {"›"}
                      </Text>
                      <Text
                        style={[styles.rowTitle, { color: theme.textPrimary }]}
                        numberOfLines={1}
                      >
                        {s.title || "Untitled"}
                      </Text>
                      <Text style={[styles.rowAt, { color: theme.textSecondary }]}>
                        {s.at}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>

                <Text style={[styles.foot, { color: theme.textSecondary }]}>
                  Picked up from what you wrote. You never filled this in.
                </Text>
                <TouchableOpacity
                  style={[styles.close, { backgroundColor: theme.surfaceAlt }]}
                  onPress={() => setOpen(null)}
                >
                  <Text style={[styles.closeText, { color: theme.textPrimary }]}>
                    Close
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  loading: { height: 32, justifyContent: "center" },
  row: { flexDirection: "row", gap: 9 },
  dot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  dotText: { ...type.caption, fontSize: 10 },
  veil: { flex: 1, justifyContent: "flex-end" },
  sheet: {
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    paddingHorizontal: 22,
    paddingTop: 12,
    paddingBottom: 28,
    maxHeight: "70%",
  },
  grip: {
    width: 36,
    height: 4,
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: 16,
  },
  sheetTitle: { ...type.h2 },
  sheetWhen: { ...type.caption, marginTop: 3, marginBottom: 14 },
  list: { flexGrow: 0 },
  listRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 11,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  chev: { ...type.title },
  rowTitle: { ...type.bodyStrong, flex: 1 },
  rowAt: { ...type.caption },
  foot: { ...type.caption, marginTop: 14 },
  close: {
    marginTop: 14,
    borderRadius: 13,
    paddingVertical: 13,
    alignItems: "center",
  },
  closeText: { ...type.bodyStrong },
});
