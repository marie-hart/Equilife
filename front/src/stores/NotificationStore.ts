import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { startReminderNotifications, requestPermission, supportsPush, ensurePushSubscription } from "@/utils/notifications";
import { logger } from "@/services/LoggerService";
import type { Event, StockNotification } from "@/types"

export const useNotificationStore = defineStore("notifications", () => {
    const permission = ref<NotificationPermission>("default");
    const isSubscribing = ref(false);
    const unreadReminders = ref<Event[]>([]);
     const unreadStockAlerts = ref<StockNotification[]>([]);
    
    const isSupported = computed(() => supportsPush());
    const isEnabled = computed(() => permission.value === "granted");

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
        isSubscribing,
        unreadReminders,
        isSupported,
        isEnabled,
        isIOS,
        isStandalone,
        needsInstallation,
        hasUnread,
        enableNotifications,
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
            if (permission.value === "granted") {
                startReminderNotifications();
            }
        }
    }

    async function enableNotifications() {
    isSubscribing.value = true;
    try {
        const result = await requestPermission();
        permission.value = result;
        
        if (result === "granted") {
            // ÉTAPE CRUCIALE POUR LE MOBILE :
            // On enregistre l'appareil auprès du service de Push (Google/Apple)
            // et on envoie le token au backend
            await ensurePushSubscription(); 
            
            // On lance le poller local en complément
            startReminderNotifications();
        }
    } catch (err) {
        logger.error("Échec de l'abonnement push", err);
    } finally {
        isSubscribing.value = false;
    }
}

    /* =========================
        REMINDERS
    ========================== */

    function addUnreadReminder(reminder: Event) {
        if (!unreadReminders.value.find(r => r.id === reminder.id)) {
            unreadReminders.value.push(reminder);
        }
    }

    function markAsRead(reminderId: string) {
        unreadReminders.value = unreadReminders.value.filter(r => r.id !== reminderId);
    }

    /* =========================
        STOCK ALERTS
    ========================== */

    function addStockAlert(alert: StockNotification) {
        if (
        !unreadStockAlerts.value.find(
            a => a.product_id === alert.product_id
        )
        ) {
        unreadStockAlerts.value.push(alert);
        }
    }

    function markStockAsRead(productId: string) {
        unreadStockAlerts.value =
        unreadStockAlerts.value.filter(
            a => a.product_id !== productId
        );
    }

});