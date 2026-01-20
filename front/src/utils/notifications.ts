import { eventsApi } from "@/api/events";
import { pushApi } from "@/api/push";
import type { Event } from "@/types";

const POLL_INTERVAL_MS = 5 * 60 * 1000;
const STORAGE_KEY = "reminder_notifications_seen_v1";

type SeenMap = Record<string, true>;

const isBrowser = () => typeof window !== "undefined";

const getReminderDate = (reminder: Event): string =>
  reminder.next_reminder_date || reminder.event_date;

const loadSeen = (): SeenMap => {
  if (!isBrowser()) return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as SeenMap) : {};
  } catch {
    return {};
  }
};

const saveSeen = (seen: SeenMap) => {
  if (!isBrowser()) return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(seen));
  } catch {
    // Ignore storage failures (private mode, quota, etc.)
  }
};

const getSeenKey = (reminder: Event, reminderDate: Date): string =>
  `${reminder.id}:${reminderDate.toISOString()}`;

const canNotify = (): boolean =>
  isBrowser() && "Notification" in window && Notification.permission === "granted";

const requestPermission = async (): Promise<NotificationPermission> => {
  if (!isBrowser() || !("Notification" in window)) return "denied";
  if (Notification.permission !== "default") return Notification.permission;
  return Notification.requestPermission();
};

const shouldNotify = (reminder: Event, now: Date, seen: SeenMap): boolean => {
  const reminderDate = new Date(getReminderDate(reminder));
  if (Number.isNaN(reminderDate.getTime())) return false;
  if (reminderDate > now) return false;
  const key = getSeenKey(reminder, reminderDate);
  return !seen[key];
};

const showReminderNotification = (reminder: Event, reminderDate: Date) => {
  const title = "Rappel";
  const body = reminder.description || reminder.name || "Rappel à traiter";
  new Notification(title, {
    body,
    tag: `reminder-${reminder.id}`,
    data: { reminderId: reminder.id, date: reminderDate.toISOString() },
  });
};

let pollerStarted = false;

const supportsPush = (): boolean =>
  isBrowser() &&
  "serviceWorker" in navigator &&
  "PushManager" in window &&
  "Notification" in window;

const urlBase64ToUint8Array = (base64String: string) => {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; i += 1) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
};

const ensurePushSubscription = async (): Promise<boolean> => {
  if (!supportsPush()) return false;
  const registration = await navigator.serviceWorker.ready;
  const existing = await registration.pushManager.getSubscription();
  if (existing) return true;

  const publicKey = await pushApi.getPublicKey();
  if (!publicKey) return false;

  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(publicKey),
  });

  const json = subscription.toJSON();
  if (!json.keys?.p256dh || !json.keys?.auth) return false;

  await pushApi.subscribe({
    endpoint: subscription.endpoint,
    keys: {
      p256dh: json.keys.p256dh,
      auth: json.keys.auth,
    },
  });
  return true;
};

const pollReminders = async () => {
  if (!canNotify()) return;
  const now = new Date();
  const reminders = await eventsApi.getReminders();
  const seen = loadSeen();

  let changed = false;
  for (const reminder of reminders) {
    if (!shouldNotify(reminder, now, seen)) continue;
    const reminderDate = new Date(getReminderDate(reminder));
    showReminderNotification(reminder, reminderDate);
    seen[getSeenKey(reminder, reminderDate)] = true;
    changed = true;
  }

  if (changed) saveSeen(seen);
};

export const startReminderNotifications = async () => {
  if (!isBrowser() || pollerStarted) return;
  pollerStarted = true;

  const permission = await requestPermission();
  if (permission !== "granted") return;

  try {
    const subscribed = await ensurePushSubscription();
    if (subscribed) return;
  } catch {
    // Fall back to polling if push subscription fails
  }

  await pollReminders();
  window.setInterval(pollReminders, POLL_INTERVAL_MS);
};
