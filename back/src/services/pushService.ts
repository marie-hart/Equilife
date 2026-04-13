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
    process.env.VAPID_SUBJECT || "mailto:admin@equilife.local";
const REMINDER_POLL_INTERVAL_MS = 5 * 60 * 1000;
const STOCK_POLL_INTERVAL_MS = 6 * 60 * 60 * 1000;
type StockNotificationType = "J10" | "J7" | "J1";

const ensureTables = async () => {
    await pool.query(`
        CREATE TABLE IF NOT EXISTS push_subscriptions (
            endpoint TEXT PRIMARY KEY,
            p256dh TEXT NOT NULL,
            auth TEXT NOT NULL,
            user_id UUID,
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );
    `);

    await pool.query(`
        ALTER TABLE push_subscriptions
        ADD COLUMN IF NOT EXISTS user_id UUID;
    `);

    await pool.query(`
        CREATE TABLE IF NOT EXISTS push_notifications (
            event_id TEXT NOT NULL,
            reminder_date TIMESTAMPTZ NOT NULL,
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            PRIMARY KEY (event_id, reminder_date)
        );
    `);

    await pool.query(`
        CREATE TABLE IF NOT EXISTS product_stock_notifications (
            product_id TEXT NOT NULL,
            notification_type TEXT NOT NULL, -- 'J14' | 'J0'
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            PRIMARY KEY (product_id, notification_type)
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
    userId: string,
    subscription: PushSubscriptionPayload,
) => {
    await pool.query(
        `
    INSERT INTO push_subscriptions (endpoint, p256dh, auth, user_id)
    VALUES ($1, $2, $3, $4)
    ON CONFLICT (endpoint) DO UPDATE
    SET p256dh = EXCLUDED.p256dh,
        auth = EXCLUDED.auth,
        user_id = EXCLUDED.user_id
  `,
        [
            subscription.endpoint,
            subscription.keys.p256dh,
            subscription.keys.auth,
            userId,
        ],
    );
};

const listSubscriptions = async (
    userId: string,
): Promise<PushSubscriptionPayload[]> => {
    const result = await pool.query(
        "SELECT endpoint, p256dh, auth FROM push_subscriptions WHERE user_id = $1",
        [userId],
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
              e.horse_id,
              h.user_id,
              e.reminder_type AS event_type,
              COALESCE(e.next_reminder_date, e.event_date) AS reminder_date
            FROM events e
            INNER JOIN horses h ON h.id = e.horse_id
            LEFT JOIN push_notifications pn
              ON pn.event_id::text = e.id::text
              AND pn.reminder_date = COALESCE(e.next_reminder_date, e.event_date)
            WHERE e.reminder_enabled = true
              -- On s'assure que le rappel est pour AUJOURD'HUI ou passé
              AND COALESCE(e.next_reminder_date, e.event_date)::date <= CURRENT_DATE
              AND pn.event_id IS NULL
            `,
        );
        return result.rows;
    } catch (error: any) {
        if (error?.code === "42P01") {
            console.warn("⚠️ Table 'events' missing; run DB migrations. Skipping reminder fetch.");
        } else {
            console.error("❌ Error fetching due reminders:", error);
        }
        return [];
    }
};

const fetchLowStockProducts = async () => {
  try {
    const result = await pool.query(`
      SELECT
        p.id,
        p.name,
        h.user_id,
        p.last_purchase_date,
        p.quantity_purchased,
        p.daily_usage,
        p.unit
      FROM products p
      INNER JOIN horses h ON h.id = p.horse_id
      WHERE p.last_purchase_date IS NOT NULL
        AND p.quantity_purchased IS NOT NULL
        AND p.daily_usage IS NOT NULL
        AND p.daily_usage > 0
        AND p.quantity_purchased > 0
    `);
    return result.rows;
  } catch (error: any) {
    if (error?.code === "42P01") {
      console.warn("⚠️ Table 'products' missing; run DB migrations. Skipping stock check.");
    } else {
      console.error("❌ Error fetching low stock products:", error);
    }
    return [];
  }
};

