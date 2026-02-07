<template>
    <SectionCard
      title="Rappels"
      icon="alarm-clock"
      :showAdd="true"
      :to="{ name: 'ReminderCreate', params: { id: horseId } }"
    >
    <v-card
          variant="outlined"
          rounded="lg"
          class="pa-4 border-md"
      >
      <div class="d-flex flex-column ga-4">
        <!-- Chip À prévoir -->
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
  
        <!-- Liste des rappels -->
        <v-list
          v-if="remindersUpcoming.length"
          density="compact"
        >
          <v-list-item
            v-for="reminder in remindersUpcoming.slice(0, 1)"
            :key="reminder.id"
            @click="openEventDetails(reminder)"
          >
            <v-list-item-title class="text-body-2">
              {{ reminder.name }}
            </v-list-item-title>
  
            <v-list-item-subtitle class="text-caption">
              {{ formatDateLong(getReminderDate(reminder)) }}
            </v-list-item-subtitle>
  
            <template #append>
              <v-icon size="18">mdi-chevron-right</v-icon>
            </template>
          </v-list-item>
        </v-list>
  
        <v-alert
          v-else
          type="info"
          variant="tonal"
          density="comfortable"
          text="Aucun rappel à prévoir"
        />
      </div>
    </v-card>
    <!-- Bouton voir tous -->
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
  import { computed, onMounted, ref, watch } from "vue";
  import { SectionCard } from "@/components";
  import { useRoute, useRouter } from "vue-router";
  import { eventsApi } from "@/api/events";
  import { getActiveHorseId } from "@/libs/horseProfile";
  import {
    sortByDateAsc,
    startOfDay,
    formatDateLong,
  } from "@/libs/date";
  import type { Event } from "@/types";
  
  const route = useRoute();
  const router = useRouter();
  
  const reminders = ref<Event[]>([]);
  
  const routeHorseId = computed(() => route.params.id as string | undefined);
  const horseId = getActiveHorseId(routeHorseId.value);
  
  const getReminderDate = (reminder: Event): string =>
    reminder.next_reminder_date || reminder.event_date;
  
  const loadReminders = async () => {
    try {
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
  
  
  const openEventDetails = (event: Event) => {
    router.push({ name: "EventDetails", params: { id: event.id } });
  };
  
  onMounted(loadReminders);
  
  watch(() => route.params.id, loadReminders);
  
  // Styles partagés boutons
  const actionBtnStyle = {
    backgroundColor: "#f2e8dc",
    color: "#554338",
  };
  </script>
  