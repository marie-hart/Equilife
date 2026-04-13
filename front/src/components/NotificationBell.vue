<template>
  <v-menu 
    v-model="menuOpen" 
    :close-on-content-click="false" 
    location="bottom end" 
    offset="10"
  >
    <template #activator="{ props: menuProps }">
      <v-btn 
        icon 
        variant="text" 
        color="#1F3D2B" 
        v-bind="menuProps" 
      >
        <v-badge
          :model-value="notificationStore.hasUnread"
          color="error"
          dot
          location="top right"
          offset-x="3"
          offset-y="3"
        >
          <v-icon>
            {{ notificationStore.isEnabled ? 'mdi-bell' : 'mdi-bell-outline' }}
          </v-icon>
        </v-badge>
      </v-btn>
    </template>

    <v-card v-if="notificationStore.needsInstallation" max-width="300" class="pa-4 rounded-lg">
      <div class="text-subtitle-2 mb-2 font-weight-bold">Activer les notifications</div>
      <p class="text-caption mb-3 text-grey-darken-1">
        Pour recevoir des rappels sur votre iPhone, ajoutez l'app à votre écran d'accueil :
      </p>
      <div class="d-flex align-center text-caption mb-2">
        <v-icon size="small" class="mr-2">mdi-export-variant</v-icon>
        1. Appuyez sur "Partager" en bas de Safari.
      </div>
      <div class="d-flex align-center text-caption">
        <v-icon size="small" class="mr-2">mdi-plus-box-outline</v-icon>
        2. Choisissez "Sur l'écran d'accueil".
      </div>
    </v-card>

    <v-card v-else width="320" class="rounded-xl pa-2">
      <div class="px-3 pt-2 pb-1">
        <div class="d-flex align-center justify-space-between">
          <span class="text-caption font-weight-bold" style="color: #554338;">
            Notifications
          </span>
          <v-switch
            :model-value="notificationsToggle"
            :loading="notificationStore.isSubscribing"
            color="#2E4B36"
            density="compact"
            hide-details
            inset
            @update:model-value="onToggleNotifications"
          />
        </div>
      </div>
      <v-divider class="mb-1" />

      <v-alert
        v-if="notificationStore.permission === 'denied'"
        type="warning"
        variant="tonal"
        density="compact"
        class="mx-2 mb-2"
      >
        Notifications bloquées par le navigateur. Autorisez-les dans les réglages du site puis réactivez le switch.
      </v-alert>

      <v-list
        v-if="notificationStore.unreadReminders.length > 0 || notificationStore.unreadStockAlerts.length > 0"
        lines="two"
      >
        <v-list-subheader
          v-if="notificationStore.unreadReminders.length > 0"
          class="text-uppercase font-weight-bold text-caption"
        >
          Rappels non traités
        </v-list-subheader>
        
        <v-list-item
          v-for="reminder in notificationStore.unreadReminders"
          :key="reminder.id"
          :title="reminder.name"
          :subtitle="formatDate(reminder.event_date)"
          link
          class="rounded-lg mb-1"
          @click="handleReminderAction(reminder)"
        >
          <template #prepend>
            <v-avatar color="#efe5d9" size="40">
              <v-icon color="#554338" size="20">mdi-bell-ring</v-icon>
            </v-avatar>
          </template>
        </v-list-item>

        <v-list-subheader
          v-if="notificationStore.unreadStockAlerts.length > 0"
          class="text-uppercase font-weight-bold text-caption"
        >
          Alertes stock
        </v-list-subheader>

        <v-list-item
          v-for="alert in notificationStore.unreadStockAlerts"
          :key="alert.id"
          :title="alert.title"
          :subtitle="alert.body"
          link
          class="rounded-lg mb-1"
          @click="handleStockAction(alert)"
        >
          <template #prepend>
            <v-avatar color="#efe5d9" size="40">
              <v-icon color="#554338" size="20">mdi-package-variant-closed-alert</v-icon>
            </v-avatar>
          </template>
        </v-list-item>
      </v-list>
      
      <div v-else class="text-center py-6">
        <v-icon size="48" color="grey-lighten-2" class="mb-2">mdi-bell-check-outline</v-icon>
        <div class="text-body-2 text-grey">Tout est à jour !</div>
      </div>
      
      <v-divider class="my-2" />
      
      <v-btn 
        variant="text" 
        block 
        class="text-none" 
        color="primary"
        @click="goToAllReminders"
      >
        Voir tous les rappels
      </v-btn>
    </v-card>
  </v-menu>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRouter } from "vue-router";
import { useHorsesStore } from "@/stores/HorsesStore";
import { useNotificationStore } from "@/stores/NotificationStore";
import type { Event as HorseEvent, StockNotification } from "@/types";

const notificationStore = useNotificationStore();
const horsesStore = useHorsesStore();
const router = useRouter();
const menuOpen = ref(false);

const notificationsToggle = computed(() => notificationStore.isEnabled);

const onToggleNotifications = async (enabled: boolean | null) => {
  if (enabled === null) return;
  if (enabled) {
    await notificationStore.enableNotifications();
  } else {
    notificationStore.disableNotifications();
  }
};

const handleReminderAction = (reminder: HorseEvent) => {
  notificationStore.markAsRead(reminder.id);
  menuOpen.value = false;
  if (reminder.horse_id) horsesStore.sethorseId(reminder.horse_id);
  router.push({ name: "Reminders", query: { reminderId: reminder.id } });
};

const handleStockAction = (alert: StockNotification) => {
  notificationStore.markStockAsRead(alert.id);
  menuOpen.value = false;
  router.push({ name: "ProductDetails", params: { id: alert.product_id } });
};

const goToAllReminders = () => {
  menuOpen.value = false;
  router.push({ name: 'Reminders' });
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('fr-FR', { 
    day: 'numeric', 
    month: 'short' 
  });
};
</script>