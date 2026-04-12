<template>
    <v-card rounded="xl" elevation="0" class="pa-4 border-light bg-white">
      <div class="d-flex align-center justify-space-between mb-3">
        <div class="d-flex align-center ga-2">
            <v-icon icon="mdi-alarm-check" size="24" color="#2E4B36" />
            <span class="text-h6 font-weight-bold" :style="{ color: '#2E4B36' }">Rappels</span>
        </div>
        <v-btn 
            icon="mdi-plus" 
            size="small" 
            color="#2E4B36"
            elevation="1"
            :to="{ name: 'ReminderCreate' }"
        />
      </div>

      <div v-if="remindersUpcoming.length" class="ga-2 d-flex flex-column">
        <div v-for="reminder in remindersUpcoming.slice(0, 2)" :key="reminder.id">
            <v-card variant="tonal" color="#6B4F3A" rounded="lg" class="pa-2 d-flex align-center">
                <v-icon icon="mdi-calendar-clock" size="16" class="me-2" />
                <div class="d-flex flex-column">
                    <span class="text-caption font-weight-bold">{{ reminder.name }}</span>
                    <span class="text-overline" :style="{ fontSize: '0.6rem !important', lineHeight: 1}">
                        {{ formatDateLong(getReminderDate(reminder)) }}
                    </span>
                </div>
            </v-card>
        </div>
        
       <div class="d-flex justify-center">
          <v-btn
            rounded="xl"
            variant="flat"
            :to="{ name: 'Reminders' }"
            class="mt-4"
            :style="{
              backgroundColor: '#6B4F3A',
              color: '#FAF9F7'
            }"
          >
            Voir tous les rappels
            <v-icon end>mdi-arrow-right</v-icon>
          </v-btn>
        </div>
      </div>

      <v-alert v-else type="info" variant="tonal" density="compact" class="text-caption">
        Aucun rappel à prévoir
      </v-alert>
    </v-card>
</template>
  
  <script setup lang="ts">
  import { computed, onMounted, watch } from "vue";
  import { useHorsesStore } from "@/stores/HorsesStore";
  import { useEventsStore } from "@/stores/EventsStore";
  import { logger } from "@/services/LoggerService";
  import {
    sortByDateAsc,
    startOfDay,
    formatDateLong,
  } from "@/libs/date";
  import type { Event } from "@/types";
  import { ref } from "vue";
  
  const horsesStore = useHorsesStore();
  const eventsStore = useEventsStore();
  const reminders = ref<Event[]>([]);
  
  const getReminderDate = (reminder: Event): string =>
    reminder.next_reminder_date || reminder.event_date;
  
  const loadReminders = async () => {
    try {
      const horseId = horsesStore.horseId !== "all" ? horsesStore.horseId : undefined;
      reminders.value = horseId
        ? await eventsStore.fetchReminders(horseId)
        : await eventsStore.fetchReminders();
    } catch (error) {
      logger.error("Error loading reminders:", error);
      reminders.value = [];
    }
  };
  
  const remindersUpcoming = computed(() => {
    const today = startOfDay(new Date());
    return sortByDateAsc(
      reminders.value.filter(
        r => new Date(getReminderDate(r)) >= today
      ),
      getReminderDate,
    );
  });
  
  onMounted(loadReminders);
  
  watch(() => horsesStore.horseId, loadReminders);
  </script>