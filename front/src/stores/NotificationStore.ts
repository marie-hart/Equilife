import { defineStore } from "pinia";
import { ref, computed } from "vue";
import {
    startReminderNotifications,
    stopReminderNotifications,
    requestPermission,
    supportsPush,
    ensurePushSubscription,
} from "@/utils/notifications";
import { logger } from "@/services/LoggerService";
import type { Event, StockNotification } from "@/types"

const NOTIFICATIONS_ENABLED_KEY = "equilife_notifications_enabled";
const UNREAD_REMINDERS_KEY = "equilife_unread_reminders_v1";
const UNREAD_STOCK_ALERTS_KEY = "equilife_unread_stock_alerts_v1";

export const useNotificationStore = defineStore("notifications", () => {
    const loadStoredJson = <T>(key: string, fallback: T): T => {
        try {
            const raw = localStorage.getItem(key);
            return raw ? (JSON.parse(raw) as T) : fallback;
        } catch {
            return fallback;
        }
    };
    const persistJson = (key: string, value: unknown) => {
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch {
            // no-op
        }
    };

    const notificationsEnabled = ref<boolean>(
        (() => {
            try {
                const raw = localStorage.getItem(NOTIFICATIONS_ENABLED_KEY);
                return raw === null ? true : raw === "true";
            } catch {
                return true;
            }
        })(),
    );
    const permission = ref<NotificationPermission>("default");
    const isSubscribing = ref(false);
    const unreadReminders = ref<Event[]>(
        loadStoredJson<Event[]>(UNREAD_REMINDERS_KEY, []),
    );
    const unreadStockAlerts = ref<StockNotification[]>(
        loadStoredJson<StockNotification[]>(UNREAD_STOCK_ALERTS_KEY, []),
    );
    
    const isSupported = computed(() => supportsPush());
    const isEnabled = computed(
        () => permission.value === "granted" && notificationsEnabled.value,
    );

    // Détecter si on est sur un appareil iOS
    const isIOS = computed(() => {
        return /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    });

    // Détecter si l'app est en mode "Standalone" (installée sur l'écran d'accueil)
    const isStandalone = computed(() => {
        return window.matchMedia('(display-mode: standalone)').matches || (navigator as any).standalone;
    });

    // Déterminer si on doit afficher le message d'aide à l'installation
    const needsInstallation = computed(() => {
        return isIOS.value && !isStandalone.value;
    });

    const hasUnread = computed(
    () =>
      unreadReminders.value.length > 0 ||
      unreadStockAlerts.value.length > 0
  );


    return {
        permission,
        notificationsEnabled,
        isSubscribing,
        unreadReminders,
        unreadStockAlerts,
        isSupported,
        isEnabled,
        isIOS,
        isStandalone,
        needsInstallation,
        hasUnread,
        enableNotifications,
        disableNotifications,
        checkCurrentPermission,
        addUnreadReminder,
        markAsRead,
        addStockAlert,
        markStockAsRead,
    };

    /* =========================
        PERMISSION
    ========================== */

    function checkCurrentPermission() {
        if (isSupported.value) {
            permission.value = Notification.permission;
            
            // Si c'est déjà accordé, on s'assure que le poller/push est actif
            if (permission.value === "granted" && notificationsEnabled.value) {
                startReminderNotifications();
            } else {
                stopReminderNotifications();
            }
        }
    }

    async function enableNotifications() {
        isSubscribing.value = true;
        try {
            const result = await requestPermission();
            permission.value = result;
            
            if (result === "granted") {
                notificationsEnabled.value = true;
                persistNotificationsEnabled(true);
                // ÉTAPE CRUCIALE POUR LE MOBILE :
                // On enregistre l'appareil auprès du service de Push (Google/Apple)
                // et on envoie le token au backend
                await ensurePushSubscription(); 
                
                // On lance le poller local en complément
                startReminderNotifications();
            } else {
                notificationsEnabled.value = false;
                persistNotificationsEnabled(false);
            }
        } catch (err) {
            logger.error("Échec de l'abonnement push", err);
        } finally {
            isSubscribing.value = false;
        }
    }

    function disableNotifications() {
        notificationsEnabled.value = false;
        persistNotificationsEnabled(false);
        stopReminderNotifications();
    }

    function persistNotificationsEnabled(value: boolean) {
        try {
            localStorage.setItem(NOTIFICATIONS_ENABLED_KEY, String(value));
        } catch {
            // no-op
        }
    }

    /* =========================
        REMINDERS
    ========================== */

    function addUnreadReminder(reminder: Event) {
        if (!reminder?.id) return;
        if (!unreadReminders.value.find(r => r.id === reminder.id)) {
            unreadReminders.value.push(reminder);
            persistJson(UNREAD_REMINDERS_KEY, unreadReminders.value);
        }
    }

    function markAsRead(reminderId: string) {
        unreadReminders.value = unreadReminders.value.filter(r => r.id !== reminderId);
        persistJson(UNREAD_REMINDERS_KEY, unreadReminders.value);
    }

    /* =========================
        STOCK ALERTS
    ========================== */

    function addStockAlert(alert: StockNotification) {
        if (!alert?.product_id) return;
        const alertId =
            alert.id ||
            `${alert.product_id}:${alert.notification_type ?? "stock"}`;
        const normalizedAlert: StockNotification = {
            ...alert,
            id: alertId,
        };
        if (
        !unreadStockAlerts.value.find(
            a => a.id === normalizedAlert.id
        )
        ) {
        unreadStockAlerts.value.push(normalizedAlert);
        persistJson(UNREAD_STOCK_ALERTS_KEY, unreadStockAlerts.value);
        }
    }

    function markStockAsRead(alertId: string) {
        unreadStockAlerts.value =
        unreadStockAlerts.value.filter(
            a => a.id !== alertId
        );
        persistJson(UNREAD_STOCK_ALERTS_KEY, unreadStockAlerts.value);
    }

});