import { defineStore } from "pinia";
import { ref } from "vue";
import { careHistoryApi, eventsApi } from "@/api/events";
import type { CareHistoryEntry, CreateEventDto, Event } from "@/types";

const ALL_KEY = "all";

function cacheKey(horseId?: string) {
    return horseId && horseId !== "all" ? horseId : ALL_KEY;
}

export const useEventsStore = defineStore("events", () => {
    const eventsByHorse = ref<Record<string, Event[]>>({});
    const remindersByHorse = ref<Record<string, Event[]>>({});
    const careHistoryByHorse = ref<Record<string, CareHistoryEntry[]>>({});

    function clearAllCaches() {
        eventsByHorse.value = {};
        remindersByHorse.value = {};
        careHistoryByHorse.value = {};
    }

    async function fetchEvents(horseId?: string, forceRefresh = false) {
        const key = cacheKey(horseId);
        if (!forceRefresh && eventsByHorse.value[key]) {
            return eventsByHorse.value[key];
        }
        const data = await eventsApi.getAll(horseId);
        eventsByHorse.value[key] = data;
        return data;
    }

    async function fetchReminders(horseId?: string, forceRefresh = false) {
        const key = cacheKey(horseId);
        if (!forceRefresh && remindersByHorse.value[key]) {
            return remindersByHorse.value[key];
        }
        const data = await eventsApi.getReminders(horseId);
        remindersByHorse.value[key] = data;
        return data;
    }

    async function fetchCareHistory(horseId?: string, forceRefresh = false) {
        const key = cacheKey(horseId);
        if (!forceRefresh && careHistoryByHorse.value[key]) {
            return careHistoryByHorse.value[key];
        }
        const data = await careHistoryApi.getAll(horseId);
        careHistoryByHorse.value[key] = data;
        return data;
    }

    async function createEvent(data: CreateEventDto) {
        const created = await eventsApi.create(data);
        clearAllCaches();
        return created;
    }

    async function updateEvent(id: string, data: Partial<CreateEventDto>) {
        const updated = await eventsApi.update(id, data);
        clearAllCaches();
        return updated;
    }

    async function deleteEvent(id: string) {
        await eventsApi.delete(id);
        clearAllCaches();
    }

    async function markCareDone(id: string, eventDate: string) {
        const entry = await eventsApi.markCareDone(id, eventDate);
        clearAllCaches();
        return entry;
    }

    return {
        clearAllCaches,
        fetchEvents,
        fetchReminders,
        fetchCareHistory,
        createEvent,
        updateEvent,
        deleteEvent,
        markCareDone,
    };
});
