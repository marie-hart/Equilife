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
              e.horse_id,
              e.reminder_type AS event_type,
              COALESCE(e.next_reminder_date, e.event_date) AS reminder_date
            FROM events e
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
        p.last_purchase_date,
        p.quantity_purchased,
        p.daily_usage,
        p.unit
      FROM products p
      WHERE p.category IN ('Granulés', 'Complément')
        AND p.last_purchase_date IS NOT NULL
        AND p.quantity_purchased IS NOT NULL
        AND p.daily_usage IS NOT NULL
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
  const totalDays =
    product.quantity_purchased / product.daily_usage;

  const end = new Date(start);
  end.setDate(start.getDate() + totalDays);

  const diff = Math.ceil(
    (end.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );

  return diff;
};

const alreadyNotified = async (
  productId: string,
  type: "J14" | "J0"
): Promise<boolean> => {
  const result = await pool.query(
    `
    SELECT 1
    FROM product_stock_notifications
    WHERE product_id = $1
      AND notification_type = $2
    `,
    [productId, type]
  );

  return (result.rowCount ?? 0) > 0;
};

const markProductNotified = async (
  productId: string,
  type: "J14" | "J0"
) => {
  await pool.query(
    `
    INSERT INTO product_stock_notifications
      (product_id, notification_type)
    VALUES ($1, $2)
    ON CONFLICT DO NOTHING
    `,
    [productId, type]
  );
};

export const startProductStockPushScheduler = () => {
  if (!isPushConfigured()) return;

    const runStockCheck = async () => {
        const products = await fetchLowStockProducts();

        for (const product of products) {
        const remaining = computeRemainingDays(product);
        if (remaining === null) continue;

        // 🔔 Alerte Stock Bas (Entre 10 et 14 jours)
        if (remaining <= 14 && remaining > 0) {
            const notified = await alreadyNotified(product.id, "J14");
            if (!notified) {
            await sendToAll({
                title: "Stock bas 📦",
                body: `Il reste environ 14 jours de ${product.name}.`,
                tag: `stock-low-${product.id}`,
                data: { product_id: product.id, type: "STOCK_LOW" },
            });
            await markProductNotified(product.id, "J14");
            }
        }

        // 🔴 Alerte Rupture (J-0 ou moins)
        if (remaining <= 0) {
            const notified = await alreadyNotified(product.id, "J0");
            if (!notified) {
            await sendToAll({
                title: "Rupture de stock ! ⚠️",
                body: `${product.name} est épuisé.`,
                tag: `stock-empty-${product.id}`,
                data: { product_id: product.id, type: "STOCK_EMPTY" },
            });
            await markProductNotified(product.id, "J0");
            }
        }
        }
    };

  void runStockCheck();
  setInterval(() => void runStockCheck(), 6 * 60 * 60 * 1000);
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

        await sendToAll(payload);
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
