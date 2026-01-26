import { startOfDay, isSameDay, getReminderDate } from "./date"
import type { Event } from '@/types';

export const getStatusColor = (reminder: Event): 'error' | 'warning' | 'success' => {
  const today = startOfDay(new Date())
  if (isSameDay(getReminderDate(reminder), today)) {
    return 'warning'
  }
  return new Date(getReminderDate(reminder)) < today ? 'error' : 'success'
}

export const getStatusKey = (reminder: Event): 'overdue' | 'today' | 'upcoming' => {
  const today = startOfDay(new Date())
  if (isSameDay(getReminderDate(reminder), today)) {
    return 'today'
  }
  return new Date(getReminderDate(reminder)) < today ? 'overdue' : 'upcoming'
}