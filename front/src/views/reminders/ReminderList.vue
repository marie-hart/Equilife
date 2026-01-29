<template>
    <div>
        <v-table v-if="items.length" density="compact">
            <thead>
                <tr>
                    <th class="d-none d-md-table-cell"></th>
                    <th class="d-none d-md-table-cell">Date</th>
                    <th class="d-none d-md-table-cell">Cheval</th>
                    <th class="d-none d-md-table-cell">Type</th>
                    <th class="d-none d-md-table-cell text-center">Actions</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="reminder in items" :key="reminder.id">
                    <td class="d-none d-md-table-cell py-3">
                        <v-avatar
                            size="10"
                            :color="getStatusColor(reminder)"
                            class="border border-white elevation-1"
                        />
                    </td>
                    <td class="d-none d-md-table-cell py-3">
                        <div>
                            <div class="text-caption text-grey-darken-1">
                                {{ formatDateLong(getReminderDate(reminder)) }}
                            </div>
                            <div class="text-subtitle-2">
                                {{ getReminderTitle(reminder) }}
                            </div>
                        </div>
                    </td>
                    <td class="d-none d-md-table-cell py-3 text-body-2">
                        {{ getHorseName(reminder.horse_id) }}
                    </td>
                    <td class="d-none d-md-table-cell py-3">
                        <v-chip
                            v-if="reminder.reminder_type"
                            size="x-small"
                            variant="flat"
                            color="grey-lighten-3"
                        >
                            {{ reminderTypeLabel(reminder.reminder_type) }}
                        </v-chip>
                    </td>
                    <td class="d-none d-md-table-cell py-3 text-center">
                        <ActionButtons
                            class="d-flex align-center justify-center ga-3"
                            mode="inline"
                            button-size="x-small"
                            :actions="getReminderActions(reminder)"
                        />
                    </td>
                    <td class="d-table-cell d-md-none py-3">
                        <v-avatar
                            size="10"
                            :color="getStatusColor(reminder)"
                            class="border border-white elevation-1"
                        />
                    </td>
                    <td class="d-table-cell d-md-none py-3 flex-grow-1">
                        <div class="flex-1">
                            <div class="text-caption text-grey-darken-1">
                                {{
                                    formatDateMobile(getReminderDate(reminder))
                                }}
                            </div>
                            <div class="text-subtitle-2">
                                {{ getReminderTitle(reminder) }}
                            </div>
                            <div class="text-body-2 text-grey-darken-1">
                                {{ getHorseName(reminder.horse_id) }}
                            </div>
                            <div class="d-flex align-center ga-2 mt-2">
                                <v-chip
                                    v-if="reminder.reminder_type"
                                    size="x-small"
                                    variant="flat"
                                    color="grey-lighten-3"
                                >
                                    {{
                                        reminderTypeLabel(
                                            reminder.reminder_type,
                                        )
                                    }}
                                </v-chip>
                            </div>
                        </div>
                    </td>
                    <td class="d-table-cell d-md-none py-3 px-2 text-no-wrap">
                        <ActionButtons
                            mode="auto"
                            button-size="x-small"
                            menu-button-size="x-small"
                            :actions="getReminderActions(reminder)"
                        />
                    </td>
                </tr>
            </tbody>
        </v-table>
        <p v-else class="empty-state">Aucun rappel pour le moment.</p>
    </div>
</template>

<script setup lang="ts">
import { ActionButtons } from "@/components";
import { formatDateLong, formatDateMobile, getReminderDate } from "@/libs/date";
import type { Event } from "@/types";

type ReminderAction = {
    key: string;
    title: string;
    icon: string;
    color?: string;
    disabled: boolean;
    onClick?: () => void;
};

defineProps<{
    items: Event[];
    getStatusColor: (reminder: Event) => string;
    getReminderTitle: (reminder: Event) => string;
    getHorseName: (horseId?: string) => string;
    reminderTypeLabel: (type?: Event["reminder_type"]) => string;
    getReminderActions: (reminder: Event) => ReminderAction[];
}>();
</script>
