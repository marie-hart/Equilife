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
                                class="d-flex flex-column w-100 pa-3"
                                :style="{ maxWidth: cardMaxWidth }"
                            >
                                <div
                                    class="d-flex align-center justify-space-between mb-3"
                                >
                                    <div class="text-h6">
                                        {{
                                            activity.activity_type ||
                                            activity.name
                                        }}
                                    </div>
                                    <ActionButtons
                                        mode="auto"
                                        button-size="x-small"
                                        menu-button-size="x-small"
                                        :actions="getActivityActions(activity)"
                                    />
                                </div>
                                <v-card-text class="flex-grow-1 pa-0">
                                    <div class="text-body-2 text-primary">
                                        <span class="d-none d-md-inline">{{
                                            formatDateLong(activity.event_date)
                                        }}</span>
                                        <span class="d-inline d-md-none">{{
                                            formatDateMobile(
                                                activity.event_date,
                                            )
                                        }}</span>
                                    </div>
                                    <div class="d-flex flex-wrap ga-2 mt-2">
                                        <v-chip
                                            v-if="
                                                activity.activity_duration_minutes
                                            "
                                            size="small"
                                            variant="outlined"
                                        >
                                            {{
                                                activity.activity_duration_minutes
                                            }}
                                            min
                                        </v-chip>
                                        <v-chip
                                            v-if="activity.activity_intensity"
                                            size="small"
                                            variant="outlined"
                                        >
                                            {{
                                                intensityLabel(
                                                    activity.activity_intensity,
                                                )
                                            }}
                                        </v-chip>
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
import type { ActivityAction, ActivityGroup, Event } from "@/types";

defineProps<{
    groupedActivities: ActivityGroup[];
    cardMaxWidth: string;
    getActivityActions: (activity: Event) => ActivityAction[];
    intensityLabel: (value?: string) => string;
}>();
</script>
