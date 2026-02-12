<template>
    <SectionCard
      title="Rappels"
      icon="alarm-clock"
    >
    <template #action>
      <v-btn   
          icon="mdi-plus"
          class="elevation-0 px-2"
          size="small"
          :style="{
              backgroundColor: '#f2e8dc',
              color: '#554338'
          }"
          :to="{ name: 'ReminderCreate', params: { id: horsesStore.horseId ?? undefined } }"
      />
    </template>
    <v-card
          variant="flat"
          rounded="lg"
          class="pa-4 border-md"
    >
      <div class="d-flex flex-column ga-4">
        <v-chip
          prepend-icon="mdi-alarm-light"
          size="small"
          variant="flat"
          class="align-self-start"
          :style="{
            backgroundColor: '#e3b077',
            color: '#3c3226'
          }"
        >
            À prévoir
        </v-chip>
  
        <div v-if="remindersUpcoming.length">
          <div
            v-for="reminder in remindersUpcoming.slice(0, 1)"
            :key="reminder.id"
            class="mb-2"
          >
            <v-card
                :to="{ name: 'ActivityDetails', params: { id: reminder.id } }"
                variant="tonal"
                rounded="lg"
                class="pa-3 d-flex align-center justify-space-between"
                :style="{
                    backgroundColor: '#fdfaf6', // Fond léger pour l'item
                    color: '#554338',
                    border: 'none'
                }"
                flat
            >
                <div class="d-flex flex-column">
                    <span class="text-body-2 font-weight-medium">
                        {{ reminder.name }}
                    </span>
                    <span class="text-caption" :style="{ color: '#7a6e61' }">
                        {{ formatDateLong(getReminderDate(reminder)) }}
                    </span>
                </div>

                <v-icon size="20" :style="{ color: '#554338' }">mdi-chevron-right</v-icon>
            </v-card>
          </div>
        </div>
  
        <v-alert
          v-else
          type="info"
          variant="tonal"
          density="comfortable"
          text="Aucun rappel à prévoir"
        />
      </div>
    </v-card>
    <div class="d-flex justify-center">
          <v-btn
            rounded="lg"
            variant="flat"
            :to="{ name: 'Reminders' }"
            class="mt-4"
            :style="{
              backgroundColor: '#f2e8dc',
              color: '#554338'
            }"
          >
            Voir tous les rappels
            <v-icon end>mdi-arrow-right</v-icon>
          </v-btn>
        </div>
    </SectionCard>
  </template>
  
  
  <script setup lang="ts">
  import { computed, onMounted, watch } from "vue";
  import { SectionCard } from "@/components";
  import { useHorsesStore } from "@/stores/HorsesStore";
  import { eventsApi } from "@/api/events";
  import {
    sortByDateAsc,
    startOfDay,
    formatDateLong,
  } from "@/libs/date";
  import type { Event } from "@/types";
  import { ref } from "vue";
  
  const horsesStore = useHorsesStore();
  const reminders = ref<Event[]>([]);
  
  const getReminderDate = (reminder: Event): string =>
    reminder.next_reminder_date || reminder.event_date;
  
  const loadReminders = async () => {
    try {
      const horseId = horsesStore.horseId !== "all" ? horsesStore.horseId : undefined;
      reminders.value = horseId
        ? await eventsApi.getReminders(horseId)
        : await eventsApi.getReminders();
    } catch (error) {
      console.error("Error loading reminders:", error);
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