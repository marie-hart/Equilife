import type { Event } from "../types";

export const sortByDateAsc = (
  items: Event[],
  dateSelector: (item: Event) => string = (item) => item.event_date,
): Event[] =>
  [...items].sort(
    (a, b) =>
      new Date(dateSelector(a)).getTime() - new Date(dateSelector(b)).getTime(),
  );

export const startOfDay = (date: Date): Date => {
  const normalized = new Date(date);
  normalized.setHours(0, 0, 0, 0);
  return normalized;
};

export const isSameDayFilter = (dateString: string, selectedDate: string): boolean => {
  if (!selectedDate) return true;
  const date = new Date(dateString).toDateString();
  const target = new Date(`${selectedDate}T00:00:00`).toDateString();
  return date === target;
};

export const formatDateLong = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

export const formatDateMobile = (dateString: string): string => {
  const date = new Date(dateString);
  const currentYear = new Date().getFullYear();
  const monthShort = date
    .toLocaleDateString("fr-FR", { month: "short" })
    .replace(".", "");
  return date.getFullYear() !== currentYear
    ? `${date.getDate()} ${monthShort} ${date.getFullYear()}`
    : `${date.getDate()} ${monthShort}`;
};

export const isSameDay = (dateString: string, baseDate: Date): boolean => {
  const date = new Date(dateString);
  return date.toDateString() === baseDate.toDateString();
};

export const fromDateInputValue = (value?: string): string => {
  if (!value) return ''
  return value
}

export const toMonthKey = (dateString: string): string => {
  const date = new Date(dateString);
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${date.getFullYear()}-${month}`;
};

export const formatMonthLabel = (key: string): string => {
  const [year, month] = key.split("-").map(Number);
  const date = new Date(year, month - 1, 1);
  return date.toLocaleDateString("fr-FR", { month: "long", year: "numeric" });
};

export const getReminderDate = (reminder: Event): string =>
  reminder.next_reminder_date || reminder.event_date

export const toDateInputValue = (dateString: string): string => {
  const date = new Date(dateString)
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${date.getFullYear()}-${month}-${day}`
}