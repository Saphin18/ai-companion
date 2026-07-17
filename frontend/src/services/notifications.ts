import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

// Your EAS project id (from app config). Needed to fetch an Expo push token.
const PROJECT_ID = "e8d6e6eb-b1bf-4e21-af8b-885612a4b999";

// Show notifications even when the app is in the foreground.
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

// Android needs a channel before any notification will appear.
export async function ensureAndroidChannel(): Promise<void> {
  if (Platform.OS !== "android") return;
  await Notifications.setNotificationChannelAsync("default", {
    name: "Default",
    importance: Notifications.AndroidImportance.MAX,
    vibrationPattern: [0, 250, 250, 250],
  });
}

// Ask the OS for permission. Returns true if granted.
export async function requestPermission(): Promise<boolean> {
  const current = await Notifications.getPermissionsAsync();
  let status = current.status;
  if (status !== "granted") {
    const asked = await Notifications.requestPermissionsAsync();
    status = asked.status;
  }
  return status === "granted";
}

// Get this device's Expo push token (for remote check-in pushes). Null on failure.
export async function getExpoPushToken(): Promise<string | null> {
  try {
    const res = await Notifications.getExpoPushTokenAsync({
      projectId: PROJECT_ID,
    });
    return res.data ?? null;
  } catch {
    return null;
  }
}

// Schedule a local reminder on the device. Returns the notification id.
export async function scheduleLocalReminder(input: {
  title: string;
  body: string;
  date: Date;
  repeatsDaily: boolean;
}): Promise<string> {
  const trigger = input.repeatsDaily
    ? {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour: input.date.getHours(),
        minute: input.date.getMinutes(),
      }
    : {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: input.date,
      };

  return Notifications.scheduleNotificationAsync({
    content: { title: input.title, body: input.body, sound: "default" },
    trigger: trigger as Notifications.NotificationTriggerInput,
  });
}

// Cancel a previously scheduled local reminder.
export async function cancelLocal(notifId: string): Promise<void> {
  try {
    await Notifications.cancelScheduledNotificationAsync(notifId);
  } catch {
    // already gone — ignore
  }
}