const computeRemainingDays = (product: any): number | null => {
  const start = new Date(product.last_purchase_date);
  if (Number.isNaN(start.getTime())) return null;
  const totalDays =
    product.quantity_purchased / product.daily_usage;
  if (!Number.isFinite(totalDays) || totalDays <= 0) return null;
  const end = new Date(start.getTime() + totalDays * 24 * 60 * 60 * 1000);

  const diff = Math.ceil(
    (end.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );

  return diff;
};

const alreadyNotified = async (
  product: any,
  type: StockNotificationType
): Promise<boolean> => {
  const result = await pool.query(
    `
    SELECT created_at
    FROM product_stock_notifications
    WHERE product_id = $1
      AND notification_type = $2
    `,
    [product.id, type]
  );

  if ((result.rowCount ?? 0) === 0) return false;
  const notifiedAt = new Date(result.rows[0].created_at);
  const lastPurchaseDate = product.last_purchase_date
    ? new Date(product.last_purchase_date)
    : null;
  if (!lastPurchaseDate || Number.isNaN(lastPurchaseDate.getTime())) return true;
  return notifiedAt.getTime() >= lastPurchaseDate.getTime();
};

const markProductNotified = async (
  productId: string,
  type: StockNotificationType
) => {
  await pool.query(
    `
    INSERT INTO product_stock_notifications
      (product_id, notification_type)
    VALUES ($1, $2)
    ON CONFLICT (product_id, notification_type)
    DO UPDATE SET created_at = NOW()
    `,
    [productId, type]
  );
};

const getStockNotificationType = (remainingDays: number): StockNotificationType | null => {
  if (remainingDays <= 1 && remainingDays > 0) return "J1";
  if (remainingDays <= 7 && remainingDays > 1) return "J7";
  if (remainingDays <= 10 && remainingDays > 7) return "J10";
  return null;
};

export const startProductStockPushScheduler = () => {
  if (!isPushConfigured()) return;

    const runStockCheck = async () => {
        const products = await fetchLowStockProducts();

        for (const product of products) {
        const remaining = computeRemainingDays(product);
        if (remaining === null) continue;
        const notificationType = getStockNotificationType(remaining);
        if (!notificationType) continue;
        const notified = await alreadyNotified(product, notificationType);
        if (notified) continue;
        if (!product.user_id) continue;

        const title = "Alerte stock";
        const body = `Il reste environ ${remaining} jour${remaining > 1 ? "s" : ""} avant rupture pour ${product.name}.`;
        await sendToUser(product.user_id, {
          type: "stock",
          title,
          body,
          tag: `stock-${product.id}-${notificationType}`,
          product_id: product.id,
          notification_type: notificationType,
          remaining_days: remaining,
          product: {
            id: `${product.id}:${notificationType}:${product.last_purchase_date ?? ""}`,
            product_id: product.id,
            name: product.name,
            title,
            body,
            notification_type: notificationType,
            remaining_days: remaining,
          },
        });
        await markProductNotified(product.id, notificationType);
        }
    };

  void runStockCheck();
  setInterval(() => void runStockCheck(), STOCK_POLL_INTERVAL_MS);
};

const sendToUser = async (
    userId: string,
    payload: Record<string, unknown>,
) => {
    if (!isPushConfigured()) return;
    const subscriptions = await listSubscriptions(userId);
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
            title: "Rappel EquiLife",
            body: reminder.description || reminder.name || "Rappel à traiter",
            tag: `reminder-${reminder.id}`,
            data: {
                id: reminder.id,           
                name: reminder.name,       
                horse_id: reminder.horse_id, 
                event_date: reminder.reminder_date,
            },
        };

        if (!reminder.user_id) continue;
        await sendToUser(reminder.user_id, payload);
        await markNotified(reminder.id, reminder.reminder_date);
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
