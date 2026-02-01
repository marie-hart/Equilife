<template>
        <SectionCard
            title="Santé"
            icon="house-chimney-medical"
            :showAdd="true"
            class="clickable-card dashboard-card dashboard-card--primary"
            @add="goToCareCreate"
            :to="goToHealth()"
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
                    <v-list-item-subtitle
                        class="text-caption text-grey-darken-1"
                    >
                        <span class="d-none d-md-inline">{{
                            formatDateLong(care.event_date)
                        }}</span>
                        <span class="d-inline d-md-none">{{
                            formatDateMobile(care.event_date)
                        }}</span>
                    </v-list-item-subtitle>
                    <template #append>
                        <div class="d-contents" @click.stop>
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
                        </div>
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
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import type { Event, SelectedKind, ActionButton } from "@/types";
import { SectionCard, ActionButtons } from "@/components";
import { getActiveHorseId } from "@/libs/horseProfile";
import {
    sortByDateAsc,
    startOfDay,
    formatDateLong,
    formatDateMobile,
    isSameDay,
} from "@/libs/date";
import { eventsApi } from "@/api/events";

const route = useRoute();
const router = useRouter();

const events = ref<Event[]>([]);
const selectedKind = ref<SelectedKind>(null);
const selectedEvent = ref<Event | null>(null);
const deleteDialogOpen = ref(false);

const careEvents = computed(() =>
    events.value.filter((event) => event.is_care),
);

const routeHorseId = computed(() => route.params.id as string | undefined);
const horseId = computed(() => getActiveHorseId(routeHorseId.value));

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
    const id = horseId.value;
    if (id) {
        router.push({ name: "HorseCareCreate", params: { id } });
        return;
    }
    router.push("/horses");
};

const goToHealth = () => {
    const id = horseId.value;
    if (id) {
        return { name: "HorseHealth", params: { id } };
    }
    return "/horses";
};

const loadCares = async () => {
    try {
        events.value = await eventsApi.getAll(horseId.value);
    } catch (error) {
        console.error("Error loading cares:", error);
        events.value = [];
    }
};

const openEventDetails = (event: Event) => {
    return { name: "EventDetails", params: { id: event.id } };
};

const openEventEdit = (event: Event) => {
    return { name: "EventEdit", params: { id: event.id } };
};

const openEventDelete = (event: Event) => {
    selectedKind.value = "event";
    selectedEvent.value = event;
    deleteDialogOpen.value = true;
};

const getEventActions = (event: Event): ActionButton[] => [
    {
        key: "view",
        title: "Voir",
        icon: "mdi-eye",
        disabled: false,
        to: openEventDetails(event),
    },
    {
        key: "edit",
        title: "Éditer",
        icon: "mdi-pencil",
        disabled: false,
        to: openEventEdit(event),
    },
    {
        key: "delete",
        title: "Supprimer",
        icon: "mdi-trash-can",
        color: "error",
        disabled: false,
        to: openEventDelete(event),
    },
];

onMounted(loadCares);

watch(
    () => route.params.id,
    () => {
        loadCares();
    },
);
</script>

<style scoped>
.clickable-card {
    cursor: pointer;
}
</style>
