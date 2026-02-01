import { ref, computed, onMounted, watch } from "vue";
import { useRoute } from "vue-router";
import { horsesApi } from "@/api/horses";
import { getStoredHorseId } from "@/libs/horseProfile";
import type { Horse } from "@/types";

export const useHorseSelection = (options?: { useRouteHorseId?: boolean }) => {
    const route = useRoute();
    const useRouteHorseId = options?.useRouteHorseId !== false;

    const horses = ref<Horse[]>([]);
    const selectedHorseId = ref<string>("all");
    const horseId = computed(() =>
        useRouteHorseId ? (route.params.id as string | undefined) : undefined,
    );

    const horseOptions = computed(() =>
        horses.value.map((h) => ({ title: h.name, value: h.id })),
    );

    const horseById = computed(
        () => new Map(horses.value.map((horse) => [horse.id, horse])),
    );
    const getHorseNameById = (id?: string): string | undefined =>
        id ? horseById.value.get(id)?.name : undefined;

    const getHorseName = (): string => {
        if (!horseId.value) {
            return "Cheval inconnu";
        }
        return horseById.value.get(horseId.value)?.name ?? "Cheval inconnu";
    };

    const horseFilterOptions = computed(() => [
        { title: "Tous les chevaux", value: "all" },
        ...horseOptions.value,
    ]);

    const loadHorses = async () => {
        horses.value = await horsesApi.getAll();
    };

    const setHorseFromContext = () => {
        if (!useRouteHorseId) {
            return;
        }
        const routeHorseId = route.params.id as string | undefined;
        if (routeHorseId) {
            selectedHorseId.value = routeHorseId;
            return;
        }

        const stored = getStoredHorseId();
        if (stored) {
            selectedHorseId.value = stored;
        }
    };

    const getHorseIdsFromQuery = (): string[] => {
        const queryHorseId = route.query.horseId;
        if (typeof queryHorseId === "string" && queryHorseId) {
            return [queryHorseId];
        }
        const stored = getStoredHorseId();
        return stored ? [stored] : [];
    };

    const getHorseIdsFromParamsOrStored = (): string[] => {
        const routeHorseId = route.params.id as string | undefined;
        if (routeHorseId) {
            return [routeHorseId];
        }
        const stored = getStoredHorseId();
        return stored ? [stored] : [];
    };

    const setHorseFromParamsOrStored = (fallback = "") => {
        const horseIds = getHorseIdsFromParamsOrStored();
        selectedHorseId.value = horseIds[0] ?? fallback;
    };

    const setHorseFromQueryOrStored = (fallback = "") => {
        const horseIds = getHorseIdsFromQuery();
        selectedHorseId.value = horseIds[0] ?? fallback;
    };

    onMounted(async () => {
        await loadHorses();
        setHorseFromContext();
    });

    watch(
        () => route.params.id,
        () => {
            setHorseFromContext();
        },
    );

    return {
        horses,
        selectedHorseId,
        horseFilterOptions,
        horseId,
        getHorseName,
        getHorseNameById,
        horseById,
        horseOptions,
        loadHorses,
        getHorseIdsFromQuery,
        getHorseIdsFromParamsOrStored,
        setHorseFromParamsOrStored,
        setHorseFromQueryOrStored,
    };
};
