<template>
        <SectionCard
            title="Rappels"
            icon="alarm-clock"
            :showAdd="true"
            class="clickable-card dashboard-card dashboard-card--primary"
            @add="goToReminderCreate"
            @click="goToReminders"
        >
            <div class="d-flex flex-column ga-6">
                <div>
                    <div class="d-flex align-center justify-space-between mb-1">
                        <span class="text-subtitle-2 text-grey-darken-1"
                            >En retard</span
                        >
                        <v-chip size="x-small" color="error" variant="flat">
                            {{ remindersOverdue.length }}
                        </v-chip>
                    </div>
                    <v-list
                        v-if="remindersOverdue.length"
                        density="compact"
                        class="d-flex flex-column ga-2"
                    >
                        <v-list-item
                            v-for="reminder in remindersOverdue.slice(0, 3)"
                            :key="reminder.id"
                            class="rounded-lg bg-grey-lighten-4 px-3 py-2"
                        >
                            <v-list-item-title class="text-subtitle-2">{{
                                reminder.name
                            }}</v-list-item-title>
                            <v-list-item-subtitle
                                class="text-caption text-grey-darken-1"
                            >
                                <span class="d-none d-md-inline">
                                    {{
                                        formatDateLong(
                                            getReminderDate(reminder),
                                        )
                                    }}
                                </span>
                                <span class="d-inline d-md-none">
                                    {{
                                        formatDateMobile(
                                            getReminderDate(reminder),
                                        )
                                    }}
                                </span>
                            </v-list-item-subtitle>
                            <template #append>
                                <ActionButtons
                                    class="d-none d-md-flex align-center ga-1"
                                    mode="inline"
                                    button-size="x-small"
                                    :actions="getEventActions(reminder)"
                                />
                                <ActionButtons
                                    class="d-md-none"
                                    mode="auto"
                                    button-size="x-small"
                                    menu-button-size="x-small"
                                    :actions="getEventActions(reminder)"
                                />
                            </template>
                        </v-list-item>
                    </v-list>
                    <p v-else class="empty-state">Aucun rappel en retard</p>
                </div>
                <div>
                    <div class="d-flex align-center justify-space-between mb-1">
                        <span class="text-subtitle-2 text-grey-darken-1"
                            >À venir</span
                        >
                        <v-chip size="x-small" color="primary" variant="flat">
                            {{ remindersUpcoming.length }}
                        </v-chip>
                    </div>
                    <v-list
                        v-if="remindersUpcoming.length"
                        density="compact"
                        class="d-flex flex-column ga-2"
                    >
                        <v-list-item
                            v-for="reminder in remindersUpcoming.slice(0, 3)"
                            :key="reminder.id"
                            class="rounded-lg bg-grey-lighten-4 px-3 py-2"
                        >
                            <v-list-item-title class="text-subtitle-2">{{
                                reminder.name
                            }}</v-list-item-title>
                            <v-list-item-subtitle
                                class="text-caption text-grey-darken-1"
                            >
                                <span class="d-none d-md-inline">
                                    {{
                                        formatDateLong(
                                            getReminderDate(reminder),
                                        )
                                    }}
                                </span>
                                <span class="d-inline d-md-none">
                                    {{
                                        formatDateMobile(
                                            getReminderDate(reminder),
                                        )
                                    }}
                                </span>
                            </v-list-item-subtitle>
                            <template #append>
                                <ActionButtons
                                    class="d-none d-md-flex align-center ga-1"
                                    mode="inline"
                                    button-size="x-small"
                                    :actions="getEventActions(reminder)"
                                />
                                <ActionButtons
                                    class="d-md-none"
                                    mode="auto"
                                    button-size="x-small"
                                    menu-button-size="x-small"
                                    :actions="getEventActions(reminder)"
                                />
                            </template>
                        </v-list-item>
                    </v-list>
                    <p v-else class="empty-state">Aucun rappel à venir</p>
                </div>
            </div>
        </SectionCard>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import { SectionCard, ActionButtons } from "@/components";
import { useRoute, useRouter } from "vue-router";
import { eventsApi } from "@/api/events";
import { getActiveHorseId } from "@/libs/horseProfile";
import {
    sortByDateAsc,
    startOfDay,
    formatDateLong,
    formatDateMobile,
} from "@/libs/date";
import type { Event, SelectedKind } from "@/types";

const route = useRoute();
const router = useRouter();

const reminders = ref<Event[]>([]);
const selectedKind = ref<SelectedKind>(null);
const selectedEvent = ref<Event | null>(null);
const deleteDialogOpen = ref(false);

const routeHorseId = computed(() => route.params.id as string | undefined);
const horseId = getActiveHorseId(routeHorseId.value);

const goToReminders = () => {
    router.push({ name: "Reminders" });
};

const getReminderDate = (reminder: Event): string =>
    reminder.next_reminder_date || reminder.event_date;

const loadReminders = async () => {
    try {
        reminders.value = await eventsApi.getReminders(horseId);
    } catch (error) {
        console.error("Error loading reminders:", error);
    }
};

const remindersOverdue = computed(() => {
    const today = startOfDay(new Date());
    return sortByDateAsc(
        reminders.value.filter(
            (reminder) => new Date(getReminderDate(reminder)) < today,
        ),
        getReminderDate,
    );
});

const remindersUpcoming = computed(() => {
    const today = startOfDay(new Date());
    return sortByDateAsc(
        reminders.value.filter(
            (reminder) => new Date(getReminderDate(reminder)) >= today,
        ),
        getReminderDate,
    );
});

const goToReminderCreate = () => {
    router.push(
        horseId
            ? { path: "/reminders/new", query: { horseId } }
            : "/reminders/new",
    );
};

const openEventDetails = (event: Event) => {
    router.push({ name: "EventDetails", params: { id: event.id } });
};

const openEventEdit = (event: Event) => {
    router.push({ name: "EventEdit", params: { id: event.id } });
};

const openEventDelete = (event: Event) => {
    selectedKind.value = "event";
    selectedEvent.value = event;
    deleteDialogOpen.value = true;
};

onMounted(loadReminders);

watch(
    () => route.params.id,
    () => {
        loadReminders();
    },
);

type ReminderAction = {
    key: string;
    title: string;
    icon: string;
    color?: string;
    disabled: boolean;
    onClick?: () => void;
};

const getEventActions = (event: Event): ReminderAction[] => [
    {
        key: "view",
        title: "Voir",
        icon: "mdi-eye",
        disabled: false,
        onClick: () => openEventDetails(event),
    },
    {
        key: "edit",
        title: "Éditer",
        icon: "mdi-pencil",
        disabled: false,
        onClick: () => openEventEdit(event),
    },
    {
        key: "delete",
        title: "Supprimer",
        icon: "mdi-trash-can",
        color: "error",
        disabled: false,
        onClick: () => openEventDelete(event),
    },
];
</script>

<style scoped>
.clickable-card {
    cursor: pointer;
}
</style>
