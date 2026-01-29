<template>
    <div>
        <div class="text-subtitle-1 mb-2">Journal</div>
        <div class="pt-2">
            <div v-if="groupedActivities.length">
                <div
                    v-for="group in groupedActivities"
                    :key="group.key"
                    class="mb-4"
                >
                    <div class="d-flex flex-column ga-4">
                        <div v-for="activity in group.items" :key="activity.id">
                            <v-card
                                variant="outlined"
                                class="overflow-hidden d-flex flex-column w-100"
                                :style="{ maxWidth: cardMaxWidth }"
                                height="190"
                            >
                                <v-card-title
                                    class="bg-primary text-white text-subtitle-1 d-flex align-center justify-space-between"
                                >
                                    <span>{{
                                        activity.activity_type || activity.name
                                    }}</span>
                                    <ActionButtons
                                        class="d-md-none"
                                        mode="auto"
                                        button-size="x-small"
                                        menu-button-size="x-small"
                                        :actions="getActivityActions(activity)"
                                    />
                                </v-card-title>
                                <v-card-text class="flex-grow-1 pt-3">
                                    <div class="text-body-2 text-grey-darken-1">
                                        <span class="d-none d-md-inline">{{
                                            formatDateLong(activity.event_date)
                                        }}</span>
                                        <span class="d-inline d-md-none">{{
                                            formatDateMobile(
                                                activity.event_date,
                                            )
                                        }}</span>
                                        <span
                                            v-if="
                                                activity.activity_duration_minutes
                                            "
                                        >
                                            •
                                            {{
                                                activity.activity_duration_minutes
                                            }}
                                            min
                                        </span>
                                        <span
                                            v-if="activity.activity_intensity"
                                        >
                                            •
                                            {{
                                                intensityLabel(
                                                    activity.activity_intensity,
                                                )
                                            }}
                                        </span>
                                    </div>
                                    <div
                                        v-if="
                                            activity.activity_comment ||
                                            activity.description
                                        "
                                        class="text-caption text-grey-darken-1 mt-2"
                                    >
                                        {{
                                            activity.activity_comment ||
                                            activity.description
                                        }}
                                    </div>
                                </v-card-text>
                                <v-card-actions class="mt-auto justify-end">
                                    <ActionButtons
                                        class="d-none d-md-flex align-center ga-2"
                                        mode="inline"
                                        button-size="x-small"
                                        :actions="getActivityActions(activity)"
                                    />
                                </v-card-actions>
                            </v-card>
                        </div>
                    </div>
                </div>
            </div>
            <p v-else class="empty-state">Aucune activité enregistrée.</p>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ActionButtons } from "@/components";
import { formatDateLong, formatDateMobile } from "@/libs/date";
import type { Event } from "@/types";

type ActivityAction = {
    key: string;
    title: string;
    icon: string;
    color?: string;
    disabled: boolean;
    onClick?: () => void;
};

type ActivityGroup = {
    key: string;
    label: string;
    items: Event[];
};

defineProps<{
    groupedActivities: ActivityGroup[];
    cardMaxWidth: string;
    getActivityActions: (activity: Event) => ActivityAction[];
    intensityLabel: (value?: string) => string;
}>();
</script>
