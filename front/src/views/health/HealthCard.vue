<template>
    <v-col cols="12" sm="6" md="6" class="d-flex pa-0">
          <SectionCard
            title="Santé"
            icon="house-chimney-medical"
            :showAdd="true"
            class="clickable-card dashboard-card dashboard-card--primary"
            @add="goToCareCreate"
            @click="goToHealth"
          >
            <v-list
              v-if="todayCares.length"
              density="compact"
              class="d-flex flex-column ga-2"
            >
              <v-list-item
                v-for="care in todayCares"
                :key="care.id"
                class="rounded-lg bg-grey-lighten-4 px-3 py-2"
              >
                <v-list-item-title class="text-subtitle-2">{{
                  care.name
                }}</v-list-item-title>
                <v-list-item-subtitle class="text-caption text-grey-darken-1">
                  <span class="d-none d-md-inline">{{
                    formatDateLong(care.event_date)
                  }}</span>
                  <span class="d-inline d-md-none">{{
                    formatDateMobile(care.event_date)
                  }}</span>
                </v-list-item-subtitle>
                <template #append>
                  <ActionButtons
                    class="d-none d-md-flex align-center ga-1"
                    mode="inline"
                    button-size="x-small"
                    :actions="getEventActions(care)"
                  />
                  <ActionButtons
                    class="d-md-none"
                    mode="auto"
                    button-size="x-small"
                    menu-button-size="x-small"
                    :actions="getEventActions(care)"
                  />
                </template>
              </v-list-item>
            </v-list>
            <p v-else-if="nextCare" class="text-body-2 text-grey-darken-1 mb-0">
              Prochain soin le
              <span class="d-none d-md-inline">{{
                formatDateLong(nextCare.event_date)
              }}</span>
              <span class="d-inline d-md-none">{{
                formatDateMobile(nextCare.event_date)
              }}</span>
              — {{ nextCare.name }}
            </p>
            <p v-else class="empty-state">Aucun soin prévu</p>
          </SectionCard>
        </v-col>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { useRouter } from "vue-router";
import type { Event } from "../../types/index.js";
import { SectionCard } from "../../components";
import { ActionButtons } from "../../components"
import { getActiveHorseId } from "../../utils/horseProfile.js"
import { sortByDateAsc, startOfDay, formatDateLong, formatDateMobile, isSameDay } from "../../utils/date.js"
import { getEventActions } from "../../utils/action.js"


const router = useRouter();

const events = ref<Event[]>([]);

const careEvents = computed(() =>
  events.value.filter((event) => event.is_care),
);

const todayCares = computed(() => {
  const today = startOfDay(new Date());
  return sortByDateAsc(
    careEvents.value.filter((event) => isSameDay(event.event_date, today)),
  );
});

const nextCare = computed(() => {
  if (todayCares.value.length) {
    return null;
  }
  const today = startOfDay(new Date());
  const upcoming = careEvents.value.filter(
    (event) => new Date(event.event_date) > today,
  );
  return sortByDateAsc(upcoming)[0] ?? null;
});

const goToCareCreate = () => {
  const horseId = getActiveHorseId();
  if (horseId) {
    router.push({ name: "HorseCareCreate", params: { id: horseId } });
    return;
  }
  router.push("/horses");
};

const goToHealth = () => {
  const horseId = getActiveHorseId();
  if (horseId) {
    router.push({ name: "HorseHealth", params: { id: horseId } });
    return;
  }
  router.push("/horses");
};
</script>

<style scoped>
.clickable-card {
  cursor: pointer;
}
</style>