import webpush from "web-push";
import pool from "../config/database";

type PushSubscriptionPayload = {
    endpoint: string;
    keys: {
        p256dh: string;
        auth: string;
    };
};

const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY || "";
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY || "";
const VAPID_SUBJECT =
    process.env.VAPID_SUBJECT || "mailto:admin@horse-care.local";
const REMINDER_POLL_INTERVAL_MS = 5 * 60 * 1000;

const ensureTables = async () => {
    await pool.query(`
    CREATE TABLE IF NOT EXISTS push_subscriptions (
      endpoint TEXT PRIMARY KEY,
      p256dh TEXT NOT NULL,
      auth TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

    await pool.query(`
    CREATE TABLE IF NOT EXISTS push_notifications (
      event_id TEXT NOT NULL,
      reminder_date TIMESTAMPTZ NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      PRIMARY KEY (event_id, reminder_date)
    );
  `);
};

const isPushConfigured = (): boolean =>
    Boolean(VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY);

const initWebPush = () => {
    if (!isPushConfigured()) return false;
    webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
    return true;
};

export const initPushService = async () => {
    try {
        await ensureTables();
        return initWebPush();
    } catch (error) {
        console.error("❌ Push service init failed:", error);
        return false;
    }
};

export const getPublicKey = (): string => VAPID_PUBLIC_KEY;

export const saveSubscription = async (
    subscription: PushSubscriptionPayload,
) => {
    await pool.query(
        `
    INSERT INTO push_subscriptions (endpoint, p256dh, auth)
    VALUES ($1, $2, $3)
    ON CONFLICT (endpoint) DO UPDATE
    SET p256dh = EXCLUDED.p256dh,
        auth = EXCLUDED.auth
  `,
        [
            subscription.endpoint,
            subscription.keys.p256dh,
            subscription.keys.auth,
        ],
    );
};

const listSubscriptions = async (): Promise<PushSubscriptionPayload[]> => {
    const result = await pool.query(
        "SELECT endpoint, p256dh, auth FROM push_subscriptions",
    );
    return result.rows.map((row) => ({
        endpoint: row.endpoint,
        keys: { p256dh: row.p256dh, auth: row.auth },
    }));
};

const markNotified = async (eventId: string, reminderDate: string) => {
    await pool.query(
        `
    INSERT INTO push_notifications (event_id, reminder_date)
    VALUES ($1, $2)
    ON CONFLICT (event_id, reminder_date) DO NOTHING
    `,
        [eventId, reminderDate],
    );
};

const fetchDueReminders = async () => {
    try {
        const result = await pool.query(
            `
            SELECT
              e.id,
              e.name,
              e.description,
              COALESCE(e.next_reminder_date, e.event_date) AS reminder_date
            FROM events e
            LEFT JOIN push_notifications pn
              ON pn.event_id = e.id
              AND pn.reminder_date = COALESCE(e.next_reminder_date, e.event_date)
            WHERE e.reminder_enabled = true
              AND COALESCE(e.next_reminder_date, e.event_date) IS NOT NULL
              AND COALESCE(e.next_reminder_date, e.event_date) <= NOW()
              AND pn.event_id IS NULL
            `,
        );
        return result.rows;
    } catch (error) {
        console.error("❌ Error fetching due reminders:", error);
        return [];
    }
};


const sendToAll = async (payload: Record<string, unknown>) => {
    if (!isPushConfigured()) return;
    const subscriptions = await listSubscriptions();
    await Promise.all(
        subscriptions.map(async (subscription) => {
            try {
                await webpush.sendNotification(
                    subscription,
                    JSON.stringify(payload),
                );
            } catch (error: any) {
                if (error?.statusCode === 410 || error?.statusCode === 404) {
                    await pool.query(
                        "DELETE FROM push_subscriptions WHERE endpoint = $1",
                        [subscription.endpoint],
                    );
                }
            }
        }),
    );
};

export const startReminderPushScheduler = () => {
    if (!isPushConfigured()) return;

    const run = async () => {
        try {
            const due = await fetchDueReminders();

            for (const reminder of due) {
                try {
                    const payload = {
                        title: "Rappel",
                        body:
                            reminder.description ||
                            reminder.name ||
                            "Rappel à traiter",
                        tag: `reminder-${reminder.id}`,
                        data: {
                            reminderId: reminder.id,
                            date: reminder.reminder_date,
                        },
                    };

                    await sendToAll(payload);
                    await markNotified(
                        reminder.id,
                        reminder.reminder_date,
                    );
                } catch (err) {
                    console.error(
                        `❌ Failed to process reminder ${reminder.id}`,
                        err,
                    );
                }
            }
        } catch (error) {
            console.error("❌ Reminder scheduler crashed:", error);
        }
    };

    void run();
    setInterval(() => void run(), REMINDER_POLL_INTERVAL_MS);
};
