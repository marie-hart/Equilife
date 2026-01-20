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

export const fromDateInputValue = (value: string): string =>
  new Date(`${value}T00:00:00`).toISOString()