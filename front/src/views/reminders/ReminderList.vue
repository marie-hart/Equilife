<template>
    <v-card 
        variant="flat" 
        rounded="lg" 
        class="border-md"
        :style="{ borderColor: '#efe5d9' }"
    >
        <v-table v-if="items.length" density="comfortable">
            <thead>
                <tr :style="{ backgroundColor: '#fdfaf6' }">
                    <th class="text-left py-3 px-4">Statut</th>
                    <th class="text-left py-3 px-4">Rappel</th>
                    <th class="text-left py-3 px-4 d-none d-md-table-cell">Cheval</th>
                    <th class="text-left py-3 px-4 d-none d-md-table-cell">Type</th>
                    <th class="text-center py-3 px-4">Actions</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="reminder in items" :key="reminder.id" class="border-b-sm">
                    <td class="py-3 px-4">
                        <v-avatar
                            size="12"
                            :color="getStatusColor(reminder)"
                            class="elevation-1"
                        />
                    </td>
                    
                    <td class="py-3 px-4 d-none d-md-table-cell">
                        <div class="text-body-2 font-weight-medium" :style="{ color: '#3c3226' }">
                            {{ getReminderTitle(reminder) }}
                        </div>
                        <div class="text-caption" :style="{ color: '#7a6e61' }">
                            {{ formatDateLong(getReminderDate(reminder)) }}
                        </div>
                    </td>

                    <td class="d-table-cell d-md-none py-3 px-4">
                        <div class="text-subtitle-2 font-weight-bold" :style="{ color: '#3c3226' }">
                            {{ getReminderTitle(reminder) }}
                        </div>
                        <div class="text-caption mb-1" :style="{ color: '#7a6e61' }">
                            {{ formatDateMobile(getReminderDate(reminder)) }}
                        </div>
                        <div class="text-body-2 mb-1" :style="{ color: '#554338' }">
                            {{ getHorseName(reminder.horse_id) }}
                        </div>
                        <v-chip
                            v-if="reminder.reminder_type"
                            size="x-small"
                            variant="flat"
                            :style="{ backgroundColor: '#f2e8dc', color: '#554338' }"
                            class="font-weight-medium"
                        >
                            {{ reminderTypeLabel(reminder.reminder_type) }}
                        </v-chip>
                    </td>

                    <td class="py-3 px-4 d-none d-md-table-cell text-body-2" :style="{ color: '#554338' }">
                        {{ getHorseName(reminder.horse_id) }}
                    </td>
                    
                    <td class="py-3 px-4 d-none d-md-table-cell">
                        <v-chip
                            v-if="reminder.reminder_type"
                            size="small"
                            variant="flat"
                            :style="{ backgroundColor: '#f2e8dc', color: '#554338' }"
                            class="font-weight-medium"
                        >
                            {{ reminderTypeLabel(reminder.reminder_type) }}
                        </v-chip>
                    </td>

                    <td class="py-3 px-4 text-center">
                        <ActionButtons
                            class="d-flex align-center justify-center ga-1"
                            mode="auto"
                            button-size="small"
                            :actions="getReminderActions(reminder)"
                        />
                    </td>
                </tr>
            </tbody>
        </v-table>
        
        <div v-else class="text-center pa-10" :style="{ color: '#7a6e61' }">
            <v-icon size="40" class="mb-4">mdi-calendar-blank</v-icon>
            <p class="text-body-1">Aucun rappel pour le moment.</p>
        </div>
    </v-card>
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
    to?: object; // Ajout pour la navigation
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

<style scoped>
/* Ajustement de la hauteur des lignes pour un design plus aéré */
.v-table >>> tbody tr {
    height: 60px !important;
}
.border-b-sm {
    border-bottom: 1px solid #efe5d9;
}
</style>