import { startOfDay, isSameDay, getReminderDate } from "@/libs/date";
import type { Event } from "@/types";

export const getStatusColor = (
    reminder: Event,
): "error" | "warning" | "success" => {
    const today = startOfDay(new Date());
    if (isSameDay(getReminderDate(reminder), today)) {
        return "warning";
    }
    return new Date(getReminderDate(reminder)) < today ? "error" : "success";
};

export const getStatusKey = (reminder: Event): string => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const eventDate = new Date(getReminderDate(reminder));
    eventDate.setHours(0, 0, 0, 0);

    if (eventDate < today) return "overdue";
    if (eventDate.getTime() === today.getTime()) return "today";
    return "upcoming";
};